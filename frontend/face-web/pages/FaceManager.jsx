import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Camera, Upload, Download, FileCheck2, User, Shield, Scan, CheckCircle2,
    XCircle, Eye, EyeOff, Loader2, Users, Files, Lock, AlertTriangle, Zap,
    Info, Folder, FolderPlus, Trash2, ArrowLeft, TerminalSquare // Added for vault access state
} from 'lucide-react';

// Face Scanner Component with glass effect
const FaceScanner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
        <div className="relative">
            {/* Outer scanning ring */}
            <div className="w-40 h-40 border-2 border-gray-400/30 rounded-full animate-pulse"></div>
            {/* Inner scanning ring */}
            <div className="absolute inset-2 w-36 h-36 border-2 border-white/50 rounded-full animate-spin-slow"></div> {/* Changed to animate-spin-slow */}
            {/* Center scanner */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
                    <Scan className="text-white animate-pulse" size={24} />
                </div>
            </div>
            {/* Scanning lines */}
            <div className="absolute inset-0 w-40 h-40">
                {/* Adjusted animation for scanning lines for better visual */}
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-white/60 to-transparent animate-scan-line-v origin-top"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-scan-line-h"></div>
            </div>
        </div>
    </div>
);

export default function FaceManager() {
    const [mode, setMode] = useState('register');
    const [username, setUsername] = useState('');
    const [dataFiles, setDataFiles] = useState([]); // Changed to array for multiple files
    const [snapshots, setSnapshots] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [folderList, setFolderList] = useState([]);
    const [currentPath, setCurrentPath] = useState(''); // Stores the current folder path for navigation, relative to user's vault
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
    const [cameraOn, setCameraOn] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [hasAccessedVault, setHasAccessedVault] = useState(false); // New state to track if vault has been accessed

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input

    const API_BASE_URL = "http://localhost:8000"; // Node.js backend URL

    const modes = [
        {
            value: 'register',
            label: 'Register Face',
            icon: Users,
            gradient: 'from-gray-600 to-gray-800',
            description: 'Create a new biometric profile',
            accent: 'border-gray-400'
        },
        {
            value: 'upload',
            label: 'Upload Files',
            icon: Upload,
            gradient: 'from-gray-700 to-black',
            description: 'Secure file storage with verification',
            accent: 'border-gray-300'
        },
        {
            value: 'access',
            label: 'Access Vault',
            icon: Files,
            gradient: 'from-black to-gray-700',
            description: 'Retrieve your protected documents',
            accent: 'border-white'
        }
    ];

    // Utility to show messages in the main UI and trigger modal
    const displayMessage = useCallback((msg, type = 'info', modalTitle = '') => {
        setMessage(msg);
        setModalContent({
            title: modalTitle || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information'),
            message: msg,
            type: type
        });
        setShowModal(true);
    }, []);

    // Effect to manage camera stream
    useEffect(() => {
        let stream;
        const startCamera = async () => {
            try {
                // Request user-facing camera
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for the video to load metadata to ensure videoWidth/Height are available
                    await new Promise((resolve) => {
                        videoRef.current.onloadedmetadata = () => {
                            resolve();
                        };
                    });
                }
                setMessage('Camera active. Align face.');
                setCameraOn(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                setMessage('Camera access denied or unavailable.');
                setModalContent({
                    title: 'Camera Access Denied',
                    message: 'Unable to access camera. Please check browser permissions and try again. Ensure no other application is using the camera.',
                    type: 'error'
                });
                setShowModal(true);
                setCameraOn(false);
            }
        };

        if (cameraOn) {
            startCamera();
        } else {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraOn]);

    // Function to capture image as Blob from video feed
    const captureBlob = async () => {
        const vid = videoRef.current;
        const can = canvasRef.current;
        if (!vid || !can || vid.videoWidth === 0 || vid.videoHeight === 0) {
            displayMessage("Camera not ready or video stream not active for capture.", "error", "Camera Error");
            throw new Error("Video or canvas not ready for capture.");
        }
        can.width = vid.videoWidth;
        can.height = vid.videoHeight;
        const ctx = can.getContext('2d');
        ctx.drawImage(vid, 0, 0, can.width, can.height);
        return new Promise((resolve, reject) => {
            can.toBlob(blob => blob ? resolve(blob) : reject(new Error("Image capture failed.")), 'image/jpeg', 0.9);
        });
    };

    // Handles capturing a single snapshot for registration
    const captureView = async () => {
        if (snapshots.length >= 5) {
            setModalContent({
                title: 'Maximum Samples Reached',
                message: 'You have captured the maximum number of biometric samples (5). Please proceed with registration.',
                type: 'warning'
            });
            setShowModal(true);
            return;
        }

        if (!cameraOn) {
            setCameraOn(true);
            // Give camera a moment to activate after setting cameraOn true
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!videoRef.current?.srcObject || videoRef.current.videoWidth === 0) {
                setModalContent({
                    title: 'Camera Not Ready',
                    message: 'The camera could not be activated for capture. Please ensure permissions are granted and try again.',
                    type: 'error'
                });
                setShowModal(true);
                return;
            }
        }

        try {
            displayMessage('Capturing biometric sample...');
            const blob = await captureBlob();
            setSnapshots(prev => [...prev, blob]);
            displayMessage(`Biometric sample ${snapshots.length + 1} captured successfully.`, 'info');
        } catch (e) {
            displayMessage(`Capture failed: ${e.message}`, 'error', 'Capture Error');
        }
    };

    // Generic function to prepare for biometric scan and then submit an action
    // This function now specifically indicates if a face scan is required.
    const prepareForScanAndSubmit = async (actionFn, requiresFaceScan = true) => {
        if (!username.trim()) {
            setModalContent({
                title: 'Security ID Required',
                message: 'Please enter your Security ID (username) to proceed with the operation.',
                type: 'warning'
            });
            setShowModal(true);
            return;
        }

        setIsProcessing(true);
        let faceBlob = null;

        if (requiresFaceScan) {
            setIsScanning(true);
            setCameraOn(true); // Ensure camera is activated for verification

            // Give camera time to warm up and get stream
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (!videoRef.current?.srcObject || videoRef.current.videoWidth === 0) {
                setModalContent({
                    title: 'Camera Not Ready',
                    message: 'The camera could not be activated for verification. Please ensure permissions are granted and try again.',
                    type: 'error'
                });
                setShowModal(true);
                setIsProcessing(false);
                setIsScanning(false);
                return;
            }
            try {
                faceBlob = await captureBlob();
            } catch (e) {
                displayMessage(`Face capture for verification failed: ${e.message}`, 'error', 'Verification Error');
                setIsProcessing(false);
                setIsScanning(false);
                setCameraOn(false);
                return; // Exit if face capture fails
            }
        }

        try {
            await actionFn(faceBlob); // Execute the specific action with/without the captured face
        } catch (e) {
            console.error("Operation failed:", e);
            let errorMessage = 'An unexpected error occurred during the operation.';
            // Axios errors from Node.js proxy (which in turn gets from FastAPI)
            if (e && e.message) { // Generic JS Error, or message from Node.js proxy
                errorMessage = e.message;
            } else if (e.detail && e.detail.message) { // FastAPI's HTTPException detail structure (if not caught by Node.js first)
                errorMessage = e.detail.message;
            }
            setModalContent({
                title: 'Operation Failed',
                message: errorMessage,
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setIsScanning(false);
            setIsProcessing(false);
            setCameraOn(false); // Turn off camera after operation
        }
    };

    // Handles the primary submit action (Register, Upload, Access)
    const handleSubmit = async () => {
        if (mode === 'register') {
            if (!username.trim()) {
                setModalContent({
                    title: 'Security ID Required',
                    message: 'Please enter your Security ID (username) to proceed with registration.',
                    type: 'warning'
                });
                setShowModal(true);
                return;
            }
            if (snapshots.length < 3) {
                setModalContent({
                    title: 'Insufficient Biometric Data',
                    message: `Please capture at least 3 biometric samples for a complete registration. You have ${snapshots.length}.`,
                    type: 'warning'
                });
                setShowModal(true);
                return;
            }

            setIsProcessing(true);
            setIsScanning(false); // No scanner overlay during registration processing
            setCameraOn(false); // Ensure camera is off during heavy processing

            const form = new FormData();
            form.append('username', username);
            snapshots.forEach((blob, i) => form.append('faces', blob, `biometric_${i + 1}.jpg`));

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    body: form,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                displayMessage(data.message, 'success', 'Registration Complete');
                setSnapshots([]);
                setUsername(''); // Clear username after successful registration
            } catch (e) {
                console.error("Registration failed:", e);
                displayMessage(e.message, 'error', 'Registration Failed');
            } finally {
                setIsProcessing(false);
            }
        } else if (mode === 'upload') {
            await prepareForScanAndSubmit(async (faceBlob) => { // Requires face scan
                if (dataFiles.length === 0) {
                    throw new Error("Please select files to upload.");
                }

                const form = new FormData();
                form.append('username', username);
                form.append('face', faceBlob, 'verification.jpg');
                dataFiles.forEach(file => form.append('user_files', file, file.name));
                form.append('current_folder', currentPath || '/'); // Send current folder

                const response = await fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    body: form,
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Upload failed');
                }
                displayMessage(data.message, 'success', 'Upload Successful');
                setDataFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear file input
                }
                // After successful upload, refresh the file list using only username and path
                await fetchFilesAndFolders(username, currentPath); // No face blob needed for this fetch
            });
        } else if (mode === 'access') {
            if (!username.trim()) {
                setModalContent({
                    title: 'Security ID Required',
                    message: 'Please enter your Security ID (username) to access the vault.',
                    type: 'warning'
                });
                setShowModal(true);
                return;
            }
            // First time accessing the vault, require face scan
            if (!hasAccessedVault) {
                await prepareForScanAndSubmit(async (faceBlob) => { // Requires face scan
                    await fetchFilesAndFolders(username, currentPath, faceBlob);
                    setHasAccessedVault(true); // Mark vault as accessed after successful auth
                });
            } else {
                // Subsequent access or navigation, no face scan needed
                await fetchFilesAndFolders(username, currentPath);
            }
        }
    };

    // Fetches files and folders for the current path
    // Now takes an optional faceBlob, to be used only if initial access authentication is needed
    const fetchFilesAndFolders = useCallback(async (user, path, faceBlob = null) => {
        if (!user.trim()) {
            return; // Should be handled by calling functions
        }
        
        setIsProcessing(true); // Still show processing, but not scanning overlay

        const form = new FormData();
        form.append('username', user);
        form.append('path', path || '/');

        // Only append face if it's provided (i.e., during initial access authentication)
        if (faceBlob) {
            form.append('face', faceBlob, 'verification.jpg');
            setIsScanning(true); // Show scanning overlay only when face is sent
        } else {
            setIsScanning(false); // No scanning overlay
        }


        try {
            const response = await fetch(`${API_BASE_URL}/access`, {
                method: 'POST',
                body: form,
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch files and folders.');
            }
            setFileList(data.files);
            setFolderList(data.folders);
            setCurrentPath(path); // Update current path
            displayMessage(data.message || 'Files loaded successfully.', 'success', 'Files Loaded');
        } catch (e) {
            console.error("Failed to fetch files/folders:", e);
            displayMessage(e.message, 'error', 'Access Denied');
            setFileList([]);
            setFolderList([]);
            // On access denied, reset hasAccessedVault so next attempt requires re-authentication
            setHasAccessedVault(false);
        } finally {
            setIsProcessing(false);
            setIsScanning(false);
            setCameraOn(false); // Ensure camera is off
        }
    }, [API_BASE_URL, displayMessage]);


    // Handles downloading a file
    const downloadFile = async (fileName) => {
        await prepareForScanAndSubmit(async (faceBlob) => { // Requires face scan
            const form = new FormData();
            form.append('username', username);
            const filePathForBackend = currentPath ? `${currentPath}/${fileName}` : fileName;
            form.append('filename', filePathForBackend);
            form.append('face', faceBlob, 'download_verification.jpg');

            const response = await fetch(`${API_BASE_URL}/download`, {
                method: 'POST',
                body: form,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Download failed');
            }

            const contentDisposition = response.headers.get('Content-Disposition');
            let downloadFileName = fileName;
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const filenameMatch = contentDisposition.match(/filename\*?=['"]?(.*?)['"]?$/i);
                if (filenameMatch && filenameMatch[1]) {
                    downloadFileName = decodeURIComponent(filenameMatch[1]);
                }
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            displayMessage(`'${fileName}' downloaded successfully.`, 'success', 'Download Complete');
        });
    };

    // Handle folder navigation
    const navigateToFolder = async (folderName) => {
        if (!username.trim()) {
            displayMessage('Security ID is required to navigate.', 'warning');
            return;
        }
        const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        // Navigation does not require face scan
        await fetchFilesAndFolders(username, newPath); // No face blob needed
    };

    const navigateUp = async () => {
        if (!username.trim()) {
            displayMessage('Security ID is required to navigate.', 'warning');
            return;
        }
        const parentPathSegments = currentPath.split('/').filter(segment => segment !== '');
        if (parentPathSegments.length === 0) {
            displayMessage("Already at the root directory.", "info");
            return;
        }
        const parentPath = parentPathSegments.slice(0, -1).join('/');
        // Navigation does not require face scan
        await fetchFilesAndFolders(username, parentPath); // No face blob needed
    };

    // Handle creating a new folder
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            setModalContent({
                title: 'Folder Name Required',
                message: 'Please enter a name for the new folder.',
                type: 'warning'
            });
            setShowModal(true);
            return;
        }

        setShowCreateFolderModal(false); // Close the modal immediately

        await prepareForScanAndSubmit(async (faceBlob) => { // Requires face scan
            const form = new FormData();
            form.append('username', username);
            form.append('folder_name', newFolderName);
            form.append('parent_path', currentPath || '/'); // Send current folder as parent
            form.append('face', faceBlob, 'verification.jpg');

            const response = await fetch(`${API_BASE_URL}/create_folder`, {
                method: 'POST',
                body: form,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Folder creation failed');
            }

            displayMessage(data.message, 'success', 'Folder Created');
            setNewFolderName('');
            await fetchFilesAndFolders(username, currentPath); // Refresh current folder view (no face needed)
        });
    };

    // Handle deleting a file
    const handleDeleteFile = async (fileName) => {
        if (!window.confirm(`Are you sure you want to delete '${fileName}'? This action cannot be undone.`)) {
            return;
        }

        await prepareForScanAndSubmit(async (faceBlob) => { // Requires face scan
            const form = new FormData();
            form.append('username', username);
            const fileToDeletePath = currentPath ? `${currentPath}/${fileName}` : fileName;
            form.append('file_to_delete', fileToDeletePath);
            form.append('face', faceBlob, 'verification.jpg');

            const response = await fetch(`${API_BASE_URL}/delete_file`, {
                method: 'DELETE',
                body: form,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'File deletion failed');
            }

            displayMessage(data.message, 'success', 'File Deleted');
            await fetchFilesAndFolders(username, currentPath); // Refresh current folder view (no face needed)
        });
    };

    // Handle deleting a folder
    const handleDeleteFolder = async (folderName) => {
        if (!window.confirm(`Are you sure you want to delete the folder '${folderName}' and ALL its contents? This action cannot be undone.`)) {
            return;
        }

        await prepareForScanAndSubmit(async (faceBlob) => { // Requires face scan
            const form = new FormData();
            form.append('username', username);
            const folderToDeletePath = currentPath ? `${currentPath}/${folderName}` : folderName;
            form.append('folder_to_delete', folderToDeletePath);
            form.append('face', faceBlob, 'verification.jpg');

            const response = await fetch(`${API_BASE_URL}/delete_folder`, {
                method: 'DELETE',
                body: form,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Folder deletion failed');
            }

            displayMessage(data.message, 'success', 'Folder Deleted');
            await fetchFilesAndFolders(username, currentPath); // Refresh current folder view (no face needed)
        });
    };


    const currentMode = modes.find(m => m.value === mode);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden font-sans">
            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2c30;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
        @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes scan-line-v {
            0% { transform: translateY(-100%); }
            50% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
        }
        @keyframes scan-line-h {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .animate-spin-slow {
            animation: spin-slow 8s linear infinite; /* Adjusted duration for slower spin */
        }
        .animate-scan-line-v {
            animation: scan-line-v 3s linear infinite;
        }
        .animate-scan-line-h {
            animation: scan-line-h 3s linear infinite reverse;
        }
        /* Basic Tailwind-like classes for buttons for demonstration if not using full Tailwind setup */
        .btn-primary {
            @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-secondary {
            @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-action {
            @apply flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-icon-sm {
            @apply p-2 rounded-full hover:bg-gray-700 transition-colors duration-200;
        }
        /* Keyframe for blob background */
        @keyframes blob {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob {
            animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.23, 1);
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animate-scale-in {
            animation: scaleIn 0.3s ease-out forwards;
        }
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
            `}</style>
            <div className="absolute inset-0 z-0 opacity-10">
                {/* Background futuristic patterns - example */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-white">
                <div className="w-full max-w-4xl bg-gray-900/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8 space-y-8">
                    <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
                        Biometric Vault
                    </h1>

                    {/* Mode Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {modes.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => {
                                    setMode(m.value);
                                    setMessage('');
                                    setSnapshots([]);
                                    setDataFiles([]);
                                    setFileList([]);
                                    setFolderList([]);
                                    setCurrentPath('');
                                    setCameraOn(false); // Turn off camera when changing mode
                                    setIsProcessing(false); // Reset processing state
                                    setIsScanning(false); // Reset scanning state
                                    setHasAccessedVault(false); // Reset vault access state on mode change
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = ''; // Clear file input
                                    }
                                }}
                                className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-300
                                    bg-gradient-to-br ${m.gradient} hover:scale-105 transform
                                    ${mode === m.value ? 'ring-2 ring-offset-2 ring-purple-500 ' + m.accent : 'ring-1 ring-gray-600'}
                                    shadow-lg hover:shadow-xl group
                                `}
                            >
                                <m.icon className={`w-8 h-8 mb-2 transition-transform duration-300 ${mode === m.value ? 'text-purple-300 scale-110' : 'text-gray-400 group-hover:text-white'}`} />
                                <span className="font-semibold text-lg">{m.label}</span>
                                <p className="text-xs text-gray-400 mt-1">{m.description}</p>
                            </button>
                        ))}
                    </div>

                    <div className="bg-gray-800/60 rounded-2xl p-6 shadow-inner border border-gray-700 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-blue-300 flex items-center gap-2">
                                <currentMode.icon className="w-6 h-6" /> {currentMode.label}
                            </h2>
                            {isProcessing && (
                                <Loader2 className="animate-spin text-purple-400" size={24} />
                            )}
                        </div>

                        {/* Common Controls */}
                        <div className="space-y-4">
                            <div className="relative">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                                    Security ID (Username)
                                </label>
                                <div className="flex items-center bg-gray-700 rounded-lg p-2 border border-gray-600">
                                    <User className="text-gray-400 mr-2" size={20} />
                                    <input
                                        type="text"
                                        id="username"
                                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                                        placeholder="Enter your unique ID"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setHasAccessedVault(false); // Reset access state if username changes
                                            setFileList([]);
                                            setFolderList([]);
                                            setCurrentPath('');
                                        }}
                                        disabled={isProcessing}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Camera Feed */}
                        <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
                            {cameraOn ? (
                                <>
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                                    {isScanning && <FaceScanner />} {/* Show scanner during processing that requires face */}
                                </>
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <Camera size={48} />
                                    <span>Camera Off</span>
                                    {/* Optional: Add a button to turn camera on if needed for capture outside main flow */}
                                    { (mode === 'register' && snapshots.length < 5 && !isProcessing) && (
                                        <button onClick={() => setCameraOn(true)} className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                                            Turn Camera On
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mode-Specific UI */}
                        {mode === 'register' && (
                            <div className="space-y-4">
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={captureView}
                                        className="btn-primary"
                                        disabled={isProcessing || snapshots.length >= 5}
                                    >
                                        <Camera size={20} /> Capture Sample ({snapshots.length}/5)
                                    </button>
                                    <button
                                        onClick={() => setSnapshots([])}
                                        className="btn-secondary"
                                        disabled={isProcessing || snapshots.length === 0}
                                    >
                                        <Trash2 size={20} /> Clear Samples
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 max-h-24 overflow-y-auto custom-scrollbar">
                                    {snapshots.map((blob, index) => (
                                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-green-500">
                                            <img src={URL.createObjectURL(blob)} alt={`snapshot-${index}`} className="w-full h-full object-cover" />
                                            <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">#{index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    className="btn-action w-full mt-4"
                                    disabled={isProcessing || snapshots.length < 1} // Can register with 1, but suggest more
                                >
                                    <Shield size={20} /> {isProcessing ? 'Registering...' : 'Complete Registration'}
                                </button>
                            </div>
                        )}

                        {mode === 'upload' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Select Files to Upload
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setDataFiles(Array.from(e.target.files))}
                                    className="block w-full text-sm text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-purple-50 file:text-purple-700
                                        hover:file:bg-purple-100 cursor-pointer"
                                    ref={fileInputRef}
                                    disabled={isProcessing}
                                />
                                {dataFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-400">
                                        Selected: {dataFiles.map(f => f.name).join(', ')}
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    className="btn-action w-full mt-4"
                                    disabled={isProcessing || dataFiles.length === 0}
                                >
                                    <Upload size={20} /> {isProcessing ? 'Uploading...' : 'Upload Files'}
                                </button>
                            </div>
                        )}

                        {mode === 'access' && (
                            <div className="space-y-4">
                                <button
                                    onClick={handleSubmit}
                                    className="btn-action w-full"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : hasAccessedVault ? 'Refresh Vault' : 'Access Vault'}
                                    {hasAccessedVault && <TerminalSquare size={20} className="ml-2" />}
                                </button>

                                {/* File/Folder List Display */}
                                {username.trim() && hasAccessedVault && (
                                    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600 custom-scrollbar max-h-80 overflow-y-auto">
                                        <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <Files size={20} /> Vault Contents: /{currentPath}
                                            </span>
                                            {currentPath && (
                                                <button onClick={navigateUp} className="btn-icon-sm text-gray-300 hover:text-white">
                                                    <ArrowLeft size={20} /> <span className="sr-only">Go Up</span>
                                                </button>
                                            )}
                                        </h3>

                                        <div className="flex flex-col gap-2">
                                            {folderList.length > 0 && (
                                                <>
                                                    <h4 className="text-gray-400 text-sm font-semibold mt-2 flex items-center gap-1">
                                                        <Folder size={16} /> Folders
                                                    </h4>
                                                    {folderList.map((folder, index) => (
                                                        <div key={`folder-${index}`} className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-md p-2 transition-colors">
                                                            <button
                                                                onClick={() => navigateToFolder(folder)}
                                                                className="flex items-center text-left flex-grow text-blue-300 hover:text-blue-200"
                                                            >
                                                                <Folder className="mr-2" size={20} /> {folder}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteFolder(folder)}
                                                                className="btn-icon-sm text-red-400 hover:text-red-300"
                                                                title={`Delete folder ${folder}`}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            {fileList.length > 0 && (
                                                <>
                                                    <h4 className="text-gray-400 text-sm font-semibold mt-4 flex items-center gap-1">
                                                        <FileCheck2 size={16} /> Files
                                                    </h4>
                                                    {fileList.map((file, index) => (
                                                        <div key={`file-${index}`} className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-md p-2 transition-colors">
                                                            <span className="flex items-center flex-grow">
                                                                <FileCheck2 className="mr-2 text-green-300" size={20} /> {file}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => downloadFile(file)}
                                                                    className="btn-icon-sm text-blue-400 hover:text-blue-300"
                                                                    title={`Download ${file}`}
                                                                >
                                                                    <Download size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteFile(file)}
                                                                    className="btn-icon-sm text-red-400 hover:text-red-300"
                                                                    title={`Delete file ${file}`}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                            {(fileList.length === 0 && folderList.length === 0) && (
                                                <p className="text-gray-400 italic text-center">This folder is empty.</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowCreateFolderModal(true)}
                                            className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
                                        >
                                            <FolderPlus size={20} /> Create New Folder
                                        </button>
                                    </div>
                                )}
                                {username.trim() && !hasAccessedVault && (
                                    <p className="text-gray-400 text-center">Click "Access Vault" above to authenticate and view your files.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Messages */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className={`bg-gray-800 rounded-xl p-6 shadow-2xl border ${modalContent.type === 'error' ? 'border-red-600' : modalContent.type === 'success' ? 'border-green-600' : 'border-blue-600'} w-full max-w-sm text-center transform scale-95 animate-scale-in`}>
                        {modalContent.type === 'success' && <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />}
                        {modalContent.type === 'error' && <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />}
                        {modalContent.type === 'warning' && <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />}
                        {modalContent.type === 'info' && <Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />}
                        <h3 className="text-2xl font-bold mb-3 text-white">{modalContent.title}</h3>
                        <p className="text-gray-300 mb-6">{modalContent.message}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all
                                ${modalContent.type === 'error' ? 'bg-red-500 hover:bg-red-600' : modalContent.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
                                text-white shadow-md`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Create Folder Modal */}
            {showCreateFolderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-600 w-full max-w-sm text-center transform scale-95 animate-scale-in">
                        <h3 className="text-2xl font-bold mb-4 text-white flex items-center justify-center gap-2">
                            <FolderPlus size={24} /> Create New Folder
                        </h3>
                        <p className="text-gray-300 mb-4">Enter a name for the new folder:</p>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="New folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                        />
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowCreateFolderModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                className="btn-action"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

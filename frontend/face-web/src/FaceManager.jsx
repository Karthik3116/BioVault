
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Files,
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Lock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Utility: Blob → Base64
const blobToBase64 = (blob) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      res(base64data);
    };
    reader.onerror = rej;
    reader.readAsDataURL(blob);
  });

// FaceScanner overlay
const FaceScanner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
    <div className="relative">
      <div className="w-40 h-40 border-2 border-gray-400/30 rounded-full animate-pulse"></div>
      <div className="absolute inset-2 w-36 h-36 border-2 border-white/50 rounded-full animate-spin-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
          <Scan className="text-white animate-pulse" size={24} />
        </div>
      </div>
      <div className="absolute inset-0 w-40 h-40">
        <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-white/60 to-transparent animate-scan-line-v origin-top"></div>
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent animate-scan-line-h"></div>
      </div>
    </div>
  </div>
);

export default function FaceManager({ username, setIsLoggedIn }) {
  const [mode, setMode] = useState('access');
  const [dataFiles, setDataFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
  const [cameraOn, setCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [authFailed, setAuthFailed] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE;

;
  const modes = [
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
  const currentMode = modes.find((m) => m.value === mode);

  const displayMessage = useCallback((msg, type = 'info', title = '') => {
    setModalContent({
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information'),
      message: msg,
      type
    });
    setShowModal(true);
  }, []);

  // Camera logic
  useEffect(() => {
    let stream;
    if (cameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          videoRef.current.srcObject = s;
          return new Promise((r) => videoRef.current.onloadedmetadata = r);
        })
        .then(() => setCameraOn(true))
        .catch(() => {
          displayMessage('Unable to access camera.', 'error', 'Camera Error');
          setCameraOn(false);
        });
    } else {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      videoRef.current && (videoRef.current.srcObject = null);
    }
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [cameraOn, displayMessage]);

  const captureBlob = async () => {
    const vid = videoRef.current;
    const can = canvasRef.current;
    if (!vid || !can) throw new Error('Camera not ready.');
    can.width = vid.videoWidth;
    can.height = vid.videoHeight;
    can.getContext('2d').drawImage(vid, 0, 0);
    return new Promise((res, rej) =>
      can.toBlob((b) => (b ? res(b) : rej(new Error('Capture failed'))), 'image/jpeg', 0.9)
    );
  };

  const getToken = () => localStorage.getItem('jwtToken');
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const verifyFace = async (capturedBlob) => {
  try {
    const form = new FormData();
    form.append('face', capturedBlob, 'face.jpg');
    
    const response = await fetch(`${API_BASE}/api/verify_face`, {
      method: 'POST',
      headers: authHeader(), // JWT will be sent here
      body: form
    });
    
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Face verification error:', error);
    return false;
  }
};

  const prepareAndRun = async (actionFn) => {
    if (!getToken()) {
      displayMessage('Please log in first.', 'error', 'Auth Required');
      return navigate('/login');
    }

    // Start processing flow
    setIsProcessing(true);
    setAuthFailed(false);
    setProcessingMessage('Initializing camera...');
    setCameraOn(true);
    
    try {
      // Wait for camera to initialize
      await new Promise((resolve) => {
        const checkReady = () => {
          if (videoRef.current?.readyState === 4) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });

      // Start scanning animation
      setProcessingMessage('Scanning face...');
      setIsScanning(true);
      await new Promise((r) => setTimeout(r, 1500));

      // Capture face
      setProcessingMessage('Capturing image...');
      const faceBlob = await captureBlob();

      // Verify face before proceeding
      setProcessingMessage('Verifying identity...');
      const isVerified = await verifyFace(faceBlob);
      
      if (!isVerified) {
        setAuthFailed(true);
        throw new Error('Face authentication failed. Please try again.');
      }

      // Process with backend if verification succeeded
      await actionFn(faceBlob);

    } catch (e) {
      if (!authFailed) {
        displayMessage(e.message || 'Operation failed.', 'error');
      }
      throw e;
    } finally {
      // Cleanup
      setIsProcessing(false);
      setIsScanning(false);
      setCameraOn(false);
      setProcessingMessage('');
    }
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'upload') {
        if (!dataFiles.length) {
          return displayMessage('Select files first.', 'error');
        }
        await prepareAndRun(async (faceBlob) => {
          const form = new FormData();
          form.append('face', faceBlob, 'face.jpg');
          dataFiles.forEach((f) => form.append('user_files', f, f.name));
          form.append('current_folder', '');
          
          const res = await fetch(`${API_BASE}/api/vault/upload`, {
            method: 'POST',
            headers: authHeader(),
            body: form
          });
          
          const json = await res.json();
          if (!res.ok) throw new Error(json.message);
          
          displayMessage(json.message, 'success');
          setDataFiles([]);
          fileInputRef.current.value = '';
        });
      } else {
        await prepareAndRun(async (faceBlob) => {
          const form = new FormData();
          form.append('face', faceBlob, 'face.jpg');
          form.append('path', '');
          
          const res = await fetch(`${API_BASE}/api/vault/access`, {
            method: 'POST',
            headers: authHeader(),
            body: form
          });
          
          const json = await res.json();
          if (!res.ok) throw new Error(json.message);
          
          localStorage.setItem('lastVerifiedFace', await blobToBase64(faceBlob));
          displayMessage('Access granted. Redirecting...', 'success');
          
          // Small delay before navigation for better UX
          setTimeout(() => navigate('/library'), 1500);
        });
      }
    } catch (error) {
      if (authFailed) {
        displayMessage('Authentication failed. Please try again.', 'error', 'Verification Failed');
      }
      console.error('Operation failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <style jsx>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes scan-line-v { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes scan-line-h { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-scan-line-v { animation: scan-line-v 3s linear infinite; }
        .animate-scan-line-h { animation: scan-line-h 3s linear infinite reverse; }

        .btn-primary {
          @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-secondary {
          @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-action {
          @apply flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:from-blue-600 hover:to-purple-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #2a2c30; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #777; }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center flex-grow p-4 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl bg-gray-900/70 backdrop-blur-lg rounded-3xl p-8 space-y-8">
          <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Biometric Vault
          </h1>

          {/* Navbar */}
          <div className="flex justify-between items-center bg-gray-800/50 rounded-xl p-4 mb-8">
            <span className="flex items-center gap-2 text-xl text-gray-300">
              <User size={20} /> {username}
            </span>
            <button onClick={handleLogout} className="btn-secondary">
              <Lock size={16} /> Logout
            </button>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setMode(m.value);
                  setDataFiles([]);
                  setCameraOn(false);
                  setIsProcessing(false);
                  setIsScanning(false);
                  fileInputRef.current && (fileInputRef.current.value = '');
                }}
                className={`p-4 rounded-xl bg-gradient-to-br ${m.gradient} hover:scale-105 transform ${
                  mode === m.value ? `ring-2 ring-offset-2 ring-purple-500 ${m.accent}` : 'ring-1 ring-gray-600'
                } transition duration-300`}
                disabled={isProcessing}
              >
                <m.icon className="w-8 h-8 mb-2" />
                <div className="font-semibold text-lg">{m.label}</div>
                <div className="text-xs text-gray-400">{m.description}</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-gray-800/60 rounded-2xl p-6 flex-grow overflow-y-auto custom-scrollbar space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-2 text-2xl text-blue-300">
                <currentMode.icon /> {currentMode.label}
              </h2>
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="animate-spin" size={18} />
                  <span>{processingMessage}</span>
                </div>
              )}
            </div>

            {/* Camera Feed */}
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
              {cameraOn ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {isScanning && <FaceScanner />}
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Camera size={48} />
                  <span>Camera {isProcessing ? 'Initializing...' : 'Off'}</span>
                </div>
              )}
            </div>

            {/* Mode-specific UI */}
            {mode === 'upload' ? (
              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => setDataFiles(Array.from(e.target.files))}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  disabled={isProcessing}
                />
                {dataFiles.length > 0 && (
                  <div className="text-sm text-gray-400">
                    Selected: {dataFiles.map((f) => f.name).join(', ')}
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  className="btn-action w-full"
                  disabled={isProcessing || !dataFiles.length}
                >
                  <Upload size={20} /> {isProcessing ? 'Processing...' : 'Upload Files'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-gray-400 mb-4">
                  Click below to verify and enter your vault.
                </p>
                <button
  onClick={handleSubmit}
  className="
    relative /* Added for spinner positioning */
    btn-action /* Your existing class, ensure it sets basic styles */
    w-full
    py-3 /* Increased padding for better appearance */
    bg-blue-600 hover:bg-blue-700 /* Vibrant blue with darker hover */
    text-white /* White text for contrast */
    font-semibold /* Slightly bolder text */
    rounded-lg /* Nice rounded corners */
    shadow-md hover:shadow-lg /* Subtle shadow for depth */
    transition-all duration-300 ease-in-out /* Smooth transitions for color and shadow */
    flex items-center justify-center gap-2 /* For icon and text alignment */
    overflow-hidden /* Hide overflow for potential future effects */
  "
  disabled={isProcessing}
>
  {isProcessing ? (
    <>
      {/* Lucide Loader2 icon for a smooth spinner */}
      <Loader2 size={20} className="animate-spin" />
      <span className="ml-2">Processing...</span>
    </>
  ) : (
    <span>Access Vault</span>
  )}
</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className={`bg-gray-800 p-6 rounded-xl text-center space-y-4 max-w-sm w-full transform scale-95 animate-scale-in border ${
              modalContent.type === 'error'
                ? 'border-red-600'
                : modalContent.type === 'success'
                ? 'border-green-600'
                : 'border-blue-600'
            }`}
          >
            {modalContent.type === 'success' && <CheckCircle2 className="mx-auto text-green-500" size={48} />}
            {modalContent.type === 'error' && <XCircle className="mx-auto text-red-500" size={48} />}
            {modalContent.type === 'warning' && <AlertTriangle className="mx-auto text-yellow-500" size={48} />}
            {modalContent.type === 'info' && <Info className="mx-auto text-blue-500" size={48} />}
            <h3 className="text-2xl font-bold text-white">{modalContent.title}</h3>
            <p className="text-gray-300">{modalContent.message}</p>
            <button 
              onClick={() => {
                setShowModal(false);
                if (modalContent.type === 'success' && mode === 'access') {
                  // Navigation is already handled in the success case
                }
              }} 
              className="btn-primary"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
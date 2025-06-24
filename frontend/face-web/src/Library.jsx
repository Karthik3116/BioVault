
import React, { useState, useEffect, useCallback } from 'react';
import {
  Files, Folder, ArrowLeft, FolderPlus, Trash2, Download,
  FileText, FileImage, File, FileCode, FileAudio, FileVideo,
  FileSpreadsheet, FileSliders, Archive, Binary,
  User, Lock, CheckCircle2, XCircle, AlertTriangle, Info, Loader2, RefreshCw // Changed TerminalSquare to RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Convert Base64 string to Blob
const base64ToBlob = (base64) => {
  try {
    // Attempt to infer mime type for common images, default to 'application/octet-stream' for others
    const mimeType = base64.startsWith('/9j/') ? 'image/jpeg' : // JPEG
                     base64.startsWith('iVBORw0KGgo') ? 'image/png' : // PNG
                     base64.startsWith('R0lGODlh') ? 'image/gif' : // GIF
                     'application/octet-stream'; // Default or unknown

    const bytes = atob(base64);
    const len = bytes.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = bytes.charCodeAt(i);
    return new Blob([buf], { type: mimeType });
  } catch (e) {
    console.error("Error converting base64 to blob:", e);
    return null;
  }
};

// Pick icon based on file extension
const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (['txt', 'log', 'md', 'csv', 'doc', 'docx', 'pdf'].includes(ext))
    return <FileText size={40} className="text-gray-400" />;
  if (['xls', 'xlsx'].includes(ext))
    return <FileSpreadsheet size={40} className="text-green-500" />;
  if (['ppt', 'pptx'].includes(ext))
    return <FileSliders size={40} className="text-orange-500" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext))
    return <FileImage size={40} className="text-blue-400" />;
  if (['mp3', 'wav', 'aac', 'flac'].includes(ext))
    return <FileAudio size={40} className="text-purple-400" />;
  if (['mp4', 'avi', 'mov', 'mkv'].includes(ext))
    return <FileVideo size={40} className="text-green-400" />;
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'xml', 'yml', 'go','java','c','cpp'].includes(ext))
    return <FileCode size={40} className="text-orange-400" />;
  if (['zip', 'rar', '7z'].includes(ext))
    return <Archive size={40} className="text-yellow-400" />;
  if (['exe', 'app', 'bin'].includes(ext))
    return <Binary size={40} className="text-red-700" />;
  return <File size={40} className="text-gray-400" />;
};

export default function Library({ setIsLoggedIn }) {
  const [fileList, setFileList] = useState([]);
  const [folderList, setFolderList] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE; // Assuming this API endpoint is correct for your backend

  // JWT header
  const token = localStorage.getItem('jwtToken');
  const authHeaders = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Modal helper function for displaying messages and confirmations
  const showCustomModal = useCallback((title, msg, type = 'info', onConfirm = null, onCancel = null) => {
    setModalContent({ title, msg, type, onConfirm, onCancel });
    setShowModal(true);
  }, []);

  // Fetch contents of the current directory
  const fetchContents = useCallback(async (path) => {
    setIsProcessing(true);
    const faceB64 = localStorage.getItem('lastVerifiedFace');
    if (!token || !faceB64) {
      showCustomModal('Authentication Required', 'Please verify your face to access the vault.', 'warning', () => navigate('/vault'));
      setIsProcessing(false);
      return;
    }

    const form = new FormData();
    form.append('path', path || '/');
    const blob = base64ToBlob(faceB64);
    if (!blob) {
      showCustomModal('Error', 'Failed to decode face data. Please re-verify.', 'error', () => navigate('/vault'));
      setIsProcessing(false);
      return;
    }
    form.append('face', blob, 'face.jpg');

    try {
      const res = await fetch(`${API}/api/vault/access`, {
        method: 'POST',
        headers: authHeaders(),
        body: form
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch vault contents.');
      }
      setFileList(data.files || []);
      setFolderList(data.folders || []);
      setCurrentPath(path);
      setSelectedItems([]); // Clear selection on path change
    } catch (e) {
      showCustomModal('Error', e.message, 'error', () => setShowModal(false));
    } finally {
      setIsProcessing(false);
    }
  }, [API, token, authHeaders, navigate, showCustomModal]);

  // Effect to fetch contents on component mount or path change
  useEffect(() => {
    fetchContents(currentPath);
  }, [fetchContents, currentPath]);

  // Navigation: Go up one level in the directory
  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (!parts.length) return; // Already at root
    fetchContents(parts.slice(0, -1).join('/'));
  };

  // Utility function to execute a single file download
  const executeDownload = useCallback(async (name) => {
    const form = new FormData();
    const faceB64 = localStorage.getItem('lastVerifiedFace');
    if (!faceB64) {
      throw new Error('Face verification data missing. Please re-verify.');
    }
    form.append('filename', currentPath ? `${currentPath}/${name}` : name);
    form.append('face', base64ToBlob(faceB64), 'face.jpg');

    const res = await fetch(`${API}/api/vault/download`, {
      method: 'POST',
      headers: authHeaders(),
      body: form
    });
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      let errorMessage = `Failed to download "${name}".`;
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        errorMessage = data.message || errorMessage;
      } else {
        // If not JSON, it might be an HTML error page or plain text
        errorMessage = await res.text();
        // If the text is long, truncate it for the modal
        if (errorMessage.length > 500) {
          errorMessage = errorMessage.substring(0, 497) + '... (Full error in console)';
          console.error("Full download error response:", errorMessage);
        }
      }
      throw new Error(errorMessage);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url); // Clean up the object URL
  }, [API, currentPath, authHeaders]);

  // Handler for single file download initiated by UI
  const handleDownloadOne = useCallback((name) => {
    showCustomModal(
      'Download Confirmation',
      `Are you sure you want to download "${name}"?`,
      'info',
      async () => {
        setIsProcessing(true);
        try {
          await executeDownload(name);
          showCustomModal('Download Successful', `"${name}" has been downloaded.`, 'success');
        } catch (e) {
          showCustomModal('Download Error', e.message, 'error');
        } finally {
          setIsProcessing(false);
        }
      },
      () => setShowModal(false) // On cancel
    );
  }, [executeDownload, showCustomModal]);


  // Utility function to execute a single delete operation
  const executeDelete = useCallback(async (name, isFolder) => {
    const form = new FormData();
    const faceB64 = localStorage.getItem('lastVerifiedFace');
    if (!faceB64) {
      throw new Error('Face verification data missing. Please re-verify.');
    }
    form.append(isFolder ? 'folder_to_delete' : 'file_to_delete',
      currentPath ? `${currentPath}/${name}` : name);
    form.append('face', base64ToBlob(faceB64), 'face.jpg');

    const url = `${API}/api/vault/${isFolder ? 'delete_folder' : 'delete_file'}`;
    const res = await fetch(url, { method: 'DELETE', headers: authHeaders(), body: form });
    const contentType = res.headers.get('content-type');
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    } else {
      responseData = { message: await res.text() }; // Read as text if not JSON
    }

    if (!res.ok) {
      throw new Error(responseData.message || `Failed to delete "${name}".`);
    }
    return responseData; // Return data if successful
  }, [API, currentPath, authHeaders]);

  // Handler for single item deletion initiated by UI
  const handleDeleteOne = useCallback((name, isFolder) => {
    showCustomModal(
      'Delete Confirmation',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      'warning',
      async () => {
        setIsProcessing(true);
        try {
          await executeDelete(name, isFolder);
          showCustomModal('Deletion Successful', `"${name}" has been deleted.`, 'success', () => {
            setShowModal(false);
            fetchContents(currentPath); // Refresh content
          });
        } catch (e) {
          showCustomModal('Deletion Error', e.message, 'error', () => setShowModal(false));
        } finally {
          setIsProcessing(false);
        }
      },
      () => setShowModal(false) // On cancel
    );
  }, [executeDelete, fetchContents, currentPath, showCustomModal]);

  // Multi-download handler
  const downloadMulti = useCallback(() => {
    const filesToDownload = selectedItems.filter(i => i.type === 'file');
    if (filesToDownload.length === 0) {
      showCustomModal('No Files Selected', 'Please select files to download.', 'info');
      return;
    }

    showCustomModal(
      'Download Multiple Files?',
      `Are you sure you want to download ${filesToDownload.length} selected file(s)?`,
      'info',
      async () => {
        setIsProcessing(true);
        const form = new FormData();
        const faceB64 = localStorage.getItem('lastVerifiedFace');
        if (!faceB64) {
          showCustomModal('Error', 'Face verification data missing. Please re-verify.', 'error', () => navigate('/vault'));
          setIsProcessing(false);
          return;
        }

        const fileNames = filesToDownload.map(f => f.name);
        form.append('filenames', JSON.stringify(fileNames));
        form.append('current_path', currentPath || '/');
        form.append('face', base64ToBlob(faceB64), 'face.jpg');

        try {
          const res = await fetch(`${API}/api/vault/download_zip`, {
            method: 'POST',
            headers: authHeaders(),
            body: form
          });

          // Check content type before trying to parse as JSON or blob
          const contentType = res.headers.get('content-type');
          if (!res.ok) {
            let errorMessage = 'Failed to download selected files as a ZIP.';
            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();
              errorMessage = data.message || errorMessage;
            } else {
              // If not JSON, it's likely an HTML error page or plain text
              errorMessage = await res.text();
              if (errorMessage.length > 500) {
                errorMessage = errorMessage.substring(0, 497) + '... (Full error in console)';
                console.error("Full multi-download error response:", errorMessage);
              }
            }
            throw new Error(errorMessage);
          }

          // If successful, and it's a zip file, handle blob
          if (contentType && (contentType.includes('application/zip') || contentType.includes('application/octet-stream'))) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vault_archive_${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            showCustomModal('Download Complete', `${filesToDownload.length} files downloaded as a ZIP archive.`, 'success');
          } else {
            // Unexpected content type for successful response (e.g., if server returned something other than a file)
            const unexpectedResponseText = await res.text();
            throw new Error(`Unexpected server response for download: ${unexpectedResponseText.substring(0, 100)}...`);
          }

        } catch (e) {
          showCustomModal('Download Error', e.message, 'error');
        } finally {
          setIsProcessing(false);
          setSelectedItems([]);
        }
      },
      () => setShowModal(false) // On cancel
    );
  }, [API, currentPath, selectedItems, authHeaders, showCustomModal, navigate]);

  // Multi-delete handler
  const deleteMulti = useCallback(async () => {
    if (selectedItems.length === 0) {
      showCustomModal('No Items Selected', 'Please select items to delete.', 'info');
      return;
    }

    showCustomModal(
      'Delete Multiple Items?',
      `Are you sure you want to delete ${selectedItems.length} selected item(s)? This action cannot be undone.`,
      'warning',
      async () => {
        setIsProcessing(true);
        let failedDeletions = [];
        for (const item of selectedItems) {
          try {
            await executeDelete(item.name, item.type === 'folder');
          } catch (e) {
            failedDeletions.push(`${item.name} (${e.message})`);
            console.error(`Failed to delete ${item.type} ${item.name}:`, e);
          }
        }

        // After all deletions (or attempts), refresh contents and show summary
        await fetchContents(currentPath); // Refresh to reflect deletions
        setSelectedItems([]); // Clear selection

        if (failedDeletions.length > 0) {
          const message = `Completed with errors. Failed to delete: ${failedDeletions.join(', ')}`;
          showCustomModal('Deletion Partial Success/Failure', message, 'warning');
        } else {
          showCustomModal('Deletion Successful', `All ${selectedItems.length} selected items deleted successfully.`, 'success');
        }
        setIsProcessing(false);
      },
      () => setShowModal(false) // On cancel
    );
  }, [selectedItems, executeDelete, fetchContents, currentPath, showCustomModal]);

  // Toggle select item
  const toggleSelect = (name, type) => {
    setSelectedItems(prev => {
      const exists = prev.some(i => i.name === name && i.type === type);
      if (exists) {
        return prev.filter(i => !(i.name === name && i.type === type));
      }
      return [...prev, { name, type }];
    });
  };

  // Create folder handler
  const createFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      showCustomModal('Invalid Name', 'Folder name cannot be empty.', 'warning');
      return;
    }
    setShowCreateFolderModal(false); // Close the input modal
    setIsProcessing(true);

    const form = new FormData();
    const faceB64 = localStorage.getItem('lastVerifiedFace');
    if (!faceB64) {
      showCustomModal('Error', 'Face verification data missing. Please re-verify.', 'error', () => navigate('/vault'));
      setIsProcessing(false);
      return;
    }
    form.append('folder_name', newFolderName);
    form.append('parent_path', currentPath || '/');
    form.append('face', base64ToBlob(faceB64), 'face.jpg');

    fetch(`${API}/api/vault/create_folder`, {
      method: 'POST',
      headers: authHeaders(),
      body: form
    })
      .then(r => r.json().then(j => {
        if (!r.ok) throw new Error(j.message || 'Failed to create folder.');
        return j;
      }))
      .then(() => {
        showCustomModal('Folder Created', `Folder "${newFolderName}" created successfully.`, 'success', () => {
          setShowModal(false);
          fetchContents(currentPath);
        });
      })
      .catch(e => {
        showCustomModal('Error Creating Folder', e.message, 'error', () => setShowModal(false));
      })
      .finally(() => {
        setIsProcessing(false);
        setNewFolderName(''); // Clear the input field
      });
  }, [API, newFolderName, currentPath, authHeaders, fetchContents, showCustomModal, navigate]);

  // Logout handler
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 font-sans">
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
        .btn-primary {
          @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .btn-secondary {
          @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gray-600 text-white shadow-2xl hover:bg-gray-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500;
        }
        .btn-action {
          @apply flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg
                 bg-gradient-to-r from-blue-500 to-purple-500 text-white
                 shadow-2xl hover:from-blue-600 hover:to-purple-600 hover:scale-105
                 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                 border border-blue-400;
          text-shadow: 0px 0px 6px rgba(0, 0, 0, 0.5); /* Subtle text shadow for pop */
        }
        .btn-icon-sm {
          @apply p-2 rounded-full hover:bg-gray-700 transition-colors duration-200;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        .grid-auto-fit-minmax {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          justify-items: start;
          align-items: start;
        }
      `}</style>

      {/* Main content area */}
      <div className="relative z-10 flex flex-col flex-grow text-white overflow-hidden p-4">
        {/* Header */}
        <div className="bg-gray-900/70 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/50 p-4 mb-4 flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Your Secure Vault Library
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-300 flex items-center gap-2">
              <User size={20} /> Welcome, {localStorage.getItem('username')}!
            </span>
            <button
              onClick={() => navigate('/vault')}
              className="btn-secondary px-3 py-2 text-sm"
            >
              <ArrowLeft size={16} /> Home
            </button>
            <button
              onClick={logout}
              className="btn-secondary px-3 py-2 text-sm"
            >
              <Lock size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Content area with path, action buttons, and file/folder grid */}
        <div className="bg-gray-900/70 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/50 p-6 flex-grow flex flex-col overflow-hidden">
          {/* Path and navigation */}
          <div className="flex justify-between items-center bg-gray-800/60 rounded-xl p-3 mb-4 shadow-inner border border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-purple-300 flex items-center gap-2">
              <Files size={18} /> Current Path: <span className="font-mono text-base text-blue-200 break-all">/{currentPath.split('/').filter(Boolean).join('/')}</span>
            </h3>
            {currentPath && (
              <button onClick={goUp} className="btn-icon-sm text-gray-300 hover:text-white" disabled={isProcessing}>
                <ArrowLeft size={20} /> <span className="sr-only">Go Up</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="btn-secondary flex-grow sm:flex-none flex items-center justify-center gap-2 min-w-[160px]"
              disabled={isProcessing}
            >
              <FolderPlus size={20} /> Create New Folder
            </button>
            <button
              onClick={() => fetchContents(currentPath)}
              className="btn-secondary flex-grow sm:flex-none flex items-center justify-center gap-2 min-w-[160px]
                          rounded-full px-4 py-2 hover:bg-blue-600 hover:text-white transition-colors duration-200
                          group"
              disabled={isProcessing}
            >
              <RefreshCw // Changed from TerminalSquare to RefreshCw
                size={20}
                className={`
                  group-hover:rotate-90 transition-transform duration-200
                  ${isProcessing ? 'animate-spin' : ''}
                `}
              />
              Refresh Vault
            </button>
            <button
              onClick={() => {
                setMultiSelect(prev => !prev);
                setSelectedItems([]); // Clear selection when toggling
              }}
              className={`flex-grow sm:flex-none flex items-center justify-center gap-2 min-w-[160px]
                ${multiSelect
                  ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}
                text-white font-semibold text-base
                px-6 py-3 rounded-full
                shadow-md hover:shadow-lg transition-all duration-300 ease-in-out
                transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isProcessing}
            >
              {multiSelect ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
              {multiSelect ? 'Exit Multi-Select' : 'Enable Multi-Select'}
            </button>

            <button
              onClick={deleteMulti}
              className="flex-grow sm:flex-none flex items-center justify-center gap-2 min-w-[160px]
                bg-gradient-to-r from-red-600 to-pink-600
                hover:from-red-700 hover:to-pink-700
                text-white font-semibold text-base
                px-6 py-3 rounded-full
                shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
                transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || selectedItems.length === 0}
            >
              <Trash2 size={20} /> Delete ({selectedItems.length})
            </button>

            <button
              onClick={downloadMulti}
              className="flex-grow sm:flex-none flex items-center justify-center gap-2 min-w-[160px]
                bg-gradient-to-r from-purple-600 to-indigo-600
                hover:from-purple-700 hover:to-indigo-700
                text-white font-semibold text-base
                px-6 py-3 rounded-full
                shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
                transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || selectedItems.filter(i => i.type === 'file').length === 0}
            >
              <Download size={20} /> Download ({selectedItems.filter(i => i.type === 'file').length})
            </button>
          </div>

          {/* File and Folder Grid */}
          <div className="grid grid-auto-fit-minmax gap-4 overflow-y-auto custom-scrollbar flex-grow p-2 -m-2">
            {folderList.map((folder) => {
              const isSelected = selectedItems.some(i => i.name === folder && i.type === 'folder');
              return (
                <div
                  key={`folder-${folder}`}
                  className={`flex flex-col items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors duration-200 group relative shadow-md w-40 max-w-full
                              ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={(e) => {
                    if (multiSelect) {
                      e.stopPropagation();
                      toggleSelect(folder, 'folder');
                    } else {
                      fetchContents(currentPath ? `${currentPath}/${folder}` : folder);
                    }
                  }}
                >
                  <Folder size={48} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm font-medium text-center truncate w-full px-1">{folder}</span>
                  {multiSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(folder, 'folder'); }}
                      className="absolute top-1 left-1 h-4 w-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                    />
                  )}
                  {!multiSelect && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteOne(folder, true); }}
                      className="absolute top-1 right-1 p-1.5 rounded-md bg-gray-800/80 hover:bg-red-600 text-gray-300 hover:text-white shadow-sm transition-colors"
                      title={`Delete folder ${folder}`}
                      disabled={isProcessing}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )
            })}

            {fileList.map((file) => {
              const isSelected = selectedItems.some(i => i.name === file && i.type === 'file');
              return (
                <div
                  key={`file-${file}`}
                  className={`flex flex-col items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg group relative shadow-md w-40 max-w-full
                              ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={(e) => {
                    if (multiSelect) {
                      e.stopPropagation();
                      toggleSelect(file, 'file');
                    } else {
                      handleDownloadOne(file);
                    }
                  }}
                >
                  {getFileIcon(file)}
                  <span className="mt-2 text-sm font-medium text-center truncate w-full px-1">{file}</span>
                  {multiSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(file, 'file'); }}
                      className="absolute top-1 left-1 h-4 w-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                    />
                  )}
                  {!multiSelect && (
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadOne(file); }}
                        className="p-1.5 rounded-md bg-gray-800/80 hover:bg-blue-600 text-gray-300 hover:text-white shadow-sm transition-colors"
                        title={`Download ${file}`}
                        disabled={isProcessing}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteOne(file, false); }}
                        className="p-1.5 rounded-md bg-gray-800/80 hover:bg-red-600 text-gray-300 hover:text-white shadow-sm transition-colors"
                        title={`Delete file ${file}`}
                        disabled={isProcessing}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {(fileList.length === 0 && folderList.length === 0) && (
              <p className="text-gray-400 italic text-center col-span-full py-4">This folder is empty.</p>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="loading-overlay">
          <div className="flex flex-col items-center text-white">
            <Loader2 className="animate-spin text-purple-400 mb-4" size={48} />
            <p className="text-lg font-semibold">Processing...</p>
          </div>
        </div>
      )}

      {/* Modal for Messages and Confirmations */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className={`bg-gray-800 rounded-xl p-6 shadow-2xl border ${modalContent.type === 'error' ? 'border-red-600' : modalContent.type === 'success' ? 'border-green-600' : modalContent.type === 'warning' ? 'border-yellow-600' : 'border-blue-600'} w-full max-w-sm text-center transform scale-95 animate-scale-in`}>
            {modalContent.type === 'success' && <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />}
            {modalContent.type === 'error' && <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />}
            {modalContent.type === 'warning' && <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />}
            {modalContent.type === 'info' && <Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />}
            <h3 className="text-2xl font-bold mb-3 text-white">{modalContent.title}</h3>
            <p className="text-gray-300 mb-6 whitespace-pre-wrap">{modalContent.msg}</p> {/* Added whitespace-pre-wrap */}
            <div className="flex justify-center gap-4">
              {modalContent.onCancel && (
                <button
                  onClick={() => {
                    modalContent.onCancel();
                    setShowModal(false);
                  }}
                  className="px-6 py-2 rounded-lg font-semibold transition-all bg-gray-600 hover:bg-gray-700 text-white shadow-md"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (modalContent.onConfirm) {
                    modalContent.onConfirm();
                  } else {
                    setShowModal(false);
                  }
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all
                    ${modalContent.type === 'error' ? 'bg-red-500 hover:bg-red-600' : modalContent.type === 'success' ? 'bg-green-500 hover:bg-green-600' : modalContent.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}
                    text-white shadow-md`}
              >
                {modalContent.onConfirm ? 'Confirm' : 'OK'}
              </button>
            </div>
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
              disabled={isProcessing}
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="btn-action"
                disabled={isProcessing || !newFolderName.trim()}
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

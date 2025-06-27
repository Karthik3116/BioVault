

// import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Info,
  ArrowRight,
  ShieldCheck ,
  Database 
} from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const blobToBase64 = (blob) =>
//   new Promise((res, rej) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64data = reader.result.split(',')[1];
//       res(base64data);
//     };
//     reader.onerror = rej;
//     reader.readAsDataURL(blob);
//   });

// const FaceScanner = () => (
//   <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
//     <div className="relative">
//       <div className="w-40 h-40 border-2 border-gray-400/30 rounded-full animate-pulse"></div>
//       <div className="absolute inset-2 w-36 h-36 border-2 border-white/50 rounded-full animate-spin-slow"></div>
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
//         <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
//           <Scan className="text-white animate-pulse" size={24} />
//         </div>
//       </div>
//       <div className="absolute inset-0 w-40 h-40">
//         <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-white/60 to-transparent animate-scan-line-v origin-top"></div>
//         <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent animate-scan-line-h"></div>
//       </div>
//     </div>
//   </div>
// );

// export default function FaceManager({ setIsLoggedIn }) {
//   const [mode, setMode] = useState('access');
//   const [dataFiles, setDataFiles] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
//   const [cameraOn, setCameraOn] = useState(false);
//   const [isScanning, setIsScanning] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [processingMessage, setProcessingMessage] = useState('');
//   const [verificationSuccess, setVerificationSuccess] = useState(false);
//   const [countdown, setCountdown] = useState(5);
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();
//   const API_BASE = import.meta.env.VITE_API_BASE;
//   const sessionId = localStorage.getItem('sessionId');


//   const username = localStorage.getItem('username') || 'Unknown User';

//   // Redirect logic
//   useEffect(() => {
//     let redirectTimer;
//     let countdownInterval;
//     let attemptCount = 0;

//     const attemptRedirect = () => {
//       attemptCount++;
//       setIsRedirecting(true);
//       try {
//         // const sessionId = Math.random().toString(36).substring(2, 8);
//         navigate(`/library/${sessionId}`);
//       } catch {
//         if (attemptCount < 3) {
//           redirectTimer = setTimeout(attemptRedirect, 1000 * attemptCount);
//         }
//       }
//     };

//     const startCountdown = () => {
//       countdownInterval = setInterval(() => {
//         setCountdown(prev => {
//           if (prev <= 1) {
//             clearInterval(countdownInterval);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     };

//     if (verificationSuccess && mode === 'access' && !isRedirecting) {
//       startCountdown();
//       redirectTimer = setTimeout(attemptRedirect, 500);
//       return () => {
//         clearTimeout(redirectTimer);
//         clearInterval(countdownInterval);
//         setIsRedirecting(false);
//       };
//     }
//   }, [verificationSuccess, mode, navigate, isRedirecting]);

//   useEffect(() => {
//     setVerificationSuccess(false);
//     setCountdown(5);
//   }, [mode]);

//   const modes = [
//     {
//       value: 'upload',
//       label: 'Upload Files',
//       icon: Upload,
//       gradient: 'from-gray-700 to-black',
//       description: 'Secure file storage with verification',
//       accent: 'border-gray-300'
//     },
//     {
//       value: 'access',
//       label: 'Access Vault',
//       icon: Files,
//       gradient: 'from-black to-gray-700',
//       description: 'Retrieve your protected documents',
//       accent: 'border-white'
//     }
//   ];
//   const currentMode = modes.find(m => m.value === mode);

//   const displayMessage = useCallback((msg, type = 'info', title = '') => {
//     setModalContent({
//       title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'),
//       message: msg,
//       type
//     });
//     setShowModal(true);
//   }, []);

//   useEffect(() => {
//     let stream;
//     if (cameraOn) {
//       navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
//         .then(s => {
//           stream = s;
//           videoRef.current.srcObject = s;
//           return new Promise(r => videoRef.current.onloadedmetadata = r);
//         })
//         .then(() => setCameraOn(true))
//         .catch(() => {
//           displayMessage('Unable to access camera.', 'error', 'Camera Error');
//           setCameraOn(false);
//         });
//     } else {
//       videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
//       if (videoRef.current) videoRef.current.srcObject = null;
//     }
//     return () => stream?.getTracks().forEach(t => t.stop());
//   }, [cameraOn, displayMessage]);

//   const captureBlob = async () => {
//     const vid = videoRef.current;
//     const can = canvasRef.current;
//     if (!vid || !can) throw new Error('Camera not ready.');
//     can.width = vid.videoWidth;
//     can.height = vid.videoHeight;
//     can.getContext('2d').drawImage(vid, 0, 0);
//     return new Promise((res, rej) =>
//       can.toBlob(b => b ? res(b) : rej(new Error('Capture failed')), 'image/jpeg', 0.9)
//     );
//   };

//   const getToken = () => localStorage.getItem('jwtToken');
//   const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

//   const prepareAndRun = async (actionFn) => {
//   if (!getToken()) {
//     displayMessage('Please log in first.', 'error', 'Auth Required');
//     return navigate('/login');
//   }

//   setIsProcessing(true);
//   setVerificationSuccess(false);
//   setCountdown(5);
//   setProcessingMessage('Initializing camera...');
//   setCameraOn(true);

//   try {
//     await new Promise(r => {
//       const check = () => {
//         if (videoRef.current?.readyState === 4) r();
//         else setTimeout(check, 100);
//       };
//       check();
//     });

//     setProcessingMessage('Scanning face...');
//     setIsScanning(true);
//     await new Promise(r => setTimeout(r, 1500));

//     setProcessingMessage('Capturing image...');
//     const faceBlob = await captureBlob();

//     setProcessingMessage(mode === 'access' ? 'Accessing vault...' : 'Uploading files...');
//     await actionFn(faceBlob);
//     setVerificationSuccess(true);
//   } catch (e) {
//     if (e.message?.toLowerCase().includes('token')) {
//       displayMessage('Session expired. Please log in again.', 'error', 'Token Expired');
//       setTimeout(() => {
//         localStorage.clear();
//         setIsLoggedIn(false);
//         navigate('/login');
//       }, 1500);
//     } else {
//       displayMessage(e.message || 'Operation failed.', 'error');
//     }
//   } finally {
//     setIsProcessing(false);
//     setIsScanning(false);
//     setCameraOn(false);
//     setProcessingMessage('');
//   }
// };


//   const handleSubmit = async () => {
//     if (mode === 'upload') {
//       if (!dataFiles.length) return displayMessage('Select files first.', 'error');
//       await prepareAndRun(async (blob) => {
//         const form = new FormData();
//         form.append('face', blob, 'face.jpg');
//         dataFiles.forEach(f => form.append('user_files', f, f.name));
//         form.append('current_folder', '');
//         const res = await fetch(`${API_BASE}/api/vault/upload`, {
//           method: 'POST', headers: authHeader(), body: form
//         });
//         const json = await res.json();
//         if (!res.ok) throw new Error(json.message || 'Upload failed');
//         displayMessage(json.message, 'success');
//         setDataFiles([]);
//         fileInputRef.current.value = '';
//       });
//     } else {
//       await prepareAndRun(async (blob) => {
//         const form = new FormData();
//         form.append('face', blob, 'face.jpg');
//         form.append('path', '');
//         const res = await fetch(`${API_BASE}/api/vault/access`, {
//           method: 'POST', headers: authHeader(), body: form
//         });
//         const json = await res.json();
//         if (!res.ok) throw new Error(json.message || 'Access failed');
//         localStorage.setItem('lastVerifiedFace', await blobToBase64(blob));
//         localStorage.setItem('faceVerified', 'true');
//         displayMessage('Access granted, redirecting…', 'success');
//       });
//     }
//   };

//   const handleManualNavigate = () => {
//     try {
//       navigate('/library');
//     } catch {
//       displayMessage('Navigation failed. Please refresh.', 'error');
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     navigate('/login');
//   };
//   return (
//     <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
//       <style jsx>{`
//         @keyframes spin-slow { to { transform: rotate(360deg); } }
//         @keyframes scan-line-v { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
//         @keyframes scan-line-h { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
//         .animate-spin-slow { animation: spin-slow 8s linear infinite; }
//         .animate-scan-line-v { animation: scan-line-v 3s linear infinite; }
//         .animate-scan-line-h { animation: scan-line-h 3s linear infinite reverse; }

//         .btn-primary {
//           @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
//         }
//         .btn-secondary {
//           @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
//         }
//         .btn-action {
//           @apply flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:from-blue-600 hover:to-purple-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
//         }
//         .btn-success {
//           @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg hover:bg-green-700 transition duration-200;
//         }
//         .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: #2a2c30; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #777; }
//         .animate-scale-in {
//           animation: scaleIn 0.3s ease-out forwards;
//         }
//         @keyframes scaleIn {
//           from { transform: scale(0.9); opacity: 0; }
//           to { transform: scale(1); opacity: 1; }
//         }
//       `}</style>

//       <div className="relative z-10 flex flex-col items-center flex-grow p-4 overflow-y-auto custom-scrollbar">
//         <div className="w-full max-w-4xl bg-gray-900/70 backdrop-blur-lg rounded-3xl p-8 space-y-8">
//           <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
//             Biometric Vault
//           </h1>

//           <div className="flex justify-between items-center bg-gray-800/50 rounded-xl p-4 mb-8">
//             <span className="flex items-center gap-2 text-xl text-gray-300">
//               <User size={20} /> {username}
//             </span>
//             <button onClick={handleLogout} className="btn-secondary">
//               <Lock size={16} /> Logout
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//             {modes.map((m) => (
//               <button
//                 key={m.value}
//                 onClick={() => {
//                   setMode(m.value);
//                   setDataFiles([]);
//                   setCameraOn(false);
//                   setIsProcessing(false);
//                   setIsScanning(false);
//                   setVerificationSuccess(false);
//                   fileInputRef.current && (fileInputRef.current.value = '');
//                 }}
//                 className={`p-4 rounded-xl bg-gradient-to-br ${m.gradient} hover:scale-105 transform ${
//                   mode === m.value ? `ring-2 ring-offset-2 ring-purple-500 ${m.accent}` : 'ring-1 ring-gray-600'
//                 } transition duration-300`}
//                 disabled={isProcessing}
//               >
//                 <m.icon className="w-8 h-8 mb-2" />
//                 <div className="font-semibold text-lg">{m.label}</div>
//                 <div className="text-xs text-gray-400">{m.description}</div>
//               </button>
//             ))}
//           </div>

//           <div className="bg-gray-800/60 rounded-2xl p-6 flex-grow overflow-y-auto custom-scrollbar space-y-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="flex items-center gap-2 text-2xl text-blue-300">
//                 <currentMode.icon /> {currentMode.label}
//               </h2>
//               {isProcessing && (
//                 <div className="flex items-center gap-2 text-sm text-gray-400">
//                   <Loader2 className="animate-spin" size={18} />
//                   <span>{processingMessage}</span>
//                 </div>
//               )}
//             </div>

//             <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
//               {cameraOn ? (
//                 <>
//                   <video 
//                     ref={videoRef} 
//                     autoPlay 
//                     playsInline 
//                     muted
//                     className="w-full h-full object-cover"
//                   />
//                   <canvas ref={canvasRef} className="hidden" />
//                   {isScanning && <FaceScanner />}
//                 </>
//               ) : (
//                 <div className="flex flex-col items-center text-gray-500">
//                   <Camera size={48} />
//                   <span>Camera {isProcessing ? 'Initializing...' : 'Off'}</span>
//                 </div>
//               )}
//             </div>

//             {mode === 'upload' ? (
//               <div className="space-y-4">
//                 <input
//                   type="file"
//                   multiple
//                   ref={fileInputRef}
//                   onChange={(e) => setDataFiles(Array.from(e.target.files))}
//                   className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
//                   disabled={isProcessing}
//                 />
//                 {dataFiles.length > 0 && (
//                   <div className="text-sm text-gray-400">
//                     Selected: {dataFiles.map((f) => f.name).join(', ')}
//                   </div>
//                 )}
//                 <button
//                   onClick={handleSubmit}
//                   className="btn-action w-full"
//                   disabled={isProcessing || !dataFiles.length}
//                 >
//                   <Upload size={20} /> {isProcessing ? 'Processing...' : 'Upload Files'}
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-4 text-center">
//                 <p className="text-gray-400 mb-4">
//                   Click below to verify and enter your vault.
//                 </p>
//                 {verificationSuccess && !isProcessing ? (
//                   <div className="space-y-4">
//                     <div className="p-4 bg-green-900/30 rounded-lg border border-green-600">
//                       <p className="text-green-300">Verification successful!</p>
//                       {countdown > 0 ? (
//                         <p className="text-sm text-green-400 mt-1">
//                           Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
//                         </p>
//                       ) : (
//                         <p className="text-sm text-green-400 mt-1">
//                           Automatic redirect failed. Please click below:
//                         </p>
//                       )}
//                     </div>
//                     <button
//                       onClick={handleManualNavigate}
//                       className="btn-success w-full"
//                     >
//                       <ArrowRight size={20} /> {countdown > 0 ? `(${countdown})` : ''} Go to Library
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={handleSubmit}
//                     className="btn-action w-full"
//                     disabled={isProcessing}
//                   >
//                     {isProcessing ? (
//                       <>
//                         <Loader2 size={20} className="animate-spin" />
//                         <span className="ml-2">Processing...</span>
//                       </>
//                     ) : (
//                       <span>Access Vault</span>
//                     )}
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
//           <div className={`bg-gray-800 p-6 rounded-xl text-center space-y-4 max-w-sm w-full transform scale-95 animate-scale-in border ${
//               modalContent.type === 'error'
//                 ? 'border-red-600'
//                 : modalContent.type === 'success'
//                 ? 'border-green-600'
//                 : 'border-blue-600'
//             }`}
//           >
//             {modalContent.type === 'success' && <CheckCircle2 className="mx-auto text-green-500" size={48} />}
//             {modalContent.type === 'error' && <XCircle className="mx-auto text-red-500" size={48} />}
//             {modalContent.type === 'warning' && <AlertTriangle className="mx-auto text-yellow-500" size={48} />}
//             {modalContent.type === 'info' && <Info className="mx-auto text-blue-500" size={48} />}
//             <h3 className="text-2xl font-bold text-white">{modalContent.title}</h3>
//             <p className="text-gray-300">{modalContent.message}</p>
//             <button 
//               onClick={() => {
//                 setShowModal(false);
//                 if (modalContent.type === 'success' && mode === 'access') {
//                   // Navigation is already handled in the success case
//                 }
//               }} 
//               className="btn-primary"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//   Camera, Upload, Files, Scan, CheckCircle2, XCircle, 
//   Loader2, User, Lock, AlertTriangle, Info, ArrowRight,
//   Home, Folder, Settings, LogOut, History, ShieldCheck, 
//   Database, Activity, FileText, ChevronDown, ChevronUp, Image as ImageIcon,
//   FolderPlus, FolderMinus, Trash2, LogIn, UserPlus
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const blobToBase64 = (blob) =>
//   new Promise((res, rej) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64data = reader.result.split(',')[1];
//       res(base64data);
//     };
//     reader.onerror = rej;
//     reader.readAsDataURL(blob);
//   });

// const FaceScanner = () => (
//   <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
//     <div className="relative">
//       <div className="w-40 h-40 border-2 border-gray-400/30 rounded-full animate-pulse"></div>
//       <div className="absolute inset-2 w-36 h-36 border-2 border-white/50 rounded-full animate-spin-slow"></div>
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
//         <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
//           <Scan className="text-white animate-pulse" size={24} />
//         </div>
//       </div>
//       <div className="absolute inset-0 w-40 h-40">
//         <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-white/60 to-transparent animate-scan-line-v origin-top"></div>
//         <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent animate-scan-line-h"></div>
//       </div>
//     </div>
//   </div>
// );

// const ActivityItem = ({ activity }) => {
//   const formattedDate = new Date(activity.timestamp).toLocaleString();
//   const [expanded, setExpanded] = useState(false);

//   const getActionDetails = () => {
//     switch(activity.action) {
//       case 'file_upload':
//         return {
//           icon: <Upload size={16} />,
//           title: 'Files Uploaded',
//           color: 'bg-blue-900/30',
//           files: activity.details.files
//         };
//       case 'vault_access':
//         return {
//           icon: <Files size={16} />,
//           title: 'Vault Accessed',
//           color: 'bg-green-900/30',
//           path: activity.details.path
//         };
//       case 'folder_created':
//         return {
//           icon: <FolderPlus size={16} />,
//           title: 'Folder Created',
//           color: 'bg-purple-900/30',
//           name: activity.details.folder_name
//         };
//       case 'file_deleted':
//         return {
//           icon: <Trash2 size={16} />,
//           title: 'File Deleted',
//           color: 'bg-red-900/30',
//           name: activity.details.filename
//         };
//       case 'folder_deleted':
//         return {
//           icon: <FolderMinus size={16} />,
//           title: 'Folder Deleted',
//           color: 'bg-orange-900/30',
//           name: activity.details.folder_name
//         };
//       case 'file_download':
//         return {
//           icon: <ArrowRight size={16} />,
//           title: 'File Downloaded',
//           color: 'bg-teal-900/30',
//           name: activity.details.filename
//         };
//       case 'multi_download':
//         return {
//           icon: <Files size={16} />,
//           title: 'Multiple Files Downloaded',
//           color: 'bg-indigo-900/30',
//           count: activity.details.count
//         };
//       case 'login':
//         return {
//           icon: <LogIn size={16} />,
//           title: 'User Login',
//           color: 'bg-teal-900/30'
//         };
//       case 'account_created':
//         return {
//           icon: <UserPlus size={16} />,
//           title: 'Account Created',
//           color: 'bg-indigo-900/30'
//         };
//       case 'storage_cleaned':
//         return {
//           icon: <Database size={16} />,
//           title: 'Storage Cleaned',
//           color: 'bg-blue-900/30'
//         };
//       case 'storage_upgraded':
//         return {
//           icon: <Database size={16} />,
//           title: 'Storage Upgraded',
//           color: 'bg-green-900/30',
//           newLimit: activity.details.newLimit
//         };
//       default:
//         return {
//           icon: <Activity size={16} />,
//           title: 'System Activity',
//           color: 'bg-gray-700'
//         };
//     }
//   };

//   const details = getActionDetails();

//   return (
//     <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-3">
//       <div className="flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <div className={`p-2 rounded-full ${details.color}`}>
//             {details.icon}
//           </div>
//           <div>
//             <h4 className="font-medium">{details.title}</h4>
//             <p className="text-xs text-gray-400">{formattedDate}</p>
//           </div>
//         </div>
//         {details.files && (
//           <button 
//             onClick={() => setExpanded(!expanded)}
//             className="text-gray-400 hover:text-white"
//           >
//             {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//           </button>
//         )}
//       </div>
      
//       {expanded && details.files && (
//         <div className="mt-3 pt-3 border-t border-gray-700">
//           <h5 className="text-sm font-medium mb-2">Uploaded Files:</h5>
//           <ul className="space-y-1">
//             {details.files.map((file, idx) => (
//               <li key={idx} className="flex items-center gap-2 text-sm">
//                 <FileText size={14} className="text-gray-400" />
//                 <span className="truncate max-w-[200px]">{file.name}</span>
//                 <span className="text-gray-500 text-xs ml-auto">
//                   {(file.size / 1024).toFixed(1)} KB
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {details.name && !expanded && (
//         <div className="mt-2 text-sm text-gray-300">
//           {details.name}
//         </div>
//       )}

//       {details.path && !expanded && (
//         <div className="mt-2 text-sm text-gray-300">
//           Path: {details.path || 'Root'}
//         </div>
//       )}

//       {details.count && !expanded && (
//         <div className="mt-2 text-sm text-gray-300">
//           Files: {details.count}
//         </div>
//       )}

//       {details.newLimit && (
//         <div className="mt-2 text-sm text-gray-300">
//           New Limit: {details.newLimit} MB
//         </div>
//       )}
//     </div>
//   );
// };

// const SecurityToggle = ({ label, status, onChange }) => (
//   <div className="flex items-center justify-between py-3 border-b border-gray-700">
//     <span className="text-gray-300">{label}</span>
//     <label className="relative inline-flex items-center cursor-pointer">
//       <input 
//         type="checkbox" 
//         className="sr-only peer" 
//         checked={status}
//         onChange={onChange}
//       />
//       <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
//     </label>
//   </div>
// );

// export default function BiometricVault({ setIsLoggedIn }) {
//   const [dataFiles, setDataFiles] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
//   const [cameraOn, setCameraOn] = useState(false);
//   const [isScanning, setIsScanning] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [processingMessage, setProcessingMessage] = useState('');
//   const [verificationSuccess, setVerificationSuccess] = useState(false);
//   const [countdown, setCountdown] = useState(5);
//   const [isRedirecting, setIsRedirecting] = useState(false);
//   const [activeNav, setActiveNav] = useState('dashboard');
//   const [activityLog, setActivityLog] = useState([]);
//   const [storageUsage, setStorageUsage] = useState({ used: 0, total: 1024 });
//   const [loadingActivity, setLoadingActivity] = useState(false);
//   const [loadingStorage, setLoadingStorage] = useState(false);
//   const [securityStatus, setSecurityStatus] = useState({
//     biometric: true,
//     twoFactor: false,
//     encryption: true
//   });

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();
//   const API_BASE = import.meta.env.VITE_API_BASE;
//   const sessionId = localStorage.getItem('sessionId');
//   const username = localStorage.getItem('username') || 'Unknown User';

//   const getToken = () => localStorage.getItem('jwtToken');
//   const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

//   const displayMessage = useCallback((msg, type = 'info', title = '') => {
//     setModalContent({
//       title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'),
//       message: msg,
//       type
//     });
//     setShowModal(true);
//   }, []);
//   // Fetch activities from server
//   const fetchActivityLog = useCallback(async () => {
//     if (!getToken()) return;
    
//     setLoadingActivity(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/activity`, {
//         headers: authHeader()
//       });
//       const json = await res.json();
//       if (res.ok) {
//         setActivityLog(json.activities);
//       } else {
//         throw new Error(json.message || 'Failed to fetch activity');
//       }
//     } catch (e) {
//       displayMessage(e.message, 'error');
//     } finally {
//       setLoadingActivity(false);
//     }
//   }, [displayMessage]);

//   // Fetch storage usage from server
//   const fetchStorageUsage = useCallback(async () => {
//     if (!getToken()) return;
    
//     setLoadingStorage(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/storage`, {
//         headers: authHeader()
//       });
//       const json = await res.json();
//       if (res.ok) {
//         setStorageUsage({ used: json.used, total: json.total });
//       } else {
//         throw new Error(json.message || 'Failed to fetch storage');
//       }
//     } catch (e) {
//       displayMessage(e.message, 'error');
//     } finally {
//       setLoadingStorage(false);
//     }
//   }, [displayMessage]);

//   // Fetch data on mount and nav change
//   useEffect(() => {
//     if (getToken()) {
//       fetchActivityLog();
//       fetchStorageUsage();
//     }
//   }, []);

//   useEffect(() => {
//     if (activeNav === 'activity') {
//       fetchActivityLog();
//     } else if (activeNav === 'storage') {
//       fetchStorageUsage();
//     }
//   }, [activeNav]);

//   const navItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: Home },
//     { id: 'upload', label: 'Upload Files', icon: Upload },
//     { id: 'access', label: 'Access Vault', icon: Files },
//     { id: 'activity', label: 'Activity Log', icon: History },
//     { id: 'security', label: 'Security', icon: ShieldCheck },
//     { id: 'storage', label: 'Storage', icon: Database },
//     { id: 'settings', label: 'Settings', icon: Settings }
//   ];

  

//   useEffect(() => {
//     let stream;
//     if (cameraOn) {
//       navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
//         .then(s => {
//           stream = s;
//           videoRef.current.srcObject = s;
//           return new Promise(r => videoRef.current.onloadedmetadata = r);
//         })
//         .then(() => setCameraOn(true))
//         .catch(() => {
//           displayMessage('Unable to access camera.', 'error', 'Camera Error');
//           setCameraOn(false);
//         });
//     } else {
//       videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
//       if (videoRef.current) videoRef.current.srcObject = null;
//     }
//     return () => stream?.getTracks().forEach(t => t.stop());
//   }, [cameraOn, displayMessage]);

//   const captureBlob = async () => {
//     const vid = videoRef.current;
//     const can = canvasRef.current;
//     if (!vid || !can) throw new Error('Camera not ready.');
//     can.width = vid.videoWidth;
//     can.height = vid.videoHeight;
//     can.getContext('2d').drawImage(vid, 0, 0);
//     return new Promise((res, rej) =>
//       can.toBlob(b => b ? res(b) : rej(new Error('Capture failed')), 'image/jpeg', 0.9)
//     );
//   };

//   const prepareAndRun = async (actionFn) => {
//     if (!getToken()) {
//       displayMessage('Please log in first.', 'error', 'Auth Required');
//       return navigate('/login');
//     }

//     setIsProcessing(true);
//     setVerificationSuccess(false);
//     setCountdown(5);
//     setProcessingMessage('Initializing camera...');
//     setCameraOn(true);

//     try {
//       await new Promise(r => {
//         const check = () => {
//           if (videoRef.current?.readyState === 4) r();
//           else setTimeout(check, 100);
//         };
//         check();
//       });

//       setProcessingMessage('Scanning face...');
//       setIsScanning(true);
//       await new Promise(r => setTimeout(r, 1500));

//       setProcessingMessage('Capturing image...');
//       const faceBlob = await captureBlob();

//       setProcessingMessage(activeNav === 'access' ? 'Accessing vault...' : 'Uploading files...');
//       await actionFn(faceBlob);
//       setVerificationSuccess(true);
//     } catch (e) {
//       if (e.message?.toLowerCase().includes('token')) {
//         displayMessage('Session expired. Please log in again.', 'error', 'Token Expired');
//         setTimeout(() => {
//           localStorage.clear();
//           setIsLoggedIn(false);
//           navigate('/login');
//         }, 1500);
//       } else {
//         displayMessage(e.message || 'Operation failed.', 'error');
//       }
//     } finally {
//       setIsProcessing(false);
//       setIsScanning(false);
//       setCameraOn(false);
//       setProcessingMessage('');
//     }
//   };

//   const handleSubmit = async () => {
//     if (activeNav === 'upload') {
//       if (!dataFiles.length) return displayMessage('Select files first.', 'error');
//       await prepareAndRun(async (blob) => {
//         const form = new FormData();
//         form.append('face', blob, 'face.jpg');
//         dataFiles.forEach(f => form.append('user_files', f, f.name));
//         form.append('current_folder', '');
        
//         const res = await fetch(`${API_BASE}/api/vault/upload`, {
//           method: 'POST', 
//           headers: authHeader(), 
//           body: form
//         });
        
//         const json = await res.json();
//         if (!res.ok) throw new Error(json.message || 'Upload failed');
        
//         // Refresh data
//         fetchActivityLog();
//         fetchStorageUsage();
        
//         displayMessage(json.message, 'success');
//         setDataFiles([]);
//         fileInputRef.current.value = '';
//       });
//     } else if (activeNav === 'access') {
//       await prepareAndRun(async (blob) => {
//         const form = new FormData();
//         form.append('face', blob, 'face.jpg');
//         form.append('path', '');
        
//         const res = await fetch(`${API_BASE}/api/vault/access`, {
//           method: 'POST', 
//           headers: authHeader(), 
//           body: form
//         });
        
//         const json = await res.json();
//         if (!res.ok) throw new Error(json.message || 'Access failed');
        
//         // Refresh activity log
//         fetchActivityLog();
        
//         localStorage.setItem('lastVerifiedFace', await blobToBase64(blob));
//         localStorage.setItem('faceVerified', 'true');
//         displayMessage('Access granted, redirecting…', 'success');
//       });
//     }
//   };

//   const handleManualNavigate = () => {
//     try {
//       navigate('/library');
//     } catch {
//       displayMessage('Navigation failed. Please refresh.', 'error');
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     navigate('/login');
//   };

//   const handleFileDelete = (index) => {
//     const newFiles = [...dataFiles];
//     newFiles.splice(index, 1);
//     setDataFiles(newFiles);
//   };

//   const handleCleanFiles = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/storage/clean`, {
//         method: 'POST',
//         headers: { ...authHeader(), 'Content-Type': 'application/json' }
//       });
      
//       const json = await res.json();
//       if (res.ok) {
//         displayMessage(json.message, 'success');
//         fetchStorageUsage();
//         fetchActivityLog();
//       } else {
//         throw new Error(json.message || 'Clean failed');
//       }
//     } catch (e) {
//       displayMessage(e.message, 'error');
//     }
//   };

//   const handleUpgradeStorage = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/storage/upgrade`, {
//         method: 'POST',
//         headers: { ...authHeader(), 'Content-Type': 'application/json' }
//       });
      
//       const json = await res.json();
//       if (res.ok) {
//         setStorageUsage(prev => ({ ...prev, total: json.newTotal }));
//         displayMessage(json.message, 'success');
//       } else {
//         throw new Error(json.message || 'Upgrade failed');
//       }
//     } catch (e) {
//       displayMessage(e.message, 'error');
//     }
//   };

//   // Redirect logic
//   useEffect(() => {
//     let redirectTimer;
//     let countdownInterval;

//     const attemptRedirect = () => {
//       setIsRedirecting(true);
//       try {
//         navigate(`/library/${sessionId}`);
//       } catch (error) {
//         console.error('Navigation error:', error);
//       }
//     };

//     const startCountdown = () => {
//       countdownInterval = setInterval(() => {
//         setCountdown(prev => {
//           if (prev <= 1) {
//             clearInterval(countdownInterval);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     };

//     if (verificationSuccess && activeNav === 'access' && !isRedirecting) {
//       startCountdown();
//       redirectTimer = setTimeout(attemptRedirect, 5000);
//       return () => {
//         clearTimeout(redirectTimer);
//         clearInterval(countdownInterval);
//         setIsRedirecting(false);
//       };
//     }
//   }, [verificationSuccess, activeNav, navigate, isRedirecting]);

//   useEffect(() => {
//     setVerificationSuccess(false);
//     setCountdown(5);
//   }, [activeNav]);

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
//       <style jsx>{`
//         @keyframes spin-slow { to { transform: rotate(360deg); } }
//         @keyframes scan-line-v { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
//         @keyframes scan-line-h { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
//         .animate-spin-slow { animation: spin-slow 8s linear infinite; }
//         .animate-scan-line-v { animation: scan-line-v 3s linear infinite; }
//         .animate-scan-line-h { animation: scan-line-h 3s linear infinite reverse; }

//         .btn-primary {
//           @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
//         }
//         .btn-secondary {
//           @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gray-600 text-white shadow-lg hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
//         }
//         .btn-action {
//           @apply flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:from-blue-600 hover:to-purple-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
//         }
//         .btn-success {
//           @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg hover:bg-green-700 transition duration-200;
//         }
//         .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: #2a2c30; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #777; }
//         .animate-scale-in {
//           animation: scaleIn 0.3s ease-out forwards;
//         }
//         @keyframes scaleIn {
//           from { transform: scale(0.9); opacity: 0; }
//           to { transform: scale(1); opacity: 1; }
//         }
//         .progress-bar {
//           height: 8px;
//           border-radius: 4px;
//           background: linear-gradient(90deg, #3b82f6, #8b5cf6);
//           transition: width 0.5s ease;
//         }
//       `}</style>

//       {/* Sidebar Navigation */}
//       <div className="w-64 bg-gray-900/80 backdrop-blur-lg border-r border-gray-800 flex flex-col">
//         <div className="p-6 border-b border-gray-800">
//           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
//             BioVault Pro
//           </h1>
//           <div className="flex items-center mt-4">
//             <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-2 rounded-full">
//               <User size={24} />
//             </div>
//             <div className="ml-3">
//               <p className="font-medium">{username}</p>
//               <p className="text-xs text-gray-400">Premium Account</p>
//             </div>
//           </div>
//         </div>

//         <nav className="flex-1 py-4">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveNav(item.id)}
//               className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
//                 activeNav === item.id 
//                   ? 'bg-gray-800/50 border-l-4 border-purple-500' 
//                   : 'hover:bg-gray-800/30'
//               }`}
//             >
//               <item.icon size={20} className={activeNav === item.id ? 'text-purple-400' : 'text-gray-400'} />
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>

//         <div className="p-4 border-t border-gray-800">
//           <button 
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
//           >
//             <LogOut size={18} className="text-gray-400" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <div className="p-6 border-b border-gray-800 flex justify-between items-center">
//           <h2 className="text-2xl font-bold flex items-center gap-2">
//             {navItems.find(item => item.id === activeNav)?.icon && 
//               React.createElement(navItems.find(item => item.id === activeNav)?.icon, { size: 24 })}
//             {navItems.find(item => item.id === activeNav)?.label}
//           </h2>
          
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
//               <ShieldCheck size={16} className="text-green-400" />
//               <span>Biometric Active</span>
//             </div>
//             <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
//               <Database size={16} className="text-blue-400" />
//               <span>
//                 {loadingStorage ? '...' : storageUsage.used.toFixed(1)}/
//                 {loadingStorage ? '...' : storageUsage.total} MB
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
//           {/* Dashboard View */}
//           {activeNav === 'dashboard' && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <Activity size={20} /> Quick Actions
//                 </h3>
//                 <div className="space-y-3">
//                   <button 
//                     onClick={() => setActiveNav('upload')}
//                     className="w-full flex items-center justify-between gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
//                   >
//                     <div className="flex items-center gap-3">
//                       <Upload size={20} />
//                       <span>Upload Files</span>
//                     </div>
//                     <ArrowRight size={18} className="text-gray-400" />
//                   </button>
//                   <button 
//                     onClick={() => setActiveNav('access')}
//                     className="w-full flex items-center justify-between gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
//                   >
//                     <div className="flex items-center gap-3">
//                       <Folder size={20} />
//                       <span>Access Vault</span>
//                     </div>
//                     <ArrowRight size={18} className="text-gray-400" />
//                   </button>
//                   <button 
//                     onClick={() => setActiveNav('security')}
//                     className="w-full flex items-center justify-between gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
//                   >
//                     <div className="flex items-center gap-3">
//                       <ShieldCheck size={20} />
//                       <span>Security Settings</span>
//                     </div>
//                     <ArrowRight size={18} className="text-gray-400" />
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 lg:col-span-2">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <History size={20} /> Recent Activity
//                 </h3>
//                 <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
//                   {activityLog.length > 0 ? (
//                     activityLog.slice(0, 5).map((activity, index) => (
//                       <ActivityItem key={index} activity={activity} />
//                     ))
//                   ) : (
//                     <p className="text-gray-400 text-center py-4">
//                       {loadingActivity ? 'Loading activities...' : 'No recent activity'}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <Database size={20} /> Storage Overview
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span>Used: {loadingStorage ? '...' : storageUsage.used.toFixed(1)} MB</span>
//                       <span>Total: {loadingStorage ? '...' : storageUsage.total} MB</span>
//                     </div>
//                     <div className="w-full bg-gray-700 rounded-full h-2">
//                       {!loadingStorage && (
//                         <div 
//                           className="progress-bar h-2 rounded-full" 
//                           style={{ width: `${Math.min(100, (storageUsage.used / storageUsage.total) * 100)}%` }}
//                         ></div>
//                       )}
//                     </div>
//                   </div>
//                   <div className="text-sm text-gray-400">
//                     <p className="flex justify-between py-1">
//                       <span>Documents</span>
//                       <span>{loadingStorage ? '...' : (storageUsage.used * 0.6).toFixed(1)} MB</span>
//                     </p>
//                     <p className="flex justify-between py-1">
//                       <span>Images</span>
//                       <span>{loadingStorage ? '...' : (storageUsage.used * 0.3).toFixed(1)} MB</span>
//                     </p>
//                     <p className="flex justify-between py-1">
//                       <span>Other</span>
//                       <span>{loadingStorage ? '...' : (storageUsage.used * 0.1).toFixed(1)} MB</span>
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                   <ShieldCheck size={20} /> Security Status
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
//                     <div className="flex items-center gap-2">
//                       <div className="p-2 rounded-full bg-green-900/30">
//                         <ShieldCheck size={16} className="text-green-400" />
//                       </div>
//                       <span>Biometric Auth</span>
//                     </div>
//                     <span className="text-green-400">Active</span>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
//                     <div className="flex items-center gap-2">
//                       <div className="p-2 rounded-full bg-yellow-900/30">
//                         <Lock size={16} className="text-yellow-400" />
//                       </div>
//                       <span>2FA</span>
//                     </div>
//                     <span className="text-yellow-400">Inactive</span>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
//                     <div className="flex items-center gap-2">
//                       <div className="p-2 rounded-full bg-blue-900/30">
//                         <Database size={16} className="text-blue-400" />
//                       </div>
//                       <span>Encryption</span>
//                     </div>
//                     <span className="text-blue-400">AES-256</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Upload View */}
//           {activeNav === 'upload' && (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-800/60 rounded-2xl p-6 space-y-6">
//                 <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
//                   {cameraOn ? (
//                     <>
//                       <video 
//                         ref={videoRef} 
//                         autoPlay 
//                         playsInline 
//                         muted
//                         className="w-full h-full object-cover"
//                       />
//                       <canvas ref={canvasRef} className="hidden" />
//                       {isScanning && <FaceScanner />}
//                     </>
//                   ) : (
//                     <div className="flex flex-col items-center text-gray-500">
//                       <Camera size={48} />
//                       <span>Camera {isProcessing ? 'Initializing...' : 'Off'}</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-4">
//                   <div className="border border-dashed border-gray-600 rounded-xl p-6 text-center">
//                     <input
//                       type="file"
//                       multiple
//                       ref={fileInputRef}
//                       onChange={(e) => setDataFiles(Array.from(e.target.files))}
//                       className="hidden"
//                       id="file-upload"
//                       disabled={isProcessing}
//                     />
//                     <label 
//                       htmlFor="file-upload" 
//                       className="flex flex-col items-center justify-center cursor-pointer"
//                     >
//                       <Upload size={48} className="mb-4 text-gray-500" />
//                       <h3 className="text-lg font-medium">Select files to upload</h3>
//                       <p className="text-gray-400 mt-1">Drag & drop or click to browse</p>
//                       <p className="text-xs text-gray-500 mt-2">Max file size: 100MB</p>
//                     </label>
//                   </div>

//                   {dataFiles.length > 0 && (
//                     <div className="bg-gray-900/30 rounded-xl p-4">
//                       <h4 className="font-medium mb-3">Selected Files:</h4>
//                       <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
//                         {dataFiles.map((file, index) => (
//                           <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
//                             <div className="flex items-center gap-3">
//                               <FileText size={16} className="text-gray-400" />
//                               <div>
//                                 <p className="text-sm truncate max-w-[200px]">{file.name}</p>
//                                 <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
//                               </div>
//                             </div>
//                             <button 
//                               onClick={() => handleFileDelete(index)}
//                               className="text-gray-500 hover:text-red-400"
//                             >
//                               <XCircle size={18} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   <button
//                     onClick={handleSubmit}
//                     className="btn-action w-full"
//                     disabled={isProcessing || !dataFiles.length}
//                   >
//                     <Upload size={20} /> {isProcessing ? 'Processing...' : 'Upload Securely'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Access View */}
//           {activeNav === 'access' && (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-800/60 rounded-2xl p-6 space-y-6">
//                 <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
//                   {cameraOn ? (
//                     <>
//                       <video 
//                         ref={videoRef} 
//                         autoPlay 
//                         playsInline 
//                         muted
//                         className="w-full h-full object-cover"
//                       />
//                       <canvas ref={canvasRef} className="hidden" />
//                       {isScanning && <FaceScanner />}
//                     </>
//                   ) : (
//                     <div className="flex flex-col items-center text-gray-500">
//                       <Camera size={48} />
//                       <span>Camera {isProcessing ? 'Initializing...' : 'Off'}</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-4 text-center">
//                   <p className="text-gray-400 mb-4">
//                     Verify your identity to access the secure vault
//                   </p>
                  
//                   {verificationSuccess && !isProcessing ? (
//                     <div className="space-y-4">
//                       <div className="p-4 bg-green-900/30 rounded-lg border border-green-600">
//                         <p className="text-green-300">Verification successful!</p>
//                         {countdown > 0 ? (
//                           <p className="text-sm text-green-400 mt-1">
//                             Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
//                           </p>
//                         ) : (
//                           <p className="text-sm text-green-400 mt-1">
//                             Automatic redirect failed. Please click below:
//                           </p>
//                         )}
//                       </div>
//                       <button
//                         onClick={handleManualNavigate}
//                         className="btn-success w-full"
//                       >
//                         <ArrowRight size={20} /> {countdown > 0 ? `(${countdown})` : ''} Go to Vault
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={handleSubmit}
//                       className="btn-action w-full"
//                       disabled={isProcessing}
//                     >
//                       {isProcessing ? (
//                         <>
//                           <Loader2 size={20} className="animate-spin" />
//                           <span className="ml-2">Verifying Identity...</span>
//                         </>
//                       ) : (
//                         <span>Verify & Access Vault</span>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Activity Log View */}
//           {activeNav === 'activity' && (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-800/60 rounded-2xl p-6">
//                 <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
//                   <History size={24} /> Activity History
//                   {loadingActivity && <Loader2 size={20} className="animate-spin ml-2" />}
//                 </h3>
                
//                 {activityLog.length > 0 ? (
//                   <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
//                     {activityLog.map((activity, index) => (
//                       <ActivityItem key={index} activity={activity} />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     {loadingActivity ? (
//                       <div className="flex flex-col items-center">
//                         <Loader2 size={48} className="animate-spin mb-4" />
//                         <p>Loading activities...</p>
//                       </div>
//                     ) : (
//                       <>
//                         <Folder size={48} className="mx-auto text-gray-500 mb-4" />
//                         <h4 className="text-xl font-medium">No activity yet</h4>
//                         <p className="text-gray-400 mt-2">
//                           Your upload and access activities will appear here
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Security Settings View */}
//           {activeNav === 'security' && (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-800/60 rounded-2xl p-6 space-y-8">
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4">Security Settings</h3>
//                   <div className="bg-gray-900/30 rounded-xl p-5">
//                     <SecurityToggle 
//                       label="Biometric Authentication" 
//                       status={securityStatus.biometric} 
//                       onChange={() => setSecurityStatus(prev => ({...prev, biometric: !prev.biometric}))} 
//                     />
//                     <SecurityToggle 
//                       label="Two-Factor Authentication" 
//                       status={securityStatus.twoFactor} 
//                       onChange={() => setSecurityStatus(prev => ({...prev, twoFactor: !prev.twoFactor}))} 
//                     />
//                     <SecurityToggle 
//                       label="End-to-End Encryption" 
//                       status={securityStatus.encryption} 
//                       onChange={() => setSecurityStatus(prev => ({...prev, encryption: !prev.encryption}))} 
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-xl font-semibold mb-4">Security Audit</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="bg-gray-900/30 rounded-xl p-5 border border-green-600/30">
//                       <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 rounded-full bg-green-900/30">
//                           <ShieldCheck size={20} className="text-green-400" />
//                         </div>
//                         <h4 className="font-medium">Authentication</h4>
//                       </div>
//                       <p className="text-sm text-gray-400">Biometric verification enabled</p>
//                     </div>
//                     <div className="bg-gray-900/30 rounded-xl p-5 border border-yellow-600/30">
//                       <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 rounded-full bg-yellow-900/30">
//                           <Lock size={20} className="text-yellow-400" />
//                         </div>
//                         <h4 className="font-medium">2FA Status</h4>
//                       </div>
//                       <p className="text-sm text-gray-400">Two-factor authentication not active</p>
//                     </div>
//                     <div className="bg-gray-900/30 rounded-xl p-5 border border-blue-600/30">
//                       <div className="flex items-center gap-3 mb-3">
//                         <div className="p-2 rounded-full bg-blue-900/30">
//                           <Database size={20} className="text-blue-400" />
//                         </div>
//                         <h4 className="font-medium">Data Encryption</h4>
//                       </div>
//                       <p className="text-sm text-gray-400">AES-256 encryption enabled</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Storage View */}
//           {activeNav === 'storage' && (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-800/60 rounded-2xl p-6 space-y-8">
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4">Storage Management</h3>
//                   <div className="bg-gray-900/30 rounded-xl p-5">
//                     <div className="mb-6">
//                       <div className="flex justify-between text-sm mb-2">
//                         <span>Your Storage</span>
//                         {loadingStorage ? (
//                           <Loader2 size={16} className="animate-spin" />
//                         ) : (
//                           <span>{storageUsage.used.toFixed(1)} MB of {storageUsage.total} MB used</span>
//                         )}
//                       </div>
//                       <div className="w-full bg-gray-700 rounded-full h-3">
//                         {!loadingStorage && (
//                           <div 
//                             className="progress-bar h-3 rounded-full" 
//                             style={{ width: `${Math.min(100, (storageUsage.used / storageUsage.total) * 100)}%` }}
//                           ></div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="space-y-4">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <h4 className="font-medium">Upgrade Storage</h4>
//                           <p className="text-sm text-gray-400">Get more space for your files</p>
//                         </div>
//                         <button 
//                           onClick={handleUpgradeStorage}
//                           className="btn-primary px-4 py-2"
//                         >
//                           Upgrade Plan
//                         </button>
//                       </div>
                      
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <h4 className="font-medium">File Cleanup</h4>
//                           <p className="text-sm text-gray-400">Remove unnecessary files</p>
//                         </div>
//                         <button 
//                           onClick={handleCleanFiles}
//                           className="btn-secondary px-4 py-2"
//                         >
//                           Clean Files
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-xl font-semibold mb-4">Storage Distribution</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="bg-gray-900/30 rounded-xl p-5">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="p-2 rounded-full bg-blue-900/30">
//                           <FileText size={20} className="text-blue-400" />
//                         </div>
//                         <h4 className="font-medium">Documents</h4>
//                       </div>
//                       <p className="text-2xl font-bold mb-1">
//                         {loadingStorage ? '...' : (storageUsage.used * 0.6).toFixed(1)} MB
//                       </p>
//                       <p className="text-sm text-gray-400">60% of storage</p>
//                     </div>
//                     <div className="bg-gray-900/30 rounded-xl p-5">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="p-2 rounded-full bg-purple-900/30">
//                           <ImageIcon size={20} className="text-purple-400" />
//                         </div>
//                         <h4 className="font-medium">Images</h4>
//                       </div>
//                       <p className="text-2xl font-bold mb-1">
//                         {loadingStorage ? '...' : (storageUsage.used * 0.3).toFixed(1)} MB
//                       </p>
//                       <p className="text-sm text-gray-400">30% of storage</p>
//                     </div>
//                     <div className="bg-gray-900/30 rounded-xl p-5">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="p-2 rounded-full bg-green-900/30">
//                           <Folder size={20} className="text-green-400" />
//                         </div>
//                         <h4 className="font-medium">Other</h4>
//                       </div>
//                       <p className="text-2xl font-bold mb-1">
//                         {loadingStorage ? '...' : (storageUsage.used * 0.1).toFixed(1)} MB
//                       </p>
//                       <p className="text-sm text-gray-400">10% of storage</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
//           <div className={`bg-gray-800 p-6 rounded-xl text-center space-y-4 max-w-sm w-full transform scale-95 animate-scale-in border ${
//               modalContent.type === 'error'
//                 ? 'border-red-600'
//                 : modalContent.type === 'success'
//                 ? 'border-green-600'
//                 : 'border-blue-600'
//             }`}
//           >
//             {modalContent.type === 'success' && <CheckCircle2 className="mx-auto text-green-500" size={48} />}
//             {modalContent.type === 'error' && <XCircle className="mx-auto text-red-500" size={48} />}
//             {modalContent.type === 'warning' && <AlertTriangle className="mx-auto text-yellow-500" size={48} />}
//             {modalContent.type === 'info' && <Info className="mx-auto text-blue-500" size={48} />}
//             <h3 className="text-2xl font-bold text-white">{modalContent.title}</h3>
//             <p className="text-gray-300">{modalContent.message}</p>
//             <button 
//               onClick={() => setShowModal(false)}
//               className="btn-primary w-full"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavSidebar from '../components/NavSidebar';
import DashboardView from '../components/DashboardView';
import UploadView from '../components/UploadView';
import AccessView from '../components/AccessView';
import ActivityLogView from '../components/ActivityLogView';
import SecuritySettingsView from '../components/SecuritySettingsView';
import StorageView from '../components/StorageView';
import Modal from '../components/Modal';

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

export default function FaceManager({ setIsLoggedIn }) {
  const [dataFiles, setDataFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });
  const [cameraOn, setCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activityLog, setActivityLog] = useState([]);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 1024 });
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({
    biometric: true,
    twoFactor: false,
    encryption: true
  });
  const [processingMessage, setProcessingMessage] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;
  const sessionId = localStorage.getItem('sessionId');
  const username = localStorage.getItem('username') || 'Unknown User';

  const getToken = () => localStorage.getItem('jwtToken');
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const displayMessage = useCallback((msg, type = 'info', title = '') => {
    setModalContent({
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'),
      message: msg,
      type
    });
    setShowModal(true);
  }, []);

  // API fetch functions
  const fetchActivityLog = useCallback(async () => {
    if (!getToken()) return;
    setLoadingActivity(true);
    try {
      const res = await fetch(`${API_BASE}/api/activity`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) setActivityLog(json.activities);
      else throw new Error(json.message || 'Failed to fetch activity');
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoadingActivity(false);
    }
  }, [displayMessage]);

  const fetchStorageUsage = useCallback(async () => {
    if (!getToken()) return;
    setLoadingStorage(true);
    try {
      const res = await fetch(`${API_BASE}/api/storage`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) setStorageUsage({ used: json.used, total: json.total });
      else throw new Error(json.message || 'Failed to fetch storage');
    } catch (e) {
      displayMessage(e.message, 'error');
    } finally {
      setLoadingStorage(false);
    }
  }, [displayMessage]);

  useEffect(() => {
    if (getToken()) {
      fetchActivityLog();
      fetchStorageUsage();
    }
  }, []);

  useEffect(() => {
    if (activeNav === 'activity') fetchActivityLog();
    else if (activeNav === 'storage') fetchStorageUsage();
  }, [activeNav]);

  // Camera setup
  useEffect(() => {
    let stream;
    if (cameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(s => {
          stream = s;
          videoRef.current.srcObject = s;
          return new Promise(r => videoRef.current.onloadedmetadata = r);
        })
        .then(() => setCameraOn(true))
        .catch(() => {
          displayMessage('Unable to access camera.', 'error', 'Camera Error');
          setCameraOn(false);
        });
    } else {
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [cameraOn, displayMessage]);

  const captureBlob = async () => {
    const vid = videoRef.current;
    const can = canvasRef.current;
    if (!vid || !can) throw new Error('Camera not ready.');
    can.width = vid.videoWidth;
    can.height = vid.videoHeight;
    can.getContext('2d').drawImage(vid, 0, 0);
    return new Promise((res, rej) =>
      can.toBlob(b => b ? res(b) : rej(new Error('Capture failed')), 'image/jpeg', 0.9)
    );
  };

  const prepareAndRun = async (actionFn) => {
    if (!getToken()) {
      displayMessage('Please log in first.', 'error', 'Auth Required');
      return navigate('/login');
    }

    setIsProcessing(true);
    setVerificationSuccess(false);
    setCountdown(5);
    setProcessingMessage('Initializing camera...');
    setCameraOn(true);

    try {
      await new Promise(r => {
        const check = () => {
          if (videoRef.current?.readyState === 4) r();
          else setTimeout(check, 100);
        };
        check();
      });

      setProcessingMessage('Scanning face...');
      setIsScanning(true);
      await new Promise(r => setTimeout(r, 1500));

      setProcessingMessage('Capturing image...');
      const faceBlob = await captureBlob();

      setProcessingMessage(activeNav === 'access' ? 'Accessing vault...' : 'Uploading files...');
      await actionFn(faceBlob);
      setVerificationSuccess(true);
    } catch (e) {
      if (e.message?.toLowerCase().includes('token')) {
        displayMessage('Session expired. Please log in again.', 'error', 'Token Expired');
        setTimeout(() => {
          localStorage.clear();
          setIsLoggedIn(false);
          navigate('/login');
        }, 1500);
      } else {
        displayMessage(e.message || 'Operation failed.', 'error');
      }
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
      setCameraOn(false);
    }
  };

  const handleSubmit = async () => {
    if (activeNav === 'upload') {
      if (!dataFiles.length) return displayMessage('Select files first.', 'error');
      await prepareAndRun(async (blob) => {
        const form = new FormData();
        form.append('face', blob, 'face.jpg');
        dataFiles.forEach(f => form.append('user_files', f, f.name));
        form.append('current_folder', '');
        
        const res = await fetch(`${API_BASE}/api/vault/upload`, {
          method: 'POST', 
          headers: authHeader(), 
          body: form
        });
        
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Upload failed');
        
        fetchActivityLog();
        fetchStorageUsage();
        
        displayMessage(json.message, 'success');
        setDataFiles([]);
        fileInputRef.current.value = '';
      });
    } else if (activeNav === 'access') {
      await prepareAndRun(async (blob) => {
        const form = new FormData();
        form.append('face', blob, 'face.jpg');
        form.append('path', '');
        
        const res = await fetch(`${API_BASE}/api/vault/access`, {
          method: 'POST', 
          headers: authHeader(), 
          body: form
        });
        
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Access failed');
        
        fetchActivityLog();
        
        localStorage.setItem('lastVerifiedFace', await blobToBase64(blob));
        localStorage.setItem('faceVerified', 'true');
        displayMessage('Access granted, redirecting…', 'success');
      });
    }
  };

  const handleManualNavigate = () => navigate('/library');
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleCleanFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/storage/clean`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' }
      });
      
      const json = await res.json();
      if (res.ok) {
        displayMessage(json.message, 'success');
        fetchStorageUsage();
        fetchActivityLog();
      } else {
        throw new Error(json.message || 'Clean failed');
      }
    } catch (e) {
      displayMessage(e.message, 'error');
    }
  };

  const handleUpgradeStorage = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/storage/upgrade`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' }
      });
      
      const json = await res.json();
      if (res.ok) {
        setStorageUsage(prev => ({ ...prev, total: json.newTotal }));
        displayMessage(json.message, 'success');
      } else {
        throw new Error(json.message || 'Upgrade failed');
      }
    } catch (e) {
      displayMessage(e.message, 'error');
    }
  };

  // Redirect logic
  useEffect(() => {
    let redirectTimer;
    let countdownInterval;

    const attemptRedirect = () => {
      setIsRedirecting(true);
      try {
        navigate(`/library/${sessionId}`);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    const startCountdown = () => {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    if (verificationSuccess && activeNav === 'access' && !isRedirecting) {
      startCountdown();
      redirectTimer = setTimeout(attemptRedirect, 5000);
      return () => {
        clearTimeout(redirectTimer);
        clearInterval(countdownInterval);
        setIsRedirecting(false);
      };
    }
  }, [verificationSuccess, activeNav, navigate, isRedirecting]);

  useEffect(() => {
    setVerificationSuccess(false);
    setCountdown(5);
  }, [activeNav]);

  // Render active view
  const renderActiveView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView 
          setActiveNav={setActiveNav} 
          activityLog={activityLog} 
          loadingActivity={loadingActivity} 
          storageUsage={storageUsage} 
          loadingStorage={loadingStorage} 
        />;
      case 'upload':
        return <UploadView 
          cameraOn={cameraOn} 
          videoRef={videoRef} 
          canvasRef={canvasRef} 
          isScanning={isScanning} 
          isProcessing={isProcessing} 
          dataFiles={dataFiles} 
          setDataFiles={setDataFiles} 
          fileInputRef={fileInputRef} 
          handleSubmit={handleSubmit} 
        />;
      case 'access':
        return <AccessView 
          cameraOn={cameraOn} 
          videoRef={videoRef} 
          canvasRef={canvasRef} 
          isScanning={isScanning} 
          isProcessing={isProcessing} 
          verificationSuccess={verificationSuccess} 
          countdown={countdown} 
          handleSubmit={handleSubmit} 
          handleManualNavigate={handleManualNavigate} 
        />;
      case 'activity':
        return <ActivityLogView 
          activityLog={activityLog} 
          loadingActivity={loadingActivity} 
        />;
      case 'security':
        return <SecuritySettingsView 
          securityStatus={securityStatus} 
          setSecurityStatus={setSecurityStatus} 
        />;
      case 'storage':
        return <StorageView 
          storageUsage={storageUsage} 
          loadingStorage={loadingStorage} 
          handleUpgradeStorage={handleUpgradeStorage} 
          handleCleanFiles={handleCleanFiles} 
        />;
      default:
        return <DashboardView 
          setActiveNav={setActiveNav} 
          activityLog={activityLog} 
          loadingActivity={loadingActivity} 
          storageUsage={storageUsage} 
          loadingStorage={loadingStorage} 
        />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
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
        .btn-success {
          @apply flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg hover:bg-green-700 transition duration-200;
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
        .progress-bar {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.5s ease;
        }
      `}</style>

      <NavSidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        handleLogout={handleLogout} 
        username={username} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
              <ShieldCheck size={16} className="text-green-400" />
              <span>Biometric Active</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
              <Database size={16} className="text-blue-400" />
              <span>
                {loadingStorage ? '...' : storageUsage.used.toFixed(1)}/
                {loadingStorage ? '...' : storageUsage.total} MB
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {renderActiveView()}
        </div>
      </div>

      <Modal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        modalContent={modalContent} 
      />
    </div>
  );
}
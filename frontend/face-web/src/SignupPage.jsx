
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//   UserPlus,
//   User,
//   Lock,
//   Camera,
//   Scan,
//   EyeOff,
//   Eye,
//   Loader2,
//   XCircle,
//   CheckCircle2,
//   Trash2
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

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

// export default function SignupPage() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [snapshots, setSnapshots] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [cameraOn, setCameraOn] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [modal, setModal] = useState({ title: '', message: '', type: 'info' });

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const navigate = useNavigate();
//   const API = import.meta.env.VITE_API_BASE;

//   const showMessage = useCallback((message, type = 'info', title = '') => {
//     setModal({ title: title || (type === 'error' ? 'Error' : 'Info'), message, type });
//     setShowModal(true);
//   }, []);

//   useEffect(() => {
//     let stream;
//     if (cameraOn) {
//       navigator.mediaDevices
//         .getUserMedia({ video: { facingMode: 'user' } })
//         .then((s) => {
//           stream = s;
//           videoRef.current.srcObject = s;
//           return new Promise((r) => (videoRef.current.onloadedmetadata = r));
//         })
//         .then(() => setCameraOn(true))
//         .catch(() => {
//           showMessage('Cannot access camera.', 'error', 'Camera Error');
//           setCameraOn(false);
//         });
//     } else if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
//       videoRef.current.srcObject = null;
//     }
//     return () => stream?.getTracks().forEach((t) => t.stop());
//   }, [cameraOn, showMessage]);

//   const captureBlob = async () => {
//     const vid = videoRef.current;
//     const can = canvasRef.current;
//     if (!vid || !can) throw new Error('Camera not ready.');
//     can.width = vid.videoWidth;
//     can.height = vid.videoHeight;
//     can.getContext('2d').drawImage(vid, 0, 0);
//     return new Promise((res, rej) =>
//       can.toBlob((b) => (b ? res(b) : rej(new Error('Capture failed'))), 'image/jpeg', 0.9)
//     );
//   };

//   const addSnapshot = async () => {
//     if (snapshots.length >= 5) {
//       showMessage('Maximum 5 samples allowed.', 'warning');
//       return;
//     }
//     try {
//       setIsProcessing(true);
//       const blob = await captureBlob();
//       setSnapshots((prev) => [...prev, blob]);
//     } catch (e) {
//       showMessage(e.message, 'error', 'Capture Error');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const appendSnapshots = (form) => {
//     snapshots.forEach((b, i) => form.append('faces', b, `face_${i + 1}.jpg`));
//   };

//   const submitSignup = async () => {
//     if (!username || !password || !confirmPassword) {
//       showMessage('Fill all fields.', 'warning');
//       return;
//     }
//     if (password !== confirmPassword) {
//       showMessage('Passwords must match.', 'warning');
//       return;
//     }
//     if (snapshots.length < 3) {
//       showMessage('Capture at least 3 face samples.', 'warning');
//       return;
//     }

//     setIsProcessing(true);
//     setCameraOn(false);

//     const form = new FormData();
//     form.append('username', username);
//     form.append('password', password);
//     appendSnapshots(form);

//     try {
//       const res = await fetch(`${API}/api/signup`, { method: 'POST', body: form });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       showMessage('Signup complete! Please log in.', 'success');
//       navigate('/login');
//     } catch (e) {
//       showMessage(e.message, 'error', 'Signup Failed');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
//       <style jsx>{`
//         @keyframes spin-slow { to { transform: rotate(360deg); } }
//         @keyframes scan-line-v { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
//         @keyframes scan-line-h { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
//         .animate-spin-slow { animation: spin-slow 8s linear infinite; }
//         .animate-scan-line-v { animation: scan-line-v 3s linear infinite; }
//         .animate-scan-line-h { animation: scan-line-h 3s linear infinite reverse; }
//       `}</style>

//       <div className="bg-gray-900/70 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full space-y-6 relative">
//         <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
//           Sign Up
//         </h1>

//         {/* Username, Password, Confirm Password */}
//         <div className="space-y-4">
//           <div>
//             <label className="block text-gray-300 mb-1">Username</label>
//             <div className="flex items-center bg-gray-800 p-2 rounded-lg">
//               <User className="text-gray-400 mr-2" />
//               <input
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 disabled={isProcessing}
//                 className="bg-transparent outline-none text-white flex-1"
//                 placeholder="Choose a username"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-gray-300 mb-1">Password</label>
//             <div className="flex items-center bg-gray-800 p-2 rounded-lg">
//               <Lock className="text-gray-400 mr-2" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isProcessing}
//                 className="bg-transparent outline-none text-white flex-1"
//                 placeholder="Create a password"
//               />
//               <button onClick={() => setShowPassword((v) => !v)}>
//                 {showPassword ? <EyeOff /> : <Eye />}
//               </button>
//             </div>
//           </div>
//           <div>
//             <label className="block text-gray-300 mb-1">Confirm Password</label>
//             <div className="flex items-center bg-gray-800 p-2 rounded-lg">
//               <Lock className="text-gray-400 mr-2" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 disabled={isProcessing}
//                 className="bg-transparent outline-none text-white flex-1"
//                 placeholder="Confirm password"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Face Capture Section */}
//         <div className="space-y-4">
//           <p className="text-center text-gray-300">Capture 3–5 face samples. Click to turn camera on.</p>
//           <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center">
//             {cameraOn ? (
//               <>
//                 <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
//                 <canvas ref={canvasRef} className="hidden" />
//                 {isProcessing && <FaceScanner />}
//               </>
//             ) : (
//               <button
//                 onClick={() => setCameraOn(true)}
//                 className="text-gray-400 hover:text-blue-400 text-center"
//               >
//                 <Camera size={48} />
//                 <p>Turn Camera On</p>
//               </button>
//             )}
//           </div>

//           <div className="flex gap-2">
//             <button
//               onClick={addSnapshot}
//               disabled={isProcessing || !cameraOn}
//               className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow hover:from-green-600 hover:to-emerald-700 transition"
//             >
//               <Camera className="inline-block mr-2" />
//               Capture ({snapshots.length})
//             </button>

//             <button
//               onClick={() => setSnapshots([])}
//               disabled={isProcessing || snapshots.length === 0}
//               className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow hover:from-red-600 hover:to-pink-700 transition"
//             >
//               <Trash2 className="inline-block mr-2" />
//               Clear
//             </button>
//           </div>

//           <div className="grid grid-cols-3 gap-2 max-h-24 overflow-auto">
//             {snapshots.map((b, i) => (
//               <div key={i} className="relative w-24 h-24 rounded overflow-hidden border-2 border-green-500">
//                 <img src={URL.createObjectURL(b)} className="w-full h-full object-cover" alt="" />
//                 <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
//                   #{i + 1}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={submitSignup}
//           disabled={isProcessing}
//           className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-800 transition"
//         >
//           {isProcessing ? <Loader2 className="animate-spin" /> : <UserPlus />}
//           {isProcessing ? 'Registering…' : 'Complete Sign Up'}
//         </button>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//           <div className="bg-gray-800 p-6 rounded-lg text-center space-y-4">
//             {modal.type === 'success' && <CheckCircle2 className="mx-auto text-green-500" size={48} />}
//             {modal.type === 'error' && <XCircle className="mx-auto text-red-500" size={48} />}
//             <h2 className="text-xl font-bold text-white">{modal.title}</h2>
//             <p className="text-gray-300">{modal.message}</p>
//             <button
//               onClick={() => setShowModal(false)}
//               className="mt-4 px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow hover:from-gray-700 hover:to-gray-800 transition"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanFace, Home, LogIn, HelpCircle, User, Lock, Eye, EyeOff, UserPlus, Camera, 
  Trash2, X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Smile, Meh, Lightbulb,
  Lock as LockIcon, Shield, CheckCircle2, Loader2, XCircle, Scan
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const SignupPage = () => {
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Camera and face capture states
  const [cameraOn, setCameraOn] = useState(false);
  const [snapshots, setSnapshots] = useState(Array(10).fill(null));
  const [currentPose, setCurrentPose] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ 
    title: '', 
    message: '', 
    type: 'info' 
  });

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE;

  // Pose guidance data
  const poses = [
    { id: 0, text: 'Look straight ahead', icon: <User className="text-blue-400" /> },
    { id: 1, text: 'Turn head slightly left', icon: <ArrowLeft className="text-blue-400" /> },
    { id: 2, text: 'Turn head slightly right', icon: <ArrowRight className="text-blue-400" /> },
    { id: 3, text: 'Tilt head up', icon: <ArrowUp className="text-blue-400" /> },
    { id: 4, text: 'Tilt head down', icon: <ArrowDown className="text-blue-400" /> },
    { id: 5, text: 'Turn head left', icon: <ArrowLeft className="text-blue-400" /> },
    { id: 6, text: 'Turn head right', icon: <ArrowRight className="text-blue-400" /> },
    { id: 7, text: 'Smile!', icon: <Smile className="text-yellow-400" /> },
    { id: 8, text: 'Neutral expression', icon: <Meh className="text-purple-400" /> },
    { id: 9, text: 'Blink eyes', icon: <Eye className="text-green-400" /> },
  ];

  // Initialize camera
  useEffect(() => {
    let stream = null;
    
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        showModalMessage('Camera Error', 'Cannot access camera. Please check permissions.', 'error');
        setCameraOn(false);
      }
    };
    
    if (cameraOn) {
      initCamera();
    } else if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  // Capture image from video stream as Blob
  const captureBlob = async () => {
    if (!cameraOn || !videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Capture failed')),
        'image/jpeg',
        0.9
      );
    });
  };

  // Handle image capture
  const handleCapture = async () => {
    if (isProcessing) return;
    
    const capturedCount = snapshots.filter(img => img !== null).length;
    if (capturedCount >= 10) {
      showModalMessage('Limit Reached', 'Maximum 10 samples allowed.', 'info');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const blob = await captureBlob();
      const newSnapshots = [...snapshots];
      newSnapshots[capturedCount] = blob;
      setSnapshots(newSnapshots);
      
      // Move to next pose if not the last one
      if (currentPose < 9) {
        setCurrentPose(prev => prev + 1);
      }
    } catch (e) {
      showModalMessage('Capture Error', e.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete a specific snapshot
  const deleteSnapshot = (index) => {
    const newSnapshots = [...snapshots];
    newSnapshots[index] = null;
    setSnapshots(newSnapshots);
    
    // If deleting the last captured image, go back one pose
    const lastIndex = newSnapshots.lastIndexOf(null) - 1;
    if (lastIndex >= 0 && lastIndex < currentPose) {
      setCurrentPose(lastIndex);
    }
  };

  // Clear all snapshots
  const clearAllSnapshots = () => {
    setSnapshots(Array(10).fill(null));
    setCurrentPose(0);
  };

  // Show modal message
  const showModalMessage = (title, message, type = 'info') => {
    setModalContent({
      title,
      message,
      type
    });
    setShowModal(true);
  };

  // Prepare form data for submission
  const appendSnapshots = (form) => {
    snapshots.forEach((blob, index) => {
      if (blob) {
        form.append('faces', blob, `face_${index + 1}.jpg`);
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const capturedCount = snapshots.filter(img => img !== null).length;
    
    if (!username || !password || !confirmPassword) {
      showModalMessage('Missing Information', 'Please fill in all fields.', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showModalMessage('Password Mismatch', 'Passwords do not match.', 'error');
      return;
    }
    
    if (capturedCount < 3) {
      showModalMessage('Insufficient Samples', 'Please capture at least 3 face samples.', 'error');
      return;
    }
    
    setIsProcessing(true);
    setCameraOn(false);

    try {
      const form = new FormData();
      form.append('username', username);
      form.append('password', password);
      appendSnapshots(form);

      const res = await fetch(`${API}/api/signup`, { 
        method: 'POST', 
        body: form 
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      showModalMessage('Success!', 'Account created successfully. Redirecting to login...', 'success');
      
      // Redirect after delay
      setTimeout(() => {
        setShowModal(false);
        navigate('/login');
      }, 3000);
    } catch (e) {
      showModalMessage('Signup Failed', e.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate captured count
  const capturedCount = snapshots.filter(img => img !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-300">
      <style jsx>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes scan-line-v { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes scan-line-h { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-scan-line-v { animation: scan-line-v 3s linear infinite; }
        .animate-scan-line-h { animation: scan-line-h 3s linear infinite reverse; }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-8px); }
        }
        
        @keyframes bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }
        
        @keyframes bounce-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes bounce-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-bounce-left {
          animation: bounce-left 1.5s ease-in-out infinite;
        }
        
        .animate-bounce-right {
          animation: bounce-right 1.5s ease-in-out infinite;
        }
        
        .animate-bounce-up {
          animation: bounce-up 1.5s ease-in-out infinite;
        }
        
        .animate-bounce-down {
          animation: bounce-down 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-2 rounded-full">
            <ScanFace className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            SecureSign
          </h1>
        </div>
        
        <nav>
          <ul className="flex gap-4">
            <li>
              <a href="#" className="flex items-center gap-1 hover:text-white transition-colors">
                <Home size={18} /> Home
              </a>
            </li>
            <li>
              <a href="/login" className="flex items-center gap-1 hover:text-white transition-colors">
                <LogIn size={18} /> Login
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-1 hover:text-white transition-colors">
                <HelpCircle size={18} /> Support
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 shadow-xl">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-gray-400 mb-6">Secure authentication with facial recognition</p>
            
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="mb-5">
                <label htmlFor="username" className="block text-gray-300 mb-2">Username</label>
                <div className="flex items-center bg-gray-800/70 px-4 py-3 rounded-xl border border-gray-700">
                  <User className="text-gray-400 mr-3" size={20} />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-white"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              {/* Password */}
              <div className="mb-5">
                <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
                <div className="flex items-center bg-gray-800/70 px-4 py-3 rounded-xl border border-gray-700">
                  <Lock className="text-gray-400 mr-3" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-white"
                    placeholder="Create a strong password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {/* Confirm Password */}
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">Confirm Password</label>
                <div className="flex items-center bg-gray-800/70 px-4 py-3 rounded-xl border border-gray-700">
                  <Lock className="text-gray-400 mr-3" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-white"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                  isProcessing ? 'opacity-70' : 'hover:from-blue-700 hover:to-purple-800 hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
                {isProcessing ? 'Registering...' : 'Complete Sign Up'}
              </button>
            </form>
            
            {/* Pose Guidance */}
            <div className="mt-8 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-blue-400">Capture Guidance</h3>
                <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Step {currentPose + 1} of 10
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-blue-900/20 p-3 rounded-lg">
                  <div className={`${poses[currentPose].id === 1 || poses[currentPose].id === 5 ? 'animate-bounce-left' : ''} 
                                ${poses[currentPose].id === 2 || poses[currentPose].id === 6 ? 'animate-bounce-right' : ''}
                                ${poses[currentPose].id === 3 ? 'animate-bounce-up' : ''}
                                ${poses[currentPose].id === 4 ? 'animate-bounce-down' : ''}
                                ${poses[currentPose].id === 7 || poses[currentPose].id === 9 ? 'animate-pulse' : ''}`}>
                    {poses[currentPose].icon}
                  </div>
                </div>
                <p className="text-lg">{poses[currentPose].text}</p>
              </div>
              
              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {poses.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-3 h-3 rounded-full ${index <= currentPose ? 'bg-blue-500' : 'bg-gray-700'}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Tips Section */}
            <div className="mt-6 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2 mb-3">
                <Lightbulb size={20} />
                Tips for Best Results
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Ensure good lighting on your face</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Remove hats, glasses, or face coverings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Position yourself at eye level with the camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Maintain a neutral expression for most captures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Follow the on-screen guidance for each pose</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Column - Camera & Face Capture */}
          <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Face Verification</h2>
            <p className="text-gray-400 mb-6">Capture 10 images from different angles</p>
            
            {/* Camera Area */}
            <div className="relative bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700 h-80 flex items-center justify-center mb-6 overflow-hidden">
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
                  
                  {isProcessing && <FaceScanner />}
                </>
              ) : (
                <div className="text-center p-8">
                  <Camera className="mx-auto text-gray-500 mb-4 animate-pulse" size={48} />
                  <p className="text-gray-400 mb-2">Camera will activate once you begin</p>
                  <p className="text-gray-500 animate-pulse">Please allow camera access</p>
                </div>
              )}
            </div>
            
            {/* Camera Controls */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${
                  cameraOn 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white font-medium transition-colors`}
              >
                <Camera size={18} />
                {cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
              </button>
              
              <button
                onClick={handleCapture}
                disabled={!cameraOn || isProcessing}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${
                  cameraOn && !isProcessing 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 cursor-not-allowed'
                } text-white font-medium transition-colors`}
              >
                <Camera size={18} />
                Capture ({capturedCount}/10)
              </button>
              
              <button
                onClick={clearAllSnapshots}
                disabled={capturedCount === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${
                  capturedCount > 0 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-700 cursor-not-allowed'
                } text-white font-medium transition-colors`}
              >
                <Trash2 size={18} />
                Clear All
              </button>
            </div>
            
            {/* Samples Grid */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Your Face Samples</h3>
                <span className="text-gray-400">{capturedCount} captured</span>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {snapshots.map((snapshot, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                      snapshot ? 'border-green-500/50' : 'border-gray-700'
                    }`}
                  >
                    {snapshot ? (
                      <>
                        <img 
                          src={URL.createObjectURL(snapshot)} 
                          alt={`Snapshot ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => deleteSnapshot(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-800/50 flex items-center justify-center">
                        <div className="text-gray-500">#{index + 1}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-10 border-t border-gray-800 text-center">
        <p className="text-gray-500">© 2023 SecureSign. All rights reserved.</p>
        <p className="text-gray-500 mt-1">Advanced biometric authentication system</p>
        
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
            <LockIcon size={16} className="text-blue-400" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
            <Shield size={16} className="text-green-400" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </footer>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 text-center">
            <div className="flex justify-center mb-4">
              {modalContent.type === 'success' ? (
                <CheckCircle2 className="text-green-500" size={48} />
              ) : (
                <XCircle className="text-red-500" size={48} />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{modalContent.title}</h3>
            <p className="text-gray-300 mb-6">{modalContent.message}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
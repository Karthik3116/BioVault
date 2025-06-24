
// LoginPage.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  User,
  Lock,
  LogIn,
  Camera,
  Scan,
  EyeOff,
  Eye,
  Loader2,
  Info,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
// Face Scanner Overlay
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

// Convert base64 → Blob
const base64ToBlob = (b64, type = 'image/jpeg') => {
  try {
    const bin = atob(b64);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i);
    return new Blob([buf], { type });
  } catch {
    return null;
  }
};

export default function LoginPage({ setIsLoggedIn, setUsername: setAppUsername }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState({ title: '', message: '', type: 'info' });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE;

  // Show modal
  const showMessage = useCallback((message, type = 'info', title = '') => {
    setModal({ title: title || (type === 'error' ? 'Error' : 'Info'), message, type });
    setShowModal(true);
  }, []);

  // Camera effect
  useEffect(() => {
    let stream;
    if (cameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          videoRef.current.srcObject = stream;
          return new Promise((r) => (videoRef.current.onloadedmetadata = r));
        })
        .then(() => setCameraOn(true))
        .catch(() => {
          showMessage('Cannot access camera.', 'error', 'Camera Error');
          setCameraOn(false);
        });
    } else if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [cameraOn, showMessage]);

  // Capture face snapshot
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

  // Perform login + face scan
  const loginWithFace = async () => {
    if (!username.trim() || !password) {
      showMessage('Enter both username and password.', 'error', 'Missing Credentials');
      return;
    }
    setIsProcessing(true);
    setCameraOn(true);
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const faceBlob = await captureBlob();
      const form = new FormData();
      form.append('username', username);
      form.append('password', password);
      form.append('face', faceBlob, 'face.jpg');

      const res = await fetch(`${API}/api/login`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Success
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('username', data.username);
      setAppUsername(data.username);
      setIsLoggedIn(true);
      showMessage('Login successful!', 'success', 'Welcome');
      navigate('/vault');
    } catch (e) {
      showMessage(e.message, 'error', 'Login Failed');
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
      setCameraOn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes scan-line-v { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes scan-line-h { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-scan-line-v { animation: scan-line-v 3s linear infinite; }
        .animate-scan-line-h { animation: scan-line-h 3s linear infinite reverse; }
        .btn-action { @apply flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold; }
        .btn-secondary { @apply flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl; }
      `}</style>

      <div className="bg-gray-900/70 backdrop-blur rounded-3xl p-8 max-w-md w-full space-y-6 relative">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Login to Vault
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Username</label>
            <div className="flex items-center bg-gray-800 p-2 rounded-lg">
              <User className="text-gray-400 mr-2" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isProcessing}
                className="bg-transparent outline-none text-white flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Password</label>
            <div className="flex items-center bg-gray-800 p-2 rounded-lg">
              <Lock className="text-gray-400 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
                className="bg-transparent outline-none text-white flex-1"
              />
              <button onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff className="text-gray-400" /> : <Eye className="text-gray-400" />}
              </button>
            </div>
          </div>

          <button
  onClick={loginWithFace}
  disabled={isProcessing}
  className="
    w-full /* Ensures the button takes full width */
    relative /* Needed if you plan complex absolute positioning inside later, good practice */
    flex items-center justify-center gap-2 /* Centers content and adds space between icon/text */

    /* Colors and Background */
    bg-gradient-to-r from-blue-600 to-purple-700 /* The vibrant gradient background */
    text-white /* White text and icon color */

    /* Shape and Spacing */
    px-8 py-3.5 /* Horizontal and vertical padding */
    rounded-xl /* Rounded corners for a modern look */

    /* Shadows for depth */
    shadow-lg hover:shadow-xl /* Subtle shadow that grows on hover */

    /* Transitions for smooth animations */
    transition-all duration-300 ease-in-out /* Smooth changes for colors, shadows, etc. */

    /* Disabled state styling */
    disabled:opacity-60 /* Makes the button semi-transparent when disabled */
    disabled:cursor-not-allowed /* Changes cursor to indicate it's not clickable */
    disabled:from-gray-500 disabled:to-gray-600 /* Muted gray gradient when disabled */
  "
>
  {isProcessing && !isScanning ? (
    <>
      {/* Loader icon with spin animation and white color */}
      <Loader2 size={24} className="animate-spin text-white" />
      {/* Text for processing state */}
      <span className="ml-2">Verifying…</span>
    </>
  ) : (
    <>
      {/* Login icon appropriately sized */}
      <LogIn size={24} />
      {/* Text for default state */}
      <span className="ml-2">Login & Scan Face</span>
    </>
  )}
</button>
 <p className="text-center text-gray-400 text-sm mt-4">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 underline">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Camera + Scanner */}
        <div className={`absolute inset-0 bg-gray-900/50 rounded-3xl flex items-center justify-center ${isScanning ? 'block' : 'hidden'}`}>
          {cameraOn ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-3xl" />
              <canvas ref={canvasRef} className="hidden" />
              {isScanning && <FaceScanner />}
            </>
          ) : (
            <div className="text-gray-500">
              <Camera size={48} />
              <p>Camera Off</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg text-center space-y-4">
            {modal.type === 'success' && <CheckCircle2 className="mx-auto text-green-500" size={48} />}
            {modal.type === 'error' && <XCircle className="mx-auto text-red-500" size={48} />}
            <h2 className="text-xl font-bold">{modal.title}</h2>
            <p>{modal.message}</p>
            <button onClick={() => setShowModal(false)} className="btn-secondary mt-4">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

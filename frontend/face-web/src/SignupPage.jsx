
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UserPlus,
  User,
  Lock,
  Camera,
  Scan,
  EyeOff,
  Eye,
  Loader2,
  XCircle,
  CheckCircle2,
  Trash2
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

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState({ title: '', message: '', type: 'info' });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE;

  const showMessage = useCallback((message, type = 'info', title = '') => {
    setModal({ title: title || (type === 'error' ? 'Error' : 'Info'), message, type });
    setShowModal(true);
  }, []);

  useEffect(() => {
    let stream;
    if (cameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          videoRef.current.srcObject = s;
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

  const addSnapshot = async () => {
    if (snapshots.length >= 5) {
      showMessage('Maximum 5 samples allowed.', 'warning');
      return;
    }
    try {
      setIsProcessing(true);
      const blob = await captureBlob();
      setSnapshots((prev) => [...prev, blob]);
    } catch (e) {
      showMessage(e.message, 'error', 'Capture Error');
    } finally {
      setIsProcessing(false);
    }
  };

  const appendSnapshots = (form) => {
    snapshots.forEach((b, i) => form.append('faces', b, `face_${i + 1}.jpg`));
  };

  const submitSignup = async () => {
    if (!username || !password || !confirmPassword) {
      showMessage('Fill all fields.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showMessage('Passwords must match.', 'warning');
      return;
    }
    if (snapshots.length < 3) {
      showMessage('Capture at least 3 face samples.', 'warning');
      return;
    }

    setIsProcessing(true);
    setCameraOn(false);

    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    appendSnapshots(form);

    try {
      const res = await fetch(`${API}/api/signup`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMessage('Signup complete! Please log in.', 'success');
      navigate('/login');
    } catch (e) {
      showMessage(e.message, 'error', 'Signup Failed');
    } finally {
      setIsProcessing(false);
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
      `}</style>

      <div className="bg-gray-900/70 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full space-y-6 relative">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Sign Up
        </h1>

        {/* Username, Password, Confirm Password */}
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
                placeholder="Choose a username"
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
                placeholder="Create a password"
              />
              <button onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Confirm Password</label>
            <div className="flex items-center bg-gray-800 p-2 rounded-lg">
              <Lock className="text-gray-400 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isProcessing}
                className="bg-transparent outline-none text-white flex-1"
                placeholder="Confirm password"
              />
            </div>
          </div>
        </div>

        {/* Face Capture Section */}
        <div className="space-y-4">
          <p className="text-center text-gray-300">Capture 3–5 face samples. Click to turn camera on.</p>
          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center">
            {cameraOn ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                {isProcessing && <FaceScanner />}
              </>
            ) : (
              <button
                onClick={() => setCameraOn(true)}
                className="text-gray-400 hover:text-blue-400 text-center"
              >
                <Camera size={48} />
                <p>Turn Camera On</p>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addSnapshot}
              disabled={isProcessing || !cameraOn}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow hover:from-green-600 hover:to-emerald-700 transition"
            >
              <Camera className="inline-block mr-2" />
              Capture ({snapshots.length})
            </button>

            <button
              onClick={() => setSnapshots([])}
              disabled={isProcessing || snapshots.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow hover:from-red-600 hover:to-pink-700 transition"
            >
              <Trash2 className="inline-block mr-2" />
              Clear
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-24 overflow-auto">
            {snapshots.map((b, i) => (
              <div key={i} className="relative w-24 h-24 rounded overflow-hidden border-2 border-green-500">
                <img src={URL.createObjectURL(b)} className="w-full h-full object-cover" alt="" />
                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={submitSignup}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-800 transition"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {isProcessing ? 'Registering…' : 'Complete Sign Up'}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center space-y-4">
            {modal.type === 'success' && <CheckCircle2 className="mx-auto text-green-500" size={48} />}
            {modal.type === 'error' && <XCircle className="mx-auto text-red-500" size={48} />}
            <h2 className="text-xl font-bold text-white">{modal.title}</h2>
            <p className="text-gray-300">{modal.message}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow hover:from-gray-700 hover:to-gray-800 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

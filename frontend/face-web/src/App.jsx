
// import { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import { FaceScanner } from '../components/FaceScanner';

// export default function App() {
//   const [mode, setMode] = useState('register');
//   const [username, setUsername] = useState('');
//   const [dataFile, setDataFile] = useState(null);
//   const [snapshots, setSnapshots] = useState([]);
//   const [fileList, setFileList] = useState([]);
//   const [message, setMessage] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [modalContent, setModalContent] = useState({ title: '', message: '' });
//   const [cameraOn, setCameraOn] = useState(false);
//   const [isScanning, setIsScanning] = useState(false);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     let stream;
//     if (cameraOn) {
//       navigator.mediaDevices.getUserMedia({ video: true })
//         .then(mediaStream => {
//           stream = mediaStream;
//           if (videoRef.current) {
//             videoRef.current.srcObject = stream;
//           }
//         })
//         .catch(err => {
//           console.error("Error accessing camera:", err);
//           setMessage('Camera access denied.');
//           setCameraOn(false);
//         });
//     } else {
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//         videoRef.current.srcObject = null;
//       }
//     }
//     return () => {
//       if (stream) stream.getTracks().forEach(track => track.stop());
//     };
//   }, [cameraOn]);

//   const captureBlob = async () => {
//     const vid = videoRef.current;
//     const can = canvasRef.current;

//     if (!vid || !can || vid.videoWidth === 0 || vid.videoHeight === 0) {
//       setMessage("Camera not ready.");
//       throw new Error("Video or canvas not ready.");
//     }

//     can.width = vid.videoWidth;
//     can.height = vid.videoHeight;
//     can.getContext('2d').drawImage(vid, 0, 0, can.width, can.height);

//     return new Promise((resolve, reject) => {
//       can.toBlob(blob => blob ? resolve(blob) : reject(new Error("Capture failed")), 'image/jpeg');
//     });
//   };

//   const captureView = async () => {
//     try {
//       const blob = await captureBlob();
//       setSnapshots(prev => [...prev, blob]);
//       setMessage(`View ${snapshots.length + 1} captured.`);
//     } catch (e) {
//       setMessage(`Error capturing view: ${e.message}`);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!username.trim()) {
//       setModalContent({ title: 'Missing Username', message: 'Please enter a username.' });
//       setShowModal(true);
//       return;
//     }

//     setMessage('');
//     const form = new FormData();
//     form.append('username', username);

//     try {
//       setIsScanning(true);

//       if (mode === 'register') {
//         if (!snapshots.length) {
//           setModalContent({ title: 'No Captures', message: 'Capture at least one view.' });
//           setShowModal(true);
//           setIsScanning(false);
//           return;
//         }

//         snapshots.forEach((blob, i) => form.append('faces', blob, `view_${i + 1}.jpg`));
//         const res = await axios.post('http://localhost:8000/register', form);
//         setMessage(res.data.message);
//         setSnapshots([]);
//       } else {
//         const faceBlob = await captureBlob();
//         form.append('face', faceBlob, 'face.jpg');

//         if (mode === 'upload') {
//           if (!dataFile) {
//             setModalContent({ title: 'No File', message: 'Please select a file.' });
//             setShowModal(true);
//             setIsScanning(false);
//             return;
//           }
//           form.append('user_file', dataFile, dataFile.name);
//           const res = await axios.post('http://localhost:8000/upload', form);
//           setMessage(res.data.message);
//           setDataFile(null);
//         } else if (mode === 'access') {
//           const res = await axios.post('http://localhost:8000/access', form);
//           if (res.data.status === 'success') {
//             setFileList(res.data.files || []);
//             setMessage(res.data.message);
//           } else {
//             setMessage(res.data.message || 'Access denied.');
//           }
//         }
//       }
//     } catch (e) {
//       console.error(e);
//       setModalContent({
//         title: 'Operation Failed',
//         message: e?.response?.data?.detail?.message || e.message
//       });
//       setShowModal(true);
//     } finally {
//       setIsScanning(false);
//       setCameraOn(false);
//     }
//   };

//   const downloadFile = async (file) => {
//     setMessage(`Verifying face to download ${file}...`);
//     setIsScanning(true);
//     const form = new FormData();
//     form.append('username', username);
//     try {
//       const faceBlob = await captureBlob();
//       form.append('face', faceBlob, 'face.jpg');
//       form.append('filename', file);

//       const res = await axios.post('http://localhost:8000/download', form, { responseType: 'blob' });

//       const url = URL.createObjectURL(res.data);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = file;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);

//       setMessage(`${file} downloaded successfully.`);
//     } catch (e) {
//       console.error("Download failed:", e);
//       setModalContent({
//         title: 'Download Failed',
//         message: e?.response?.data?.detail?.message || e.message
//       });
//       setShowModal(true);
//     } finally {
//       setIsScanning(false);
//       setCameraOn(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 relative">
//       <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md relative z-10">
//         <h1 className="text-2xl font-bold text-center mb-4 text-indigo-700">🔐 Face File Manager</h1>

//         <select
//           className="w-full mb-4 p-2 border rounded-md"
//           value={mode}
//           onChange={e => {
//             setMode(e.target.value);
//             setMessage('');
//             setFileList([]);
//             setSnapshots([]);
//             setDataFile(null);
//             setCameraOn(false);
//           }}
//         >
//           <option value="register">Register Face(s)</option>
//           <option value="upload">Upload File</option>
//           <option value="access">Access Files</option>
//         </select>

//         <input
//           className="w-full mb-4 p-2 border rounded-md"
//           placeholder="Enter username"
//           value={username}
//           onChange={e => setUsername(e.target.value)}
//         />

//         {cameraOn && (
//           <div className="relative mb-4">
//             <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-md" />
//             <canvas ref={canvasRef} style={{ display: 'none' }} />
//             {isScanning && <FaceScanner />}
//           </div>
//         )}

//         {mode === 'register' && (
//           <>
//             <button
//               className="w-full bg-indigo-600 text-white py-2 rounded-md mb-2"
//               onClick={() => setCameraOn(prev => !prev)}
//             >
//               {cameraOn ? 'Stop Camera' : 'Start Camera'}
//             </button>
//             <button
//               className={`w-full ${cameraOn ? 'bg-purple-600' : 'bg-gray-400'} text-white py-2 rounded-md mb-4`}
//               disabled={!cameraOn}
//               onClick={captureView}
//             >
//               Capture View #{snapshots.length + 1}
//             </button>
//             {snapshots.length > 0 && (
//               <div className="text-sm text-gray-600 mb-2">
//                 {snapshots.map((_, i) => (
//                   <span key={i} className="mr-2 bg-gray-200 px-2 py-1 rounded-full">View {i + 1}</span>
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {mode === 'upload' && (
//           <>
//             <input
//               type="file"
//               onChange={e => setDataFile(e.target.files[0])}
//               className="w-full mb-4"
//             />
//             {dataFile && <p className="text-sm text-gray-500">Selected: {dataFile.name}</p>}
//             <button
//               className="w-full bg-gray-600 text-white py-2 rounded-md mt-2"
//               onClick={() => setCameraOn(true)}
//             >
//               Start Camera for Face Verification
//             </button>
//           </>
//         )}

//         {mode === 'access' && (
//           <button
//             className="w-full bg-gray-600 text-white py-2 rounded-md mb-4"
//             onClick={() => setCameraOn(true)}
//           >
//             Start Camera to Access Files
//           </button>
//         )}

//         <button
//           className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold"
//           onClick={handleSubmit}
//         >
//           {mode === 'register' ? 'Submit Registration' : mode === 'upload' ? 'Upload File' : 'Access Files'}
//         </button>

//         {message && <div className="mt-4 p-2 text-center text-sm text-indigo-700 bg-indigo-100 rounded">{message}</div>}

//         {mode === 'access' && fileList.length > 0 && (
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold mb-2">Files:</h3>
//             <ul className="space-y-2">
//               {fileList.map((file, idx) => (
//                 <li key={idx} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded">
//                   <span>{file}</span>
//                   <button
//                     className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
//                     onClick={() => downloadFile(file)}
//                   >
//                     Download
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {showModal && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//             <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
//               <h3 className="text-lg font-bold mb-2">{modalContent.title}</h3>
//               <p className="text-gray-700 mb-4">{modalContent.message}</p>
//               <button
//                 className="w-full bg-blue-600 text-white py-2 rounded-md"
//                 onClick={() => setShowModal(false)}
//               >
//                 OK
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import FaceManager from '../pages/FaceManager';
// import Navbar from '../components/Navbar';

// export default function App() {
//   return (
    
//     <div className="min-h-screen bg-gray-50 text-gray-900">
        
//       <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
//         <FaceManager />
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import FaceManager from './FaceManager';
import LibraryPage from './Library'; // Import the new LibraryPage

export default function App() {
    // Initialize isLoggedIn and username from localStorage
    // This ensures that the user stays logged in across page refreshes
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem('jwtToken');
        return !!token; // Returns true if token exists, false otherwise
    });

    const [username, setUsername] = useState(() => {
        return localStorage.getItem('username') || ''; // Get username from localStorage or default to empty string
    });

    // Effect to update localStorage whenever isLoggedIn or username changes
    // This is primarily for consistency, though the initial state handles the refresh part.
    // However, explicit logout (which clears localStorage) will also trigger this.
    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
        }
    }, [isLoggedIn]);

    return (
        <Router>
            <Routes>
                {/* Login Page */}
                <Route
                    path="/login"
                    element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />}
                />
                {/* Signup Page */}
                <Route
                    path="/signup"
                    element={<SignupPage />}
                />
                {/* FaceManager (Initial Access/Upload) Page - Protected Route for login status */}
                <Route
                    path="/vault"
                    element={
                        isLoggedIn ? (
                            <FaceManager username={username} setIsLoggedIn={setIsLoggedIn} />
                        ) : (
                            // Redirect to login if not authenticated
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Library Page - Protected Route */}
                <Route
                    path="/library"
                    element={
                        isLoggedIn ? (
                            <LibraryPage username={username} setIsLoggedIn={setIsLoggedIn} />
                        ) : (
                            // Redirect to login if not authenticated
                            <Navigate to="/login" />
                        )
                    }
                />
                {/* Default route redirects to login or vault based on login status */}
                <Route
                    path="*"
                    element={<Navigate to={isLoggedIn ? "/vault" : "/login"} />}
                />
            </Routes>
        </Router>
    );
}


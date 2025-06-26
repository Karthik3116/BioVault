
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './LoginPage';
// import SignupPage from './SignupPage';
// import FaceManager from './FaceManager';
// import LibraryPage from './Library'; // Import the new LibraryPage

// export default function App() {
//     // Initialize isLoggedIn and username from localStorage
//     // This ensures that the user stays logged in across page refreshes
//     const [isLoggedIn, setIsLoggedIn] = useState(() => {
//         const token = localStorage.getItem('jwtToken');
//         return !!token; // Returns true if token exists, false otherwise
//     });

//     const [username, setUsername] = useState(() => {
//         return localStorage.getItem('username') || ''; // Get username from localStorage or default to empty string
//     });

//     // Effect to update localStorage whenever isLoggedIn or username changes
//     // This is primarily for consistency, though the initial state handles the refresh part.
//     // However, explicit logout (which clears localStorage) will also trigger this.
//     useEffect(() => {
//         if (!isLoggedIn) {
//             localStorage.removeItem('jwtToken');
//             localStorage.removeItem('username');
//         }
//     }, [isLoggedIn]);

//     return (
//         <Router>
//             <Routes>
//                 {/* Login Page */}
//                 <Route
//                     path="/login"
//                     element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />}
//                 />
//                 {/* Signup Page */}
//                 <Route
//                     path="/signup"
//                     element={<SignupPage />}
//                 />
//                 {/* FaceManager (Initial Access/Upload) Page - Protected Route for login status */}
//                 <Route
//                     path="/vault"
//                     element={
//                         isLoggedIn ? (
//                             <FaceManager username={username} setIsLoggedIn={setIsLoggedIn} />
//                         ) : (
//                             // Redirect to login if not authenticated
//                             <Navigate to="/login" />
//                         )
//                     }
//                 />
//                 {/* Library Page - Protected Route */}
//                 <Route
//                     path="/library"
//                     element={
//                         isLoggedIn ? (
//                             <LibraryPage username={username} setIsLoggedIn={setIsLoggedIn} />
//                         ) : (
//                             // Redirect to login if not authenticated
//                             <Navigate to="/login" />
//                         )
//                     }
//                 />
//                 {/* Default route redirects to login or vault based on login status */}
//                 <Route
//                     path="*"
//                     element={<Navigate to={isLoggedIn ? "/vault" : "/login"} />}
//                 />
//             </Routes>
//         </Router>
//     );
// }

// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './LoginPage';
// import SignupPage from './SignupPage';
// import FaceManager from './FaceManager';
// import LibraryPage from './Library';

// export default function App() {
//     const [isLoggedIn, setIsLoggedIn] = useState(() => {
//         const token = localStorage.getItem('jwtToken');
//         return !!token;
//     });

//     const [username, setUsername] = useState(() => {
//         return localStorage.getItem('username') || '';
//     });

//     useEffect(() => {
//         if (!isLoggedIn) {
//             localStorage.removeItem('jwtToken');
//             localStorage.removeItem('username');
//             localStorage.removeItem('lastVerifiedFace');
//             localStorage.removeItem('faceVerified');
//         }
//     }, [isLoggedIn]);

//     return (
//         <Router>
//             <Routes>
//                 <Route
//                     path="/login"
//                     element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />}
//                 />
//                 <Route
//                     path="/signup"
//                     element={<SignupPage />}
//                 />
//                 <Route
//                     path="/vault"
//                     element={
//                         isLoggedIn ? (
//                             <FaceManager username={username} setIsLoggedIn={setIsLoggedIn} />
//                         ) : (
//                             <Navigate to="/login" />
//                         )
//                     }
//                 />
//                 <Route
//                     path="/library"
//                     element={
//                         isLoggedIn ? (
//                             <LibraryPage username={username} setIsLoggedIn={setIsLoggedIn} />
//                         ) : (
//                             <Navigate to="/vault" />
//                         )
//                     }
//                 />
//                 <Route
//                     path="*"
//                     element={<Navigate to={isLoggedIn ? "/vault" : "/login"} />}
//                 />
//             </Routes>
//         </Router>
//     );
// }
// App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import FaceManager from './FaceManager';
import LibraryPage from './Library';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('jwtToken');
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
      localStorage.removeItem('lastVerifiedFace');
      localStorage.removeItem('faceVerified');
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              setIsLoggedIn={setIsLoggedIn}
              setUsername={setUsername}
            />
          }
        />
        <Route path="/signup" element={<SignupPage />} />

        {/* FaceManager stays on /vault */}
        <Route
          path="/vault"
          element={
            isLoggedIn
              ? <FaceManager setIsLoggedIn={setIsLoggedIn} />
              : <Navigate to="/login" />
          }
        />

        {/* Library now takes a dynamic segment */}
        <Route
          path="/library/:sessionId"
          element={
            isLoggedIn
              ? <LibraryPage setIsLoggedIn={setIsLoggedIn} />
              : <Navigate to="/vault" />
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/vault" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

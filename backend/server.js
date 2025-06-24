
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");
// const path = require("path");
// const { MongoClient } = require("mongodb");
// const archiver = require("archiver"); // Import archiver

// const app = express();
// const PORT = process.env.PORT || 8000;
// const PYTHON_API = process.env.PYTHON_API_URL || "http://localhost:5000";
// const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

// // Base upload dirs
// const BASE_DIR = path.resolve(__dirname);
// const UPLOADS_BASE = path.join(BASE_DIR, "uploads");
// const FACES_DIR = path.join(BASE_DIR, "faces");
// fs.mkdirSync(UPLOADS_BASE, { recursive: true });
// fs.mkdirSync(FACES_DIR, { recursive: true });

// // Multer for in-memory uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // MongoDB setup
// const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
// let usersCol;
// client.connect()
//   .then(() => {
//     const db = client.db("faceauth");
//     usersCol = db.collection("users");
//     console.log("Connected to MongoDB");
//   })
//   .catch(err => console.error("MongoDB connection error:", err));

// // CORS & JSON parsing
// app.use(cors({ origin: true, credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // JWT middleware
// function authenticateToken(req, res, next) {
//   const auth = req.headers["authorization"];
//   const token = auth && auth.split(" ")[1];
//   if (!token) return res.status(401).json({ status: "fail", message: "Token missing." });
//   jwt.verify(token, JWT_SECRET, (err, payload) => {
//     if (err) return res.status(403).json({ status: "fail", message: "Invalid token." });
//     req.user = payload; // { username }
//     next();
//   });
// }

// // Helper to call FastAPI face endpoint
// async function verifyFace(username, buffer, originalname) {
//   const form = new FormData();
//   form.append("username", username);
//   form.append("face", buffer, originalname);
//   const resp = await axios.post(
//     `${PYTHON_API}/authenticate_face`,
//     form,
//     { headers: form.getHeaders() }
//   );
//   return resp.status === 200;
// }

// // --- AUTH: Signup & Login ---

// // Signup: username, password, multiple face-images
// app.post("/api/signup", upload.array("faces"), async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const faces = req.files || [];

//     if (!username || !password || faces.length === 0) {
//       return res.status(400).json({ status: "fail", message: "Username, password, and ≥1 face image required." });
//     }

//     // check existing
//     const exists = await usersCol.findOne({ username });
//     if (exists) {
//       return res.status(409).json({ status: "fail", message: "Username taken." });
//     }

//     // hash & save user
//     const hashed = await bcrypt.hash(password, 10);
//     await usersCol.insertOne({ username, password: hashed });

//     // save face files
//     const userFaceDir = path.join(FACES_DIR, username);
//     fs.mkdirSync(userFaceDir, { recursive: true });
//     faces.forEach(f => {
//       fs.writeFileSync(path.join(userFaceDir, f.originalname), f.buffer);
//     });

//     // create empty vault
//     const userVault = path.join(UPLOADS_BASE, username, "vault");
//     fs.mkdirSync(userVault, { recursive: true });

//     return res.json({ status: "success", message: "User registered." });
//   } catch (e) {
//     console.error("Signup error:", e);
//     return res.status(500).json({ status: "fail", message: "Signup failed." });
//   }
// });

// // Login: username, password, single face image
// app.post("/api/login", upload.single("face"), async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const face = req.file;
//     if (!username || !password || !face) {
//       return res.status(400).json({ status: "fail", message: "Username, password & face required." });
//     }

//     const user = await usersCol.findOne({ username });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ status: "fail", message: "Invalid credentials." });
//     }

//     const ok = await verifyFace(username, face.buffer, face.originalname);
//     if (!ok) {
//       return res.status(401).json({ status: "fail", message: "Face not recognized." });
//     }

//     // issue JWT
//     const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
//     return res.json({ status: "success", token, username });
//   } catch (e) {
//     console.error("Login error:", e);
//     return res.status(500).json({ status: "fail", message: "Login failed." });
//   }
// });

// // apply JWT middleware to all /api/vault routes
// app.use("/api/vault", authenticateToken);

// // --- VAULT OPERATIONS ---

// // Create folder
// app.post("/api/vault/create_folder", upload.single("face"), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { folder_name, parent_path = "" } = req.body;
//     const face = req.file;
//     if (!folder_name || !face) {
//       return res.status(400).json({ status: "fail", message: "folder_name & face required." });
//     }

//     if (!await verifyFace(username, face.buffer, face.originalname)) {
//       return res.status(401).json({ status: "fail", message: "Face authentication failed." });
//     }

//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const target = path.join(vaultBase, parent_path, folder_name);
//     if (!target.startsWith(vaultBase)) {
//       return res.status(400).json({ status: "fail", message: "Invalid path." });
//     }
//     if (fs.existsSync(target)) {
//       return res.status(409).json({ status: "fail", message: "Folder exists." });
//     }
//     fs.mkdirSync(target, { recursive: true });
//     return res.json({ status: "success", message: "Folder created." });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ status: "fail", message: "Could not create folder." });
//   }
// });

// // Upload files
// app.post("/api/vault/upload", upload.fields([
//   { name: "face", maxCount: 1 },
//   { name: "user_files" }
// ]), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { current_folder = "" } = req.body;
//     const face = req.files["face"]?.[0];
//     const files = req.files["user_files"] || [];
//     if (!face || files.length === 0) {
//       return res.status(400).json({ status: "fail", message: "face & ≥1 file required." });
//     }

//     if (!await verifyFace(username, face.buffer, face.originalname)) {
//       return res.status(401).json({ status: "fail", message: "Face authentication failed." });
//     }

//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const targetDir = path.join(vaultBase, current_folder);
//     if (!targetDir.startsWith(vaultBase)) {
//       return res.status(400).json({ status: "fail", message: "Invalid path." });
//     }
//     fs.mkdirSync(targetDir, { recursive: true });

//     files.forEach(f => {
//       const safeName = path.basename(f.originalname);
//       fs.writeFileSync(path.join(targetDir, safeName), f.buffer);
//     });

//     return res.json({ status: "success", message: "Files uploaded." });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ status: "fail", message: "Upload failed." });
//   }
// });

// // List folder contents (face optional)
// app.post("/api/vault/access", upload.single("face"), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { path: reqPath = "" } = req.body;
//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const full = path.join(vaultBase, reqPath);
//     if (!full.startsWith(vaultBase)) {
//       return res.status(400).json({ status: "fail", message: "Invalid path." });
//     }
//     if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
//       return res.json({ status: "success", files: [], folders: [], message: "Empty or invalid directory." });
//     }

//     // (Optional) face re-verification could be inserted here

//     const entries = fs.readdirSync(full);
//     const files = [], folders = [];
//     entries.forEach(e => {
//       const stat = fs.statSync(path.join(full, e));
//       if (stat.isFile()) files.push(e);
//       else if (stat.isDirectory()) folders.push(e);
//     });
//     return res.json({ status: "success", files, folders });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ status: "fail", message: "Access failed." });
//   }
// });

// // Download file
// app.post("/api/vault/download", upload.single("face"), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { filename } = req.body;
//     const face = req.file;
//     if (!filename || !face) {
//       return res.status(400).json({ status: "fail", message: "filename & face required." });
//     }

//     if (!await verifyFace(username, face.buffer, face.originalname)) {
//       return res.status(401).json({ status: "fail", message: "Face authentication failed." });
//     }

//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const full = path.join(vaultBase, filename);
//     if (!full.startsWith(vaultBase) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
//       return res.status(404).json({ status: "fail", message: "File not found." });
//     }

//     return res.download(full, path.basename(full));
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ status: "fail", message: "Download failed." });
//   }
// });

// // NEW: Download multiple files as a ZIP
// app.post("/api/vault/download_zip", upload.single("face"), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { filenames, current_path = "" } = req.body;
//     const face = req.file;

//     if (!filenames || !face) {
//       return res.status(400).json({ status: "fail", message: "filenames (JSON string) & face required." });
//     }

//     let fileNamesArray;
//     try {
//       fileNamesArray = JSON.parse(filenames);
//       if (!Array.isArray(fileNamesArray) || fileNamesArray.some(f => typeof f !== 'string')) {
//         throw new Error("Invalid filenames format.");
//       }
//     } catch (parseError) {
//       return res.status(400).json({ status: "fail", message: "Invalid 'filenames' JSON format." });
//     }

//     if (!await verifyFace(username, face.buffer, face.originalname)) {
//       return res.status(401).json({ status: "fail", message: "Face authentication failed." });
//     }

//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const archive = archiver('zip', {
//       zlib: { level: 9 } // Sets the compression level.
//     });

//     res.attachment(`vault_archive_${Date.now()}.zip`);
//     archive.pipe(res);

//     for (const filename of fileNamesArray) {
//       const fullPath = path.join(vaultBase, current_path, filename);

//       // Security check: ensure path is within user's vault and file exists
//       if (!fullPath.startsWith(vaultBase) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
//         console.warn(`Skipping invalid or non-existent file for zipping: ${fullPath}`);
//         // Optionally, you could send a warning or error, but for a zip, skipping might be better.
//         continue;
//       }
//       archive.file(fullPath, { name: filename });
//     }

//     archive.finalize();

//     archive.on('warning', function(err) {
//       if (err.code === 'ENOENT') {
//         console.warn('Archiver warning:', err);
//       } else {
//         throw err;
//       }
//     });

//     archive.on('error', function(err) {
//       console.error('Archiver error:', err);
//       res.status(500).json({ status: "fail", message: `Failed to create zip archive: ${err.message}` });
//     });

//     // Handle client closing connection early
//     res.on('close', function() {
//       console.log('Client closed connection, archive may be incomplete.');
//       archive.abort(); // Abort zipping if client disconnects
//     });

//   } catch (e) {
//     console.error("Multi-download error:", e);
//     // Ensure that if an error occurs before piping, a JSON response is sent
//     if (!res.headersSent) {
//       return res.status(500).json({ status: "fail", message: `Multi-download failed: ${e.message}` });
//     }
//   }
// });


// // Delete file
// app.delete("/api/vault/delete_file", upload.single("face"), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { file_to_delete } = req.body;
//     const face = req.file;
//     if (!file_to_delete || !face) {
//       return res.status(400).json({ status: "fail", message: "file_to_delete & face required." });
//     }

//     if (!await verifyFace(username, face.buffer, face.originalname)) {
//       return res.status(401).json({ status: "fail", message: "Face authentication failed." });
//     }

//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const full = path.join(vaultBase, file_to_delete);
//     if (!full.startsWith(vaultBase) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
//       return res.status(404).json({ status: "fail", message: "File not found." });
//     }
//     fs.unlinkSync(full);
//     return res.json({ status: "success", message: "File deleted." });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ status: "fail", message: "Delete failed." });
//   }
// });

// // Delete folder
// app.delete("/api/vault/delete_folder", upload.single("face"), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { folder_to_delete } = req.body;
//     const face = req.file;
//     if (!folder_to_delete || !face) {
//       return res.status(400).json({ status: "fail", message: "folder_to_delete & face required." });
//     }

//     if (!await verifyFace(username, face.buffer, face.originalname)) {
//       return res.status(401).json({ status: "fail", message: "Face authentication failed." });
//     }

//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const full = path.join(vaultBase, folder_to_delete);
//     if (
//       !full.startsWith(vaultBase) ||
//       !fs.existsSync(full) ||
//       !fs.statSync(full).isDirectory() ||
//       path.resolve(full) === path.resolve(vaultBase)
//     ) {
//       return res.status(400).json({ status: "fail", message: "Invalid folder." });
//     }

//     fs.rmdirSync(full, { recursive: true });
//     return res.json({ status: "success", message: "Folder deleted." });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ status: "fail", message: "Delete folder failed." });
//   }
// });


// // Standalone face verification endpoint (requires JWT)
// app.post('/api/verify_face', authenticateToken, upload.single('face'), async (req, res) => {
//   try {
//     const { username } = req.user; // From JWT
//     const face = req.file;
    
//     if (!face) {
//       return res.status(400).json({ status: 'fail', message: 'Face image required' });
//     }

//     const ok = await verifyFace(username, face.buffer, face.originalname);
//     return ok
//       ? res.json({ status: 'success', message: 'Face verified' })
//       : res.status(401).json({ status: 'fail', message: 'Face not recognized' });
      
//   } catch (e) {
//     console.error('Face verification error:', e);
//     return res.status(500).json({ status: 'fail', message: 'Face verification failed' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Express server running on http://localhost:${PORT}`);
// });



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const archiver = require("archiver"); // Import archiver

const app = express();
const PORT = process.env.PORT || 8000;
const PYTHON_API = "https://biovault-wa9q.onrender.com";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

// Base upload dirs
const BASE_DIR = path.resolve(__dirname);
const UPLOADS_BASE = path.join(BASE_DIR, "uploads");
const FACES_DIR = path.join(BASE_DIR, "faces");
fs.mkdirSync(UPLOADS_BASE, { recursive: true });
fs.mkdirSync(FACES_DIR, { recursive: true });

// Multer for in-memory uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB setup
const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
let usersCol;
client.connect()
  .then(() => {
    const db = client.db("faceauth");
    usersCol = db.collection("users");
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error("MongoDB connection error:", err));

// CORS & JSON parsing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT middleware
function authenticateToken(req, res, next) {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];
  if (!token) return res.status(401).json({ status: "fail", message: "Token missing." });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ status: "fail", message: "Invalid token." });
    req.user = payload; // { username }
    next();
  });
}

// Helper to call FastAPI face endpoint
async function verifyFace(username, buffer, originalname) {
  const form = new FormData();
  form.append("username", username);
  form.append("face", buffer, originalname);
  const resp = await axios.post(
    `${PYTHON_API}/authenticate_face`,
    form,
    { headers: form.getHeaders() }
  );
  return resp.status === 200;
}

// --- AUTH: Signup & Login ---

// Signup: username, password, multiple face-images
app.post("/api/signup", upload.array("faces"), async (req, res) => {
  try {
    const { username, password } = req.body;
    const faces = req.files || [];

    if (!username || !password || faces.length === 0) {
      return res.status(400).json({ status: "fail", message: "Username, password, and ≥1 face image required." });
    }

    // check existing
    const exists = await usersCol.findOne({ username });
    if (exists) {
      return res.status(409).json({ status: "fail", message: "Username taken." });
    }

    // hash & save user
    const hashed = await bcrypt.hash(password, 10);
    await usersCol.insertOne({ username, password: hashed });

    // save face files
    const userFaceDir = path.join(FACES_DIR, username);
    fs.mkdirSync(userFaceDir, { recursive: true });
    faces.forEach(f => {
      fs.writeFileSync(path.join(userFaceDir, f.originalname), f.buffer);
    });

    // create empty vault
    const userVault = path.join(UPLOADS_BASE, username, "vault");
    fs.mkdirSync(userVault, { recursive: true });

    return res.json({ status: "success", message: "User registered." });
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ status: "fail", message: "Signup failed." });
  }
});

// Login: username, password, single face image
app.post("/api/login", upload.single("face"), async (req, res) => {
  try {
    const { username, password } = req.body;
    const face = req.file;
    if (!username || !password || !face) {
      return res.status(400).json({ status: "fail", message: "Username, password & face required." });
    }

    const user = await usersCol.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: "fail", message: "Invalid credentials." });
    }

    const ok = await verifyFace(username, face.buffer, face.originalname);
    if (!ok) {
      return res.status(401).json({ status: "fail", message: "Face not recognized." });
    }

    // issue JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ status: "success", token, username });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ status: "fail", message: "Login failed." });
  }
});

// apply JWT middleware to all /api/vault routes
app.use("/api/vault", authenticateToken);

// --- VAULT OPERATIONS ---

// Create folder
app.post("/api/vault/create_folder", upload.single("face"), async (req, res) => {
  try {
    const { username } = req.user;
    const { folder_name, parent_path = "" } = req.body;
    const face = req.file;
    if (!folder_name || !face) {
      return res.status(400).json({ status: "fail", message: "folder_name & face required." });
    }

    if (!await verifyFace(username, face.buffer, face.originalname)) {
      return res.status(401).json({ status: "fail", message: "Face authentication failed." });
    }

    const vaultBase = path.join(UPLOADS_BASE, username, "vault");
    const target = path.join(vaultBase, parent_path, folder_name);
    if (!target.startsWith(vaultBase)) {
      return res.status(400).json({ status: "fail", message: "Invalid path." });
    }
    if (fs.existsSync(target)) {
      return res.status(409).json({ status: "fail", message: "Folder exists." });
    }
    fs.mkdirSync(target, { recursive: true });
    return res.json({ status: "success", message: "Folder created." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Could not create folder." });
  }
});

// Upload files
app.post("/api/vault/upload", upload.fields([
  { name: "face", maxCount: 1 },
  { name: "user_files" }
]), async (req, res) => {
  try {
    const { username } = req.user;
    const { current_folder = "" } = req.body;
    const face = req.files["face"]?.[0];
    const files = req.files["user_files"] || [];
    if (!face || files.length === 0) {
      return res.status(400).json({ status: "fail", message: "face & ≥1 file required." });
    }

    if (!await verifyFace(username, face.buffer, face.originalname)) {
      return res.status(401).json({ status: "fail", message: "Face authentication failed." });
    }

    const vaultBase = path.join(UPLOADS_BASE, username, "vault");
    const targetDir = path.join(vaultBase, current_folder);
    if (!targetDir.startsWith(vaultBase)) {
      return res.status(400).json({ status: "fail", message: "Invalid path." });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    files.forEach(f => {
      const safeName = path.basename(f.originalname);
      fs.writeFileSync(path.join(targetDir, safeName), f.buffer);
    });

    return res.json({ status: "success", message: "Files uploaded." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Upload failed." });
  }
});

// List folder contents (face is now MANDATORY)
app.post("/api/vault/access", upload.single("face"), async (req, res) => {
  try {
    const { username } = req.user;
    const { path: reqPath = "" } = req.body;
    const face = req.file; // The face file is now required for this endpoint

    // Enforce face image requirement
    if (!face) {
      return res.status(400).json({ status: "fail", message: "Face image required for vault access." });
    }

    // Perform face verification
    if (!await verifyFace(username, face.buffer, face.originalname)) {
      return res.status(401).json({ status: "fail", message: "Face authentication failed for vault access." });
    }

    const vaultBase = path.join(UPLOADS_BASE, username, "vault");
    const full = path.join(vaultBase, reqPath);
    if (!full.startsWith(vaultBase)) {
      return res.status(400).json({ status: "fail", message: "Invalid path." });
    }
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
      return res.json({ status: "success", files: [], folders: [], message: "Empty or invalid directory." });
    }

    const entries = fs.readdirSync(full);
    const files = [], folders = [];
    entries.forEach(e => {
      const stat = fs.statSync(path.join(full, e));
      if (stat.isFile()) files.push(e);
      else if (stat.isDirectory()) folders.push(e);
    });
    return res.json({ status: "success", files, folders });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Access failed." });
  }
});

// Download file
app.post("/api/vault/download", upload.single("face"), async (req, res) => {
  try {
    const { username } = req.user;
    const { filename } = req.body;
    const face = req.file;
    if (!filename || !face) {
      return res.status(400).json({ status: "fail", message: "filename & face required." });
    }

    if (!await verifyFace(username, face.buffer, face.originalname)) {
      return res.status(401).json({ status: "fail", message: "Face authentication failed." });
    }

    const vaultBase = path.join(UPLOADS_BASE, username, "vault");
    const full = path.join(vaultBase, filename);
    if (!full.startsWith(vaultBase) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      return res.status(404).json({ status: "fail", message: "File not found." });
    }

    return res.download(full, path.basename(full));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Download failed." });
  }
});

// NEW: Download multiple files as a ZIP
app.post("/api/vault/download_zip", upload.single("face"), async (req, res) => {
  try {
    const { username } = req.user;
    const { filenames, current_path = "" } = req.body;
    const face = req.file;

    if (!filenames || !face) {
      return res.status(400).json({ status: "fail", message: "filenames (JSON string) & face required." });
    }

    let fileNamesArray;
    try {
      fileNamesArray = JSON.parse(filenames);
      if (!Array.isArray(fileNamesArray) || fileNamesArray.some(f => typeof f !== 'string')) {
        throw new Error("Invalid filenames format.");
      }
    } catch (parseError) {
      return res.status(400).json({ status: "fail", message: "Invalid 'filenames' JSON format." });
    }

    if (!await verifyFace(username, face.buffer, face.originalname)) {
      return res.status(401).json({ status: "fail", message: "Face authentication failed." });
    }

    const vaultBase = path.join(UPLOADS_BASE, username, "vault");
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    res.attachment(`vault_archive_${Date.now()}.zip`);
    archive.pipe(res);

    for (const filename of fileNamesArray) {
      const fullPath = path.join(vaultBase, current_path, filename);

      // Security check: ensure path is within user's vault and file exists
      if (!fullPath.startsWith(vaultBase) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        console.warn(`Skipping invalid or non-existent file for zipping: ${fullPath}`);
        // Optionally, you could send a warning or error, but for a zip, skipping might be better.
        continue;
      }
      archive.file(fullPath, { name: filename });
    }

    archive.finalize();

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn('Archiver warning:', err);
      } else {
        throw err;
      }
    });

    archive.on('error', function(err) {
      console.error('Archiver error:', err);
      res.status(500).json({ status: "fail", message: `Failed to create zip archive: ${err.message}` });
    });

    // Handle client closing connection early
    res.on('close', function() {
      console.log('Client closed connection, archive may be incomplete.');
      archive.abort(); // Abort zipping if client disconnects
    });

  } catch (e) {
    console.error("Multi-download error:", e);
    // Ensure that if an error occurs before piping, a JSON response is sent
    if (!res.headersSent) {
      return res.status(500).json({ status: "fail", message: `Multi-download failed: ${e.message}` });
    }
  }
});


// Delete file
app.delete("/api/vault/delete_file", upload.single("face"), async (req, res) => {
  try {
    const { username } = req.user;
    const { file_to_delete } = req.body;
    const face = req.file;
    if (!file_to_delete || !face) {
      return res.status(400).json({ status: "fail", message: "file_to_delete & face required." });
    }

    if (!await verifyFace(username, face.buffer, face.originalname)) {
      return res.status(401).json({ status: "fail", message: "Face authentication failed." });
    }

    const vaultBase = path.join(UPLOADS_BASE, username, "vault");
    const full = path.join(vaultBase, file_to_delete);
    if (!full.startsWith(vaultBase) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      return res.status(404).json({ status: "fail", message: "File not found." });
    }
    fs.unlinkSync(full);
    return res.json({ status: "success", message: "File deleted." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Delete failed." });
  }
});

// Delete folder
app.delete("/api/vault/delete_folder", upload.single("face"), async (req, res) => {
  try {
    const { username } = req.user;
    const { folder_to_delete } = req.body;
    const face = req.file;
    if (!folder_to_delete || !face) {
      return res.status(400).json({ status: "fail", message: "folder_to_delete & face required." });
    }

    if (!await verifyFace(username, face.buffer, face.originalname)) {
      return res.status(401).json({ status: "fail", message: "Face authentication failed." });
    }

    const vaultBase = path.join(UPLOADS_BASE, username, "vault");
    const full = path.join(vaultBase, folder_to_delete);
    if (
      !full.startsWith(vaultBase) ||
      !fs.existsSync(full) ||
      !fs.statSync(full).isDirectory() ||
      path.resolve(full) === path.resolve(vaultBase)
    ) {
      return res.status(400).json({ status: "fail", message: "Invalid folder." });
    }

    fs.rmdirSync(full, { recursive: true });
    return res.json({ status: "success", message: "Folder deleted." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Delete folder failed." });
  }
});


// Standalone face verification endpoint (requires JWT)
app.post('/api/verify_face', authenticateToken, upload.single('face'), async (req, res) => {
  try {
    const { username } = req.user; // From JWT
    const face = req.file;
    
    if (!face) {
      return res.status(400).json({ status: 'fail', message: 'Face image required' });
    }

    const ok = await verifyFace(username, face.buffer, face.originalname);
    return ok
      ? res.json({ status: 'success', message: 'Face verified' })
      : res.status(401).json({ status: 'fail', message: 'Face not recognized' });
      
  } catch (e) {
    console.error('Face verification error:', e);
    return res.status(500).json({ status: 'fail', message: 'Face verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

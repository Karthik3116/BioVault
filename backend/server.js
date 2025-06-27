

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
// const PYTHON_API = "https://karthik3116-deepface-api.hf.space";
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
// // async function verifyFace(username, buffer, originalname) {
// //   const form = new FormData();
// //   form.append("username", username);
// //   form.append("face", buffer, originalname);
// //   const resp = await axios.post(
// //     `${PYTHON_API}/authenticate_face`,
// //     form,
// //     { headers: form.getHeaders() }
// //   );
// //   return resp.status === 200;
// // }

// async function verifyFace(username, buffer, originalname) {
//   const form = new FormData();

//   // Load reference images from faces/username/
//   const userFaceDir = path.join(FACES_DIR, username);
//   if (!fs.existsSync(userFaceDir)) throw new Error("Reference face folder not found.");

//   const refFiles = fs.readdirSync(userFaceDir).filter(f => fs.statSync(path.join(userFaceDir, f)).isFile());
//   if (refFiles.length === 0) throw new Error("No reference images for user.");

//   // Append reference images
//   refFiles.forEach((fname, i) => {
//     const filePath = path.join(userFaceDir, fname);
//     form.append("reference_faces", fs.createReadStream(filePath), fname);
//   });

//   // Append the input face image
//   form.append("current_face", buffer, originalname);

//   // Call Python server
//   const resp = await axios.post(`${PYTHON_API}/verify_faces`, form, {
//     headers: form.getHeaders(),
//     timeout: 60000,
//   });

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
//     const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "30d" });
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

// // List folder contents (face is now MANDATORY)
// app.post("/api/vault/access", upload.single("face"), async (req, res) => {
//   try {
//     const { username } = req.user;
//     const { path: reqPath = "" } = req.body;
//     const face = req.file; // The face file is now required for this endpoint

//     // Enforce face image requirement
//     if (!face) {
//       return res.status(400).json({ status: "fail", message: "Face image required for vault access." });
//     }

//     // Perform face verification
//     if (!await verifyFace(username, face.buffer, face.originalname)) {
//       return res.status(401).json({ status: "fail", message: "Face authentication failed for vault access." });
//     }

//     const vaultBase = path.join(UPLOADS_BASE, username, "vault");
//     const full = path.join(vaultBase, reqPath);
//     if (!full.startsWith(vaultBase)) {
//       return res.status(400).json({ status: "fail", message: "Invalid path." });
//     }
//     if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
//       return res.json({ status: "success", files: [], folders: [], message: "Empty or invalid directory." });
//     }

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

// app.get("/", (req, res) => {
//   res.send("hello");
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
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 8000;
const PYTHON_API = "https://karthik3116-deepface-api.hf.space";
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
let usersCol, activitiesCol;

client.connect()
  .then(() => {
    const db = client.db("faceauth");
    usersCol = db.collection("users");
    activitiesCol = db.collection("activities");
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
    req.user = payload;
    next();
  });
}

// Activity logging helper
async function recordActivity(username, action, details = {}) {
  try {
    await activitiesCol.insertOne({
      username,
      action,
      timestamp: new Date(),
      details
    });
    console.log(`Activity recorded: ${username} - ${action}`);
  } catch (e) {
    console.error("Failed to record activity:", e);
  }
}

// Verify face against reference images
async function verifyFace(username, buffer, originalname) {
  const form = new FormData();
  
  // Load reference images from faces/username/
  const userFaceDir = path.join(FACES_DIR, username);
  if (!fs.existsSync(userFaceDir)) throw new Error("Reference face folder not found.");
  
  const refFiles = fs.readdirSync(userFaceDir).filter(f => 
    fs.statSync(path.join(userFaceDir, f)).isFile()
  );
  
  if (refFiles.length === 0) throw new Error("No reference images for user.");
  
  // Append reference images
  refFiles.forEach((fname, i) => {
    const filePath = path.join(userFaceDir, fname);
    form.append("reference_faces", fs.createReadStream(filePath), fname);
  });
  
  // Append the input face image
  form.append("current_face", buffer, originalname);
  
  // Call Python server
  const resp = await axios.post(`${PYTHON_API}/verify_faces`, form, {
    headers: form.getHeaders(),
    timeout: 60000,
  });
  
  return resp.status === 200;
}

// --- AUTH: Signup & Login ---
app.post("/api/signup", upload.array("faces"), async (req, res) => {
  try {
    const { username, password } = req.body;
    const faces = req.files || [];
    
    if (!username || !password || faces.length === 0) {
      return res.status(400).json({ status: "fail", message: "Username, password, and ≥1 face image required." });
    }
    
    // Check existing user
    const exists = await usersCol.findOne({ username });
    if (exists) {
      return res.status(409).json({ status: "fail", message: "Username taken." });
    }
    
    // Hash & save user
    const hashed = await bcrypt.hash(password, 10);
    await usersCol.insertOne({ username, password: hashed });
    
    // Save face files
    const userFaceDir = path.join(FACES_DIR, username);
    fs.mkdirSync(userFaceDir, { recursive: true });
    faces.forEach(f => {
      fs.writeFileSync(path.join(userFaceDir, f.originalname), f.buffer);
    });
    
    // Create empty vault
    const userVault = path.join(UPLOADS_BASE, username, "vault");
    fs.mkdirSync(userVault, { recursive: true });
    
    // Record activity
    await recordActivity(username, "account_created");
    
    return res.json({ status: "success", message: "User registered." });
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ status: "fail", message: "Signup failed." });
  }
});

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
    
    // Issue JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "30d" });
    
    // Record activity
    await recordActivity(username, "login");
    
    return res.json({ status: "success", token, username });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ status: "fail", message: "Login failed." });
  }
});

// Apply JWT middleware to all /api/vault routes
app.use("/api/vault", authenticateToken);

// --- VAULT OPERATIONS ---
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
    
    // Record activity
    await recordActivity(username, "folder_created", { folder_name });
    
    return res.json({ status: "success", message: "Folder created." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Could not create folder." });
  }
});

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
    
    // Save files and record file details
    const savedFiles = [];
    files.forEach(f => {
      const safeName = path.basename(f.originalname);
      fs.writeFileSync(path.join(targetDir, safeName), f.buffer);
      savedFiles.push({
        name: safeName,
        size: f.size
      });
    });
    
    // Record activity
    await recordActivity(username, "file_upload", {
      count: files.length,
      files: savedFiles
    });
    
    return res.json({ status: "success", message: "Files uploaded." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Upload failed." });
  }
});

app.post("/api/vault/access", upload.single("face"), async (req, res) => {
  try {
    const { username } = req.user;
    const { path: reqPath = "" } = req.body;
    const face = req.file;
    
    if (!face) {
      return res.status(400).json({ status: "fail", message: "Face image required for vault access." });
    }
    
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
    
    // Record activity
    await recordActivity(username, "vault_access", { path: reqPath });
    
    return res.json({ status: "success", files, folders });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Access failed." });
  }
});

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
    
    // Record activity
    await recordActivity(username, "file_download", { filename });
    
    return res.download(full, path.basename(full));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Download failed." });
  }
});

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
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment(`vault_archive_${Date.now()}.zip`);
    archive.pipe(res);
    
    for (const filename of fileNamesArray) {
      const fullPath = path.join(vaultBase, current_path, filename);
      
      // Security check
      if (!fullPath.startsWith(vaultBase)) continue;
      if (!fs.existsSync(fullPath)) continue;
      if (!fs.statSync(fullPath).isFile()) continue;
      
      archive.file(fullPath, { name: filename });
    }
    
    archive.finalize();
    
    // Record activity
    await recordActivity(username, "multi_download", { 
      count: fileNamesArray.length,
      filenames: fileNamesArray
    });
    
  } catch (e) {
    console.error("Multi-download error:", e);
    if (!res.headersSent) {
      return res.status(500).json({ status: "fail", message: `Multi-download failed: ${e.message}` });
    }
  }
});

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
    
    const fileSize = fs.statSync(full).size;
    fs.unlinkSync(full);
    
    // Record activity
    await recordActivity(username, "file_deleted", { 
      filename: file_to_delete,
      size: fileSize
    });
    
    return res.json({ status: "success", message: "File deleted." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Delete failed." });
  }
});

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
    
    if (!full.startsWith(vaultBase) || 
        !fs.existsSync(full) || 
        !fs.statSync(full).isDirectory() ||
        path.resolve(full) === path.resolve(vaultBase)) {
      return res.status(400).json({ status: "fail", message: "Invalid folder." });
    }
    
    // Calculate folder size before deletion
    const calculateSize = (dir) => {
      const files = fs.readdirSync(dir);
      let size = 0;
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) size += stat.size;
        else if (stat.isDirectory()) size += calculateSize(filePath);
      });
      return size;
    };
    
    const folderSize = calculateSize(full);
    fs.rmdirSync(full, { recursive: true });
    
    // Record activity
    await recordActivity(username, "folder_deleted", { 
      folder_name: folder_to_delete,
      size: folderSize
    });
    
    return res.json({ status: "success", message: "Folder deleted." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: "fail", message: "Delete folder failed." });
  }
});

// --- ACTIVITY & STORAGE ENDPOINTS ---
app.get("/api/activity", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const activities = await activitiesCol.find({ username })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    
    return res.json({ status: "success", activities });
  } catch (e) {
    console.error("Activity log error:", e);
    return res.status(500).json({ status: "fail", message: "Failed to get activity log" });
  }
});

app.get("/api/storage", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const vaultPath = path.join(UPLOADS_BASE, username, "vault");
    
    // Calculate directory size recursively
    const calculateSize = (dir) => {
      if (!fs.existsSync(dir)) return 0;
      
      const files = fs.readdirSync(dir);
      let total = 0;
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
          total += stat.size;
        } else if (stat.isDirectory()) {
          total += calculateSize(filePath);
        }
      });
      
      return total;
    };
    
    const usedBytes = calculateSize(vaultPath);
    const usedMB = usedBytes / (1024 * 1024);
    const totalMB = 1024; // 1GB storage limit
    
    return res.json({ status: "success", used: usedMB, total: totalMB });
  } catch (e) {
    console.error("Storage usage error:", e);
    return res.status(500).json({ status: "fail", message: "Failed to calculate storage" });
  }
});

app.post("/api/storage/clean", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const vaultPath = path.join(UPLOADS_BASE, username, "vault");
    
    // Recursive delete function
    const cleanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        
        if (fs.statSync(filePath).isDirectory()) {
          cleanDirectory(filePath);
          fs.rmdirSync(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
    };
    
    cleanDirectory(vaultPath);
    
    // Record activity
    await recordActivity(username, "storage_cleaned");
    
    return res.json({ 
      status: "success", 
      message: "All files cleaned successfully" 
    });
  } catch (e) {
    console.error("Clean error:", e);
    return res.status(500).json({ status: "fail", message: "Clean failed" });
  }
});

app.post("/api/storage/upgrade", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const newTotal = 2048; // Upgrade to 2GB
    
    // In real app, you'd update user's storage limit in database
    // For now, just return the new limit
    
    // Record activity
    await recordActivity(username, "storage_upgraded", {
      newLimit: newTotal
    });
    
    return res.json({ 
      status: "success", 
      message: "Storage upgraded successfully",
      newTotal
    });
  } catch (e) {
    console.error("Upgrade error:", e);
    return res.status(500).json({ status: "fail", message: "Upgrade failed" });
  }
});

// Standalone face verification endpoint
app.post('/api/verify_face', authenticateToken, upload.single('face'), async (req, res) => {
  try {
    const { username } = req.user;
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

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
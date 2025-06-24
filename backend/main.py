
# # main.py
# from fastapi import FastAPI, Form, UploadFile, File, HTTPException
# from fastapi.responses import JSONResponse, FileResponse
# from deepface import DeepFace
# from pymongo import MongoClient
# from pymongo.errors import PyMongoError
# import os
# import shutil
# import uuid
# import bcrypt # For password hashing
# from typing import Optional, List # For optional parameters and lists of files

# app = FastAPI()

# # MongoDB connection
# MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
# client = None
# db = None
# users_collection = None
# try:
#     client = MongoClient(MONGO_URI)
#     db = client["faceauth"]
#     users_collection = db["users"]
#     print("Successfully connected to MongoDB!")
# except PyMongoError as e:
#     print(f"Error connecting to MongoDB: {e}")
#     # In a production app, you might want to exit or log this more seriously

# # Base directory for storing user face images and uploaded files
# UPLOADS_BASE_DIR = "uploads"

# # Ensure the base uploads directory exists on startup
# if not os.path.exists(UPLOADS_BASE_DIR):
#     try:
#         os.makedirs(UPLOADS_BASE_DIR, exist_ok=True)
#         print(f"Created base uploads directory: {UPLOADS_BASE_DIR}")
#     except OSError as e:
#         print(f"Error creating base uploads directory {UPLOADS_BASE_DIR}: {e}")


# # Helper function to get user's vault path and ensure it exists
# def get_user_vault_base_path(username: str):
#     if client is None or users_collection is None:
#         raise Exception("Database not connected, cannot retrieve vault path.")

#     user = users_collection.find_one({"username": username})
#     if not user:
#         return None

#     expected_vault_path = os.path.join(UPLOADS_BASE_DIR, username, "vault")
#     stored_vault_path = user.get("vault_path")

#     # If stored path is missing or doesn't match convention, update it
#     if not stored_vault_path or os.path.normpath(stored_vault_path) != os.path.normpath(expected_vault_path):
#         users_collection.update_one({"username": username}, {"$set": {"vault_path": expected_vault_path}})
#         stored_vault_path = expected_vault_path

#     try:
#         os.makedirs(stored_vault_path, exist_ok=True)
#     except OSError as e:
#         print(f"Error ensuring user vault directory exists for {username} at {stored_vault_path}: {e}")
#         return None

#     # Security check: Ensure the resolved path is actually under UPLOADS_BASE_DIR
#     if not os.path.normpath(stored_vault_path).startswith(os.path.normpath(UPLOADS_BASE_DIR)):
#         print(f"Security Alert: Vault path {stored_vault_path} for user {username} is outside {UPLOADS_BASE_DIR}")
#         return None

#     return stored_vault_path

# # --- User Management Endpoints (Called by Node.js Proxy) ---

# @app.post("/register_credentials")
# async def register_credentials(username: str = Form(...), password: str = Form(...)):
#     """
#     Registers a new user's username and hashed password in MongoDB.
#     This is the first step of user registration.
#     """
#     if not username.strip() or not password:
#         raise HTTPException(status_code=400, detail={"message": "Username and password are required."})

#     if client is None or users_collection is None:
#         raise HTTPException(status_code=500, detail={"message": "Database not connected."})

#     if users_collection.find_one({"username": username}):
#         raise HTTPException(status_code=409, detail={"message": "User with this username already exists."})

#     # Hash the password before storing
#     hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

#     try:
#         users_collection.insert_one({
#             "username": username,
#             "hashed_password": hashed_password,
#             "face_images": [], # Initialize empty, faces registered separately
#             "vault_path": None # Will be set on first face registration or vault access
#         })
#     except PyMongoError as e:
#         raise HTTPException(status_code=500, detail={"message": f"Database error during user registration: {e}"})

#     return JSONResponse(status_code=200, content={"status": "success", "message": "User credentials registered. Now register face(s)."})

# @app.post("/verify_password")
# async def verify_password(username: str = Form(...), password: str = Form(...)):
#     """
#     Verifies a user's password against the hashed password in MongoDB.
#     """
#     if not username.strip() or not password:
#         raise HTTPException(status_code=400, detail={"message": "Username and password are required."})

#     if client is None or users_collection is None:
#         raise HTTPException(status_code=500, detail={"message": "Database not connected."})

#     user = users_collection.find_one({"username": username})
#     if not user:
#         raise HTTPException(status_code=404, detail={"message": "User not found."})

#     if not bcrypt.checkpw(password.encode('utf-8'), user["hashed_password"].encode('utf-8')):
#         raise HTTPException(status_code=401, detail={"message": "Invalid password."})

#     return JSONResponse(status_code=200, content={"status": "success", "message": "Password verified."})


# # --- Face Management Endpoints ---

# @app.post("/register_faces") # Renamed from /register for clarity
# async def register_faces(
#     username: str = Form(...),
#     faces: List[UploadFile] = File(...)
# ):
#     """
#     Registers multiple face images for an existing user.
#     """
#     if not username.strip():
#         raise HTTPException(status_code=400, detail={"message": "Username is required."})
    
#     if client is None or users_collection is None:
#         raise HTTPException(status_code=500, detail={"message": "Database not connected."})

#     user = users_collection.find_one({"username": username})
#     if not user:
#         raise HTTPException(status_code=404, detail={"message": "User not found. Please register credentials first."})

#     if not faces:
#         raise HTTPException(status_code=400, detail={"message": "At least one face image is required."})

#     user_base_dir = os.path.join(UPLOADS_BASE_DIR, username)
#     user_face_dir = os.path.join(user_base_dir, "faces")

#     try:
#         os.makedirs(user_face_dir, exist_ok=True)
#         # Ensure vault path is also created/set if this is the first face registration
#         if not user.get("vault_path"):
#             user_vault_initial_path = os.path.join(user_base_dir, "vault")
#             os.makedirs(user_vault_initial_path, exist_ok=True)
#             users_collection.update_one({"username": username}, {"$set": {"vault_path": user_vault_initial_path}})
#     except OSError as e:
#         raise HTTPException(status_code=500, detail={"message": f"Failed to create user directories: {e}"})

#     new_face_image_paths = []
#     current_face_images = user.get("face_images", [])

#     for face_file in faces:
#         unique_filename = f"{uuid.uuid4()}{os.path.splitext(face_file.filename)[1]}"
#         file_path = os.path.join(user_face_dir, unique_filename)
#         try:
#             with open(file_path, "wb") as buffer:
#                 shutil.copyfileobj(face_file.file, buffer)
#             new_face_image_paths.append(file_path)
#         except Exception as e:
#             # Clean up partially saved new faces
#             for path in new_face_image_paths:
#                 if os.path.exists(path):
#                     os.remove(path)
#             raise HTTPException(status_code=500, detail={"message": f"Failed to save face image '{face_file.filename}': {e}"})

#     try:
#         # Append new face paths to existing ones
#         users_collection.update_one(
#             {"username": username},
#             {"$set": {"face_images": current_face_images + new_face_image_paths}}
#         )
#     except PyMongoError as e:
#         # Clean up files if MongoDB update fails
#         for path in new_face_image_paths:
#             if os.path.exists(path):
#                 os.remove(path)
#         raise HTTPException(status_code=500, detail={"message": f"Database error during face registration: {e}"})

#     return JSONResponse(status_code=200, content={"status": "success", "message": "Face(s) registered successfully."})


# @app.post("/authenticate_face")
# async def authenticate_face_endpoint( # Renamed to avoid conflict with helper
#     username: str = Form(...),
#     face: UploadFile = File(...)
# ):
#     """
#     Authenticates a user's face against their registered biometric samples.
#     """
#     if client is None or users_collection is None:
#         raise HTTPException(status_code=500, detail={"message": "Database not connected."})

#     user = users_collection.find_one({"username": username})
#     if not user:
#         raise HTTPException(status_code=404, detail={"message": "User not found."})

#     if not user.get("face_images"):
#         raise HTTPException(status_code=400, detail={"message": "No face images registered for this user. Please register your face first."})

#     temp_path = f"temp_verification_{uuid.uuid4()}{os.path.splitext(face.filename)[1]}"
#     try:
#         with open(temp_path, "wb") as buffer:
#             shutil.copyfileobj(face.file, buffer)
#     except Exception:
#         raise HTTPException(status_code=500, detail={"message": "Failed to save uploaded face for verification."})

#     verified = False
    
#     for ref_image_path in user.get("face_images", []):
#         normalized_ref_path = os.path.normpath(ref_image_path)
#         expected_face_dir = os.path.normpath(os.path.join(UPLOADS_BASE_DIR, username, "faces"))
#         if not normalized_ref_path.startswith(expected_face_dir):
#             print(f"Security Warning: Skipping invalid reference image path: {ref_image_path}")
#             continue

#         if not os.path.exists(normalized_ref_path):
#             print(f"Warning: Reference image not found on disk: {normalized_ref_path}")
#             continue

#         try:
#             r = DeepFace.verify(
#                 img1_path=normalized_ref_path,
#                 img2_path=temp_path,
#                 enforce_detection=True,
#                 model_name="Facenet",
#                 distance_metric="euclidean_l2"
#             )
#             if r.get("verified"):
#                 verified = True
#                 break
#         except Exception as e:
#             print(f"DeepFace verification error for {os.path.basename(normalized_ref_path)}: {e}")
#             continue
    
#     if os.path.exists(temp_path):
#         os.remove(temp_path)

#     if not verified:
#         raise HTTPException(status_code=401, detail={"message": "Face verification failed. Please try again."})

#     return JSONResponse(status_code=200, content={"status": "verified"})


# # --- Vault Operations (Called by Node.js Proxy, which already authenticated JWT) ---

# @app.post("/create_folder")
# async def create_folder(
#     username: str = Form(...),
#     folder_name: str = Form(...),
#     parent_path: str = Form(...),
#     face: UploadFile = File(...) # Face for authentication
# ):
#     """
#     Creates a new folder within the user's vault, after face authentication.
#     """
#     try:
#         # Call the helper function for face authentication
#         await authenticate_face_endpoint(username=username, face=face)
#     except HTTPException as e:
#         raise e

#     user_vault_base_path = get_user_vault_base_path(username)
#     if not user_vault_base_path:
#         raise HTTPException(status_code=500, detail={"message": "Could not access user vault path. User or vault might not exist."})

#     normalized_parent_path = os.path.normpath(parent_path).lstrip(os.sep).replace('\\', '/')
#     if normalized_parent_path == '.' or normalized_parent_path == '/':
#         normalized_parent_path = ''

#     target_folder_full_path = os.path.join(user_vault_base_path, normalized_parent_path, folder_name)

#     if not os.path.normpath(target_folder_full_path).startswith(os.path.normpath(user_vault_base_path)):
#         raise HTTPException(status_code=400, detail={"message": "Invalid target folder path. Attempted directory traversal."})

#     if not folder_name.strip() or '..' in folder_name or '/' in folder_name or '\\' in folder_name or not os.path.basename(folder_name) == folder_name:
#         raise HTTPException(status_code=400, detail={"message": "Invalid folder name provided. Names cannot contain slashes or '..'."})

#     if os.path.exists(target_folder_full_path):
#         raise HTTPException(status_code=409, detail={"message": f"Folder '{folder_name}' already exists at this location."})

#     try:
#         os.makedirs(target_folder_full_path, exist_ok=True)
#         return JSONResponse(status_code=200, content={"status": "success", "message": f"Folder '{folder_name}' created successfully."})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail={"message": f"Failed to create folder: {e}"})

# @app.delete("/delete_file")
# async def delete_file(
#     username: str = Form(...),
#     file_to_delete: str = Form(...),
#     face: UploadFile = File(...) # Face for authentication
# ):
#     """
#     Deletes a file from the user's vault, after face authentication.
#     """
#     try:
#         await authenticate_face_endpoint(username=username, face=face)
#     except HTTPException as e:
#         raise e

#     user_vault_base_path = get_user_vault_base_path(username)
#     if not user_vault_base_path:
#         raise HTTPException(status_code=500, detail={"message": "Could not access user vault path. User or vault might not exist."})

#     normalized_file_path = os.path.normpath(file_to_delete).lstrip(os.sep).replace('\\', '/')
#     full_file_path = os.path.join(user_vault_base_path, normalized_file_path)

#     if not os.path.normpath(full_file_path).startswith(os.path.normpath(user_vault_base_path)):
#         raise HTTPException(status_code=400, detail={"message": "Invalid file path. Attempted directory traversal."})

#     if not os.path.exists(full_file_path):
#         raise HTTPException(status_code=404, detail={"message": "File not found."})
    
#     if not os.path.isfile(full_file_path):
#         raise HTTPException(status_code=400, detail={"message": "Path is not a file. Cannot delete a directory using this endpoint."})

#     try:
#         os.remove(full_file_path)
#         return JSONResponse(status_code=200, content={"status": "success", "message": "File deleted successfully."})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail={"message": f"Failed to delete file: {e}"})

# @app.delete("/delete_folder")
# async def delete_folder(
#     username: str = Form(...),
#     folder_to_delete: str = Form(...),
#     face: UploadFile = File(...) # Face for authentication
# ):
#     """
#     Deletes a folder and its contents from the user's vault, after face authentication.
#     """
#     try:
#         await authenticate_face_endpoint(username=username, face=face)
#     except HTTPException as e:
#         raise e

#     user_vault_base_path = get_user_vault_base_path(username)
#     if not user_vault_base_path:
#         raise HTTPException(status_code=500, detail={"message": "Could not access user vault path. User or vault might not exist."})

#     normalized_folder_path = os.path.normpath(folder_to_delete).lstrip(os.sep).replace('\\', '/')
#     full_folder_path = os.path.join(user_vault_base_path, normalized_folder_path)

#     if not os.path.normpath(full_folder_path).startswith(os.path.normpath(user_vault_base_path)):
#         raise HTTPException(status_code=400, detail={"message": "Invalid folder path. Attempted directory traversal."})

#     if os.path.normpath(full_folder_path) == os.path.normpath(user_vault_base_path):
#         raise HTTPException(status_code=400, detail={"message": "Cannot delete the root vault folder."})

#     if not os.path.exists(full_folder_path):
#         raise HTTPException(status_code=404, detail={"message": "Folder not found."})

#     if not os.path.isdir(full_folder_path):
#         raise HTTPException(status_code=400, detail={"message": "Path is not a directory. Cannot delete a file using this endpoint."})

#     try:
#         shutil.rmtree(full_folder_path)
#         return JSONResponse(status_code=200, content={"status": "success", "message": "Folder and its contents deleted successfully."})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail={"message": f"Failed to delete folder: {e}"})


# @app.post("/upload_files")
# async def upload_files(
#     username: str = Form(...),
#     current_folder: str = Form(...),
#     face: UploadFile = File(...), # Face for authentication
#     user_files: List[UploadFile] = File(...)
# ):
#     """
#     Uploads files to the user's vault within a specified folder, after face authentication.
#     """
#     if not user_files:
#         raise HTTPException(status_code=400, detail={"message": "No files selected for upload."})

#     try:
#         await authenticate_face_endpoint(username=username, face=face)
#     except HTTPException as e:
#         raise e

#     user_vault_base_path = get_user_vault_base_path(username)
#     if not user_vault_base_path:
#         raise HTTPException(status_code=500, detail={"message": "Could not access user vault path. User or vault might not exist."})

#     normalized_current_folder = os.path.normpath(current_folder).lstrip(os.sep).replace('\\', '/')
#     if normalized_current_folder == '.' or normalized_current_folder == '/':
#         normalized_current_folder = ''

#     target_directory_full_path = os.path.join(user_vault_base_path, normalized_current_folder)

#     if not os.path.normpath(target_directory_full_path).startswith(os.path.normpath(user_vault_base_path)):
#         raise HTTPException(status_code=400, detail={"message": "Invalid target folder specified. Attempted directory traversal."})

#     try:
#         os.makedirs(target_directory_full_path, exist_ok=True)
#     except OSError as e:
#         raise HTTPException(status_code=500, detail={"message": f"Failed to ensure target directory exists: {e}"})

#     uploaded_file_names = []
#     for file in user_files:
#         safe_filename = os.path.basename(file.filename)
#         file_path = os.path.join(target_directory_full_path, safe_filename)
        
#         try:
#             with open(file_path, "wb") as buffer:
#                 shutil.copyfileobj(file.file, buffer)
#             uploaded_file_names.append(safe_filename)
#         except Exception as e:
#             raise HTTPException(status_code=500, detail={"message": f"Failed to upload file '{safe_filename}': {e}"})

#     return JSONResponse(status_code=200, content={"status": "success", "message": f"Files uploaded: {', '.join(uploaded_file_names)}"})


# @app.post("/access_vault")
# async def access_vault(
#     username: str = Form(...),
#     path: str = Form(...),
#     face: Optional[UploadFile] = File(None) # Face is OPTIONAL for access
# ):
#     """
#     Lists files and folders within a specified path in the user's vault.
#     Requires face authentication only if a face image is provided.
#     """
#     if face: # Only authenticate if a face file is actually sent
#         try:
#             await authenticate_face_endpoint(username=username, face=face)
#         except HTTPException as e:
#             raise e

#     user_vault_base_path = get_user_vault_base_path(username)
#     if not user_vault_base_path:
#         raise HTTPException(status_code=404, detail={"message": "User or vault not found."})

#     normalized_requested_path = os.path.normpath(path).lstrip(os.sep).replace('\\', '/')
#     if normalized_requested_path == '.' or normalized_requested_path == '/':
#         normalized_requested_path = ''

#     full_requested_path = os.path.join(user_vault_base_path, normalized_requested_path)

#     if not os.path.normpath(full_requested_path).startswith(os.path.normpath(user_vault_base_path)):
#         raise HTTPException(status_code=400, detail={"message": "Invalid path specified. Attempted directory traversal."})

#     if not os.path.exists(full_requested_path):
#         return JSONResponse(status_code=200, content={"status": "success", "files": [], "folders": [], "message": "Path does not exist."})
    
#     if not os.path.isdir(full_requested_path):
#         raise HTTPException(status_code=400, detail={"message": "Path is not a directory. Cannot list contents of a file."})

#     try:
#         entries = os.listdir(full_requested_path)
#         files = []
#         folders = []
#         for entry in entries:
#             entry_path = os.path.join(full_requested_path, entry)
#             if os.path.isfile(entry_path):
#                 files.append(entry)
#             elif os.path.isdir(entry_path):
#                 folders.append(entry)
        
#         return JSONResponse(status_code=200, content={"status": "success", "files": files, "folders": folders, "message": "Content loaded."})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail={"message": f"Failed to list directory contents: {e}"})

# @app.post("/download_file")
# async def download_file(
#     username: str = Form(...),
#     filename: str = Form(...),
#     face: UploadFile = File(...) # Face for authentication
# ):
#     """
#     Downloads a specific file from the user's vault, after face authentication.
#     """
#     try:
#         await authenticate_face_endpoint(username=username, face=face)
#     except HTTPException as e:
#         raise e

#     user_vault_base_path = get_user_vault_base_path(username)
#     if not user_vault_base_path:
#         raise HTTPException(status_code=500, detail={"message": "Could not access user vault path. User or vault might not exist."})

#     normalized_file_path = os.path.normpath(filename).lstrip(os.sep).replace('\\', '/')
#     full_file_path = os.path.join(user_vault_base_path, normalized_file_path)

#     if not os.path.normpath(full_file_path).startswith(os.path.normpath(user_vault_base_path)):
#         raise HTTPException(status_code=400, detail={"message": "Invalid file path. Attempted directory traversal."})

#     if not os.path.exists(full_file_path) or not os.path.isfile(full_file_path):
#         raise HTTPException(status_code=404, detail={"message": "File not found."})

#     try:
#         return FileResponse(path=full_file_path, filename=os.path.basename(full_file_path), media_type="application/octet-stream")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail={"message": f"Failed to serve file: {e}"})


# if __name__ == "__main__":
#     import uvicorn
#     os.makedirs(UPLOADS_BASE_DIR, exist_ok=True)
#     uvicorn.run(app, host="0.0.0.0", port=5000)


from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from deepface import DeepFace
import os
import shutil
import uuid

app = FastAPI()

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FACES_DIR = os.path.join(BASE_DIR, "faces")       # where reference faces live
TEMP_DIR = os.path.join(BASE_DIR, "temp")         # where we save uploads briefly
os.makedirs(FACES_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/authenticate_face")
async def authenticate_face(
    username: str = Form(...),
    face: UploadFile = File(...)
):
    """
    Verify an uploaded face image against all registered reference images
    in faces/{username}/.
    """
    # gather reference images
    user_face_dir = os.path.join(FACES_DIR, username)
    if not os.path.isdir(user_face_dir):
        raise HTTPException(status_code=404, detail={"message": "No registered faces for this user."})

    ref_images = [
        os.path.join(user_face_dir, f)
        for f in os.listdir(user_face_dir)
        if os.path.isfile(os.path.join(user_face_dir, f))
    ]
    if not ref_images:
        raise HTTPException(status_code=404, detail={"message": "No reference images available."})

    # save uploaded file temporarily
    ext = os.path.splitext(face.filename)[1]
    tmp_filename = f"{uuid.uuid4()}{ext}"
    tmp_path = os.path.join(TEMP_DIR, tmp_filename)
    try:
        with open(tmp_path, "wb") as buf:
            shutil.copyfileobj(face.file, buf)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": f"Could not save temp file: {e}"})

    # run verification
    verified = False
    for ref in ref_images:
        try:
            result = DeepFace.verify(
                img1_path=ref,
                img2_path=tmp_path,
                model_name="Facenet",
                distance_metric="euclidean_l2",
                enforce_detection=True
            )
            if result.get("verified"):
                verified = True
                break
        except Exception:
            # skip any failures on individual images
            continue

    # clean up temp
    try:
        os.remove(tmp_path)
    except OSError:
        pass

    if not verified:
        raise HTTPException(status_code=401, detail={"message": "Face verification failed."})

    return JSONResponse(status_code=200, content={"status": "verified"})
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

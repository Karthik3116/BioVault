
# from fastapi import FastAPI, UploadFile, File, HTTPException, Form
# from fastapi.responses import JSONResponse
# from deepface import DeepFace
# import os
# import shutil
# import uuid

# app = FastAPI()

# # Base directories
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# FACES_DIR = os.path.join(BASE_DIR, "faces")       # where reference faces live
# TEMP_DIR = os.path.join(BASE_DIR, "temp")         # where we save uploads briefly
# os.makedirs(FACES_DIR, exist_ok=True)
# os.makedirs(TEMP_DIR, exist_ok=True)

# @app.post("/authenticate_face")
# @app.post("/authenticate_face/")
# async def authenticate_face(
#     username: str = Form(...),
#     face: UploadFile = File(...)
# ):
#     """
#     Verify an uploaded face image against all registered reference images
#     in faces/{username}/.
#     """
#     # gather reference images
#     user_face_dir = os.path.join(FACES_DIR, username)
#     if not os.path.isdir(user_face_dir):
#         raise HTTPException(status_code=404, detail={"message": "No registered faces for this user."})

#     ref_images = [
#         os.path.join(user_face_dir, f)
#         for f in os.listdir(user_face_dir)
#         if os.path.isfile(os.path.join(user_face_dir, f))
#     ]
#     if not ref_images:
#         raise HTTPException(status_code=404, detail={"message": "No reference images available."})

#     # save uploaded file temporarily
#     ext = os.path.splitext(face.filename)[1]
#     tmp_filename = f"{uuid.uuid4()}{ext}"
#     tmp_path = os.path.join(TEMP_DIR, tmp_filename)
#     try:
#         with open(tmp_path, "wb") as buf:
#             shutil.copyfileobj(face.file, buf)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail={"message": f"Could not save temp file: {e}"})

#     # run verification
#     verified = False
#     for ref in ref_images:
#         try:
#             result = DeepFace.verify(
#                 img1_path=ref,
#                 img2_path=tmp_path,
#                 model_name="Facenet",
#                 distance_metric="euclidean_l2",
#                 enforce_detection=True
#             )
#             if result.get("verified"):
#                 verified = True
#                 break
#         except Exception:
#             # skip any failures on individual images
#             continue

#     # clean up temp
#     try:
#         os.remove(tmp_path)
#     except OSError:
#         pass

#     if not verified:
#         raise HTTPException(status_code=401, detail={"message": "Face verification failed."})

#     return JSONResponse(status_code=200, content={"status": "verified"})

# @app.get("/")
# def health():
#     return {"message": "FastAPI is running!"}


from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from deepface import DeepFace
import tempfile
import shutil
import os

app = FastAPI()

@app.post("/verify_faces")
async def verify_faces(
    reference_faces: list[UploadFile] = File(...),
    current_face: UploadFile = File(...)
):
    """
    Receives reference images and one face image, verifies if the face matches any reference.
    """
    if not reference_faces:
        raise HTTPException(status_code=400, detail="At least one reference image required.")

    # Save current image temporarily
    try:
        current_fd, current_path = tempfile.mkstemp(suffix=os.path.splitext(current_face.filename)[1])
        with os.fdopen(current_fd, 'wb') as tmp:
            shutil.copyfileobj(current_face.file, tmp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving current face: {str(e)}")

    try:
        verified = False
        for ref in reference_faces:
            try:
                ref_fd, ref_path = tempfile.mkstemp(suffix=os.path.splitext(ref.filename)[1])
                with os.fdopen(ref_fd, 'wb') as ref_tmp:
                    shutil.copyfileobj(ref.file, ref_tmp)

                result = DeepFace.verify(
                    img1_path=ref_path,
                    img2_path=current_path,
                    model_name="Facenet",
                    distance_metric="euclidean_l2",
                    enforce_detection=True
                )
                os.remove(ref_path)

                if result.get("verified"):
                    verified = True
                    break

            except Exception:
                continue  # Skip failed comparisons

        os.remove(current_path)

        if not verified:
            raise HTTPException(status_code=401, detail="Face verification failed.")

        return JSONResponse(status_code=200, content={"status": "verified"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")


@app.get("/")
def health():
    return {"message": "FastAPI face API is alive"}

if __name__ == "__main__":
    
    port = int(os.environ.get("PORT", 10000))  # Render sets the PORT env
    uvicorn.run("main:app", host="0.0.0.0", port=port)



import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from deepface import DeepFace
import shutil
from werkzeug.utils import secure_filename
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Initialize FastAPI app
app = FastAPI()

# CORS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production (e.g., use only your frontend URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define folders for image upload and people images
UPLOAD_FOLDER = 'uploads'
PEOPLE_IMAGES_FOLDER = 'people_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'} 

# Ensure the folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PEOPLE_IMAGES_FOLDER, exist_ok=True)

# Helper function to check file extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# A Pydantic model for the response
class FaceMatchResponse(BaseModel):
    match: bool
    distance: Optional[float] = None
    people_name: Optional[str] = None
    error: Optional[str] = None

# Endpoint to upload a people image and save it in the respective person's folder
@app.post("/upload_people_image/{people_name}")
async def upload_people_image(people_name: str, file: UploadFile = File(...)):
    if file.filename == '':
        raise HTTPException(status_code=400, detail="No file selected")
    
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    filename = secure_filename(file.filename)
    
    # Create a folder for the people if it doesn't already exist
    people_folder_path = os.path.join(PEOPLE_IMAGES_FOLDER, people_name)
    os.makedirs(people_folder_path, exist_ok=True)
    
    # Save images with a unique number (e.g., 1.jpg, 2.jpg, etc.)
    existing_images = os.listdir(people_folder_path)
    image_number = len(existing_images) + 1  # Start from 1
    image_filename = f"{image_number}.jpg"
    
    # Path where the image will be stored
    file_path = os.path.join(people_folder_path, image_filename)
    
    try:
        with open(file_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        
        # Return the name of the folder (people_name) and the image path
        return JSONResponse(
            content={
                "message": f"Criminal image uploaded successfully",
                "folder_name": people_name,
                "image_path": file_path
            },
            status_code=200
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading people image: {e}")

# Endpoint to check the uploaded face against people records
@app.post("/check_face/", response_model=FaceMatchResponse)
async def check_face(file: UploadFile = File(...)):
    if file.filename == '':
        raise HTTPException(status_code=400, detail="No file selected")
    
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        with open(file_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)

        # Use DeepFace.find to compare the uploaded face with people faces
        results = DeepFace.find(
            img_path=file_path,
            db_path=PEOPLE_IMAGES_FOLDER,
            model_name="VGG-Face",
            distance_metric="cosine",                   
            enforce_detection=False
        )

        match_found = False
        min_distance = float('inf') 
        matched_people_name = None

        if results and isinstance(results, list) and len(results) > 0:
            df_results = results[0]

            if not df_results.empty:
                distance_col = None
                for col in df_results.columns:
                    if 'distance' in col.lower() or 'cosine' in col.lower():
                        distance_col = col
                        break
                
                if distance_col:
                    min_distance = df_results[distance_col].min()
                    threshold = 0.40

                    if min_distance < threshold:
                        match_found = True
                        matched_row = df_results.loc[df_results[distance_col].idxmin()]
                        matched_image_path = matched_row['identity']
                        print("Path of image :"+matched_image_path)
                        matched_people_name = os.path.basename(os.path.dirname(matched_image_path))
                        # Replace underscores with spaces and capitalize each word
                        matched_people_name = matched_people_name.replace('_', ' ').title()

        os.remove(file_path)

        if match_found:
            return FaceMatchResponse(match=True, distance=min_distance, people_name=matched_people_name)
        else:
            return FaceMatchResponse(match=False, distance=min_distance if min_distance != float('inf') else None, error="No matching Cricketer found or no face detected in uploaded image.")

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error during face comparison: {e}")

# Run the application with:
# uvicorn main:app --reload


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

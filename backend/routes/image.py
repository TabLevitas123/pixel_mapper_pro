from fastapi import APIRouter, UploadFile, HTTPException
from PIL import Image
import io
import numpy as np
from ..utils.image_processor import ImageProcessor

router = APIRouter()

ALLOWED_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 
    'svg', 'webp', 'heic', 'ico', 'avif'
}

def validate_image(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/upload")
async def upload_image(file: UploadFile):
    if not validate_image(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Get image metadata
        width, height = image.size
        aspect_ratio = f"{width}:{height}"
        
        # Convert image to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array for processing
        image_array = np.array(image)
        
        return {
            "filename": file.filename,
            "resolution": f"{width}x{height}",
            "aspect_ratio": aspect_ratio,
            "size": {
                "width": width,
                "height": height
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export-pixels")
async def export_pixel_data(data: dict):
    """
    Export selected pixel data to JSON format
    """
    try:
        return {
            "image_metadata": {
                "filename": data.get("filename"),
                "resolution": data.get("resolution"),
                "aspect_ratio": data.get("aspect_ratio")
            },
            "selected_pixels": data.get("pixels", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

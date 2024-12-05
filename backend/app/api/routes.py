from fastapi import APIRouter, UploadFile, HTTPException
from ..core.image_processor import ImageProcessor
from PIL import Image
import io
from typing import List, Dict, Any

router = APIRouter()
image_processor = ImageProcessor()

@router.post("/upload")
async def upload_image(file: UploadFile) -> Dict[str, Any]:
    """Handle image upload and return metadata."""
    contents = await file.read()
    is_valid, message = image_processor.validate_image(contents)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    image = Image.open(io.BytesIO(contents))
    return image_processor.get_image_metadata(image)

@router.post("/extract-pixels")
async def extract_pixels(file: UploadFile, coordinates: List[Dict[str, int]]) -> Dict[str, Any]:
    """Extract pixel data for specified coordinates."""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    coord_list = [(coord["x"], coord["y"]) for coord in coordinates]
    pixel_data = image_processor.extract_pixel_data(image, coord_list)
    
    return {
        "metadata": image_processor.get_image_metadata(image),
        "pixels": pixel_data
    }

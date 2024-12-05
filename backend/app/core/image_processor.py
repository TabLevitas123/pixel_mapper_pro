from PIL import Image
import numpy as np
from typing import Dict, List, Tuple, Union
import io

class ImageProcessor:
    def __init__(self):
        self.supported_formats = {
            'PNG', 'JPEG', 'GIF', 'BMP', 'TIFF', 
            'SVG', 'WEBP', 'HEIC', 'ICO', 'AVIF'
        }

    def validate_image(self, image_data: bytes) -> Tuple[bool, str]:
        """Validate image format and data."""
        try:
            img = Image.open(io.BytesIO(image_data))
            if img.format.upper() not in self.supported_formats:
                return False, f"Unsupported image format: {img.format}"
            return True, "Valid image"
        except Exception as e:
            return False, str(e)

    def extract_pixel_data(self, 
                          image: Image.Image, 
                          coordinates: List[Tuple[int, int]]
                          ) -> List[Dict[str, Union[Tuple[int, int], Dict[str, str]]]]:
        """Extract color data for specified pixel coordinates."""
        pixel_data = []
        for x, y in coordinates:
            if 0 <= x < image.width and 0 <= y < image.height:
                rgb = image.getpixel((x, y))
                if isinstance(rgb, int):  # Handle grayscale images
                    rgb = (rgb, rgb, rgb)
                hex_color = '#{:02x}{:02x}{:02x}'.format(*rgb[:3])
                
                pixel_data.append({
                    "coordinates": (x, y),
                    "color": {
                        "hex": hex_color,
                        "rgb": rgb[:3]
                    }
                })
        return pixel_data

    def get_image_metadata(self, image: Image.Image) -> Dict[str, Union[str, int]]:
        """Get image metadata including dimensions and format."""
        return {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "mode": image.mode,
            "aspect_ratio": f"{image.width}:{image.height}"
        }

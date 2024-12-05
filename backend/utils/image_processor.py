import numpy as np
from PIL import Image
import cv2

class ImageProcessor:
    def __init__(self, image_array: np.ndarray):
        self.image = image_array
        self.height, self.width = image_array.shape[:2]
    
    def get_pixel_color(self, x: int, y: int) -> dict:
        """Get color information for a specific pixel"""
        if 0 <= x < self.width and 0 <= y < self.height:
            pixel = self.image[y, x]
            hex_color = '#{:02x}{:02x}{:02x}'.format(*pixel)
            return {
                "hex": hex_color,
                "rgb": pixel.tolist()
            }
        return None
    
    def get_region_data(self, start_x: int, start_y: int, end_x: int, end_y: int) -> list:
        """Get pixel data for a selected region"""
        start_x = max(0, start_x)
        start_y = max(0, start_y)
        end_x = min(self.width, end_x)
        end_y = min(self.height, end_y)
        
        pixels = []
        for y in range(start_y, end_y):
            for x in range(start_x, end_x):
                color = self.get_pixel_color(x, y)
                if color:
                    pixels.append({
                        "x": x,
                        "y": y,
                        "color": color
                    })
        return pixels
    
    def calculate_region_stats(self, pixels: list) -> dict:
        """Calculate statistics for selected pixels"""
        if not pixels:
            return None
            
        rgb_values = np.array([p["color"]["rgb"] for p in pixels])
        return {
            "pixel_count": len(pixels),
            "average_color": {
                "rgb": np.mean(rgb_values, axis=0).tolist(),
                "hex": '#{:02x}{:02x}{:02x}'.format(
                    *np.mean(rgb_values, axis=0).astype(int)
                )
            },
            "color_range": {
                "min": np.min(rgb_values, axis=0).tolist(),
                "max": np.max(rgb_values, axis=0).tolist()
            }
        }

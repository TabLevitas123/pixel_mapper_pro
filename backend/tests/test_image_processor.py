import pytest
from PIL import Image
import io
from app.core.image_processor import ImageProcessor

@pytest.fixture
def image_processor():
    return ImageProcessor()

@pytest.fixture
def sample_image():
    # Create a 2x2 test image
    img = Image.new('RGB', (2, 2), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    return img_byte_arr

def test_validate_image(image_processor, sample_image):
    is_valid, message = image_processor.validate_image(sample_image)
    assert is_valid
    assert message == "Valid image"

def test_extract_pixel_data(image_processor):
    img = Image.new('RGB', (2, 2), color='red')
    coordinates = [(0, 0), (1, 1)]
    pixel_data = image_processor.extract_pixel_data(img, coordinates)
    
    assert len(pixel_data) == 2
    assert pixel_data[0]["coordinates"] == (0, 0)
    assert pixel_data[0]["color"]["hex"] == "#ff0000"
    assert pixel_data[0]["color"]["rgb"] == (255, 0, 0)

def test_get_image_metadata(image_processor):
    img = Image.new('RGB', (100, 50), color='red')
    metadata = image_processor.get_image_metadata(img)
    
    assert metadata["width"] == 100
    assert metadata["height"] == 50
    assert metadata["aspect_ratio"] == "100:50"

# Pixel Mapper Pro

An advanced pixel mapping application that allows users to upload images, map individual pixels, and export pixel data for various use cases.

## Features

- Support for multiple image formats (PNG, JPEG, GIF, BMP, TIFF, SVG, WebP, HEIC, ICO, AVIF)
- Interactive pixel selection tools with box selection and fine-tuning
- Real-time pixel data mapping and visualization
- Export functionality to JSON with detailed pixel information
- Mini-map for navigation and context
- Hyperzoom mode with pixel grid
- Undo/Redo functionality

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn main:app --reload
```

4. Open your browser and navigate to `http://localhost:8000`

## Project Structure

```
pixel-mapper-pro/
├── backend/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── requirements.txt
└── README.md
```

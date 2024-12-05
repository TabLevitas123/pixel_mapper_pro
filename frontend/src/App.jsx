import React, { useState, useRef } from 'react';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import * as PIXI from 'pixi.js';
import ImageCanvas from './components/ImageCanvas';
import MiniMap from './components/MiniMap';
import ToolPanel from './components/ToolPanel';
import PixelInfoPanel from './components/PixelInfoPanel';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPixels, setSelectedPixels] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [gridOpacity, setGridOpacity] = useState(0.5);
  
  const historyRef = useRef({
    past: [],
    future: []
  });

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const imageUrl = URL.createObjectURL(file);
          setSelectedImage({
            url: imageUrl,
            ...await response.json()
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleUndo = () => {
    if (historyRef.current.past.length > 0) {
      const previous = historyRef.current.past[historyRef.current.past.length - 1];
      const newPast = historyRef.current.past.slice(0, -1);
      
      historyRef.current.future = [selectedPixels, ...historyRef.current.future];
      historyRef.current.past = newPast;
      
      setSelectedPixels(previous);
    }
  };

  const handleRedo = () => {
    if (historyRef.current.future.length > 0) {
      const next = historyRef.current.future[0];
      const newFuture = historyRef.current.future.slice(1);
      
      historyRef.current.past = [...historyRef.current.past, selectedPixels];
      historyRef.current.future = newFuture;
      
      setSelectedPixels(next);
    }
  };

  const handleExport = async () => {
    if (selectedPixels.length === 0) return;
    
    const data = {
      filename: selectedImage.filename,
      resolution: selectedImage.resolution,
      aspect_ratio: selectedImage.aspect_ratio,
      pixels: selectedPixels
    };
    
    try {
      const response = await fetch('http://localhost:8000/export-pixels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const blob = new Blob([JSON.stringify(await response.json(), null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pixel-data.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting pixel data:', error);
    }
  };

  return (
    <div className="app">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Pixel Mapper Pro</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="main-content">
        <div className="upload-section">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button variant="contained" color="primary" component="span">
              Upload Image
            </Button>
          </label>
        </div>

        {selectedImage && (
          <div className="workspace">
            <ImageCanvas
              image={selectedImage}
              selectedPixels={selectedPixels}
              setSelectedPixels={setSelectedPixels}
              zoomLevel={zoomLevel}
              showGrid={showGrid}
              gridOpacity={gridOpacity}
            />
            <MiniMap
              image={selectedImage}
              selectedPixels={selectedPixels}
              viewportBounds={null}
            />
            <ToolPanel
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClear={() => setSelectedPixels([])}
              onExport={handleExport}
              showGrid={showGrid}
              setShowGrid={setShowGrid}
              gridOpacity={gridOpacity}
              setGridOpacity={setGridOpacity}
            />
            <PixelInfoPanel
              selectedPixels={selectedPixels}
              imageMetadata={selectedImage}
            />
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;

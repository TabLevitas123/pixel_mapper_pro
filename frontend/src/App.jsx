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
  const [selectionMode, setSelectionMode] = useState('box');
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [viewportBounds, setViewportBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
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
          // Reset state when new image is loaded
          setSelectedPixels([]);
          setZoomLevel(1);
          setViewportBounds({ x: 0, y: 0, width: 0, height: 0 });
          historyRef.current = { past: [], future: [] };
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

  const handleClearSelection = () => {
    historyRef.current.past = [...historyRef.current.past, selectedPixels];
    historyRef.current.future = [];
    setSelectedPixels([]);
  };

  const handleExport = async () => {
    if (selectedPixels.length === 0) return;
    
    const data = {
      image_metadata: {
        filename: selectedImage.filename,
        width: selectedImage.width,
        height: selectedImage.height,
        format: selectedImage.format,
        aspect_ratio: `${selectedImage.width}:${selectedImage.height}`
      },
      selected_pixels: selectedPixels.map(pixel => ({
        x: pixel.x,
        y: pixel.y,
        color: {
          hex: pixel.color.hex,
          rgb: pixel.color.rgb
        }
      }))
    };
    
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting pixel data:', error);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Pixel Mapper Pro
          </Typography>
          <Button
            variant="contained"
            component="label"
            color="secondary"
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>
        </Toolbar>
      </AppBar>

      <Container style={{ flexGrow: 1, position: 'relative', padding: '20px' }}>
        {selectedImage ? (
          <>
            <ImageCanvas
              image={selectedImage}
              selectedPixels={selectedPixels}
              setSelectedPixels={setSelectedPixels}
              zoomLevel={zoomLevel}
              showGrid={showGrid}
              gridOpacity={gridOpacity}
              selectionMode={selectionMode}
              onViewportChange={setViewportBounds}
              historyRef={historyRef}
            />
            
            <ToolPanel
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClear={handleClearSelection}
              onExport={handleExport}
              showGrid={showGrid}
              setShowGrid={setShowGrid}
              gridOpacity={gridOpacity}
              setGridOpacity={setGridOpacity}
              selectionMode={selectionMode}
              setSelectionMode={setSelectionMode}
              showMiniMap={showMiniMap}
              setShowMiniMap={setShowMiniMap}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
            />

            {showMiniMap && (
              <MiniMap
                image={selectedImage}
                selectedPixels={selectedPixels}
                viewportBounds={viewportBounds}
              />
            )}

            <PixelInfoPanel
              selectedPixels={selectedPixels}
              imageMetadata={selectedImage}
            />
          </>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h5" color="textSecondary">
              Upload an image to begin
            </Typography>
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;

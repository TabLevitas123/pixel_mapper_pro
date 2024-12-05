import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { styled, useTheme } from '@mui/material/styles';

const CanvasContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const ImageCanvas = ({
  image,
  selectedPixels,
  setSelectedPixels,
  zoomLevel,
  showGrid,
  gridOpacity,
  selectionMode,
  onViewportChange,
  historyRef,
  setZoomLevel
}) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef(null);
  const spriteRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!canvasRef.current || !image) return;

    // Initialize PIXI Application
    const app = new PIXI.Application({
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
      backgroundColor: theme.palette.background.default,
      resolution: window.devicePixelRatio || 1,
      resizeTo: canvasRef.current,
    });

    canvasRef.current.appendChild(app.view);
    appRef.current = app;

    // Load image
    const texture = PIXI.Texture.from(image.url);
    const sprite = new PIXI.Sprite(texture);
    spriteRef.current = sprite;

    // Center the sprite
    sprite.anchor.set(0.5);
    sprite.position.set(app.screen.width / 2, app.screen.height / 2);
    sprite.scale.set(zoomLevel);

    // Add sprite to stage
    app.stage.addChild(sprite);

    // Add grid container
    const gridContainer = new PIXI.Container();
    app.stage.addChild(gridContainer);

    // Add selection overlay
    const selectionGraphics = new PIXI.Graphics();
    app.stage.addChild(selectionGraphics);

    // Event listeners
    app.view.addEventListener('mousedown', handleMouseDown);
    app.view.addEventListener('mousemove', handleMouseMove);
    app.view.addEventListener('mouseup', handleMouseUp);
    app.view.addEventListener('wheel', handleWheel);

    // Initial viewport update
    updateViewport();

    return () => {
      app.destroy(true);
      app.view.removeEventListener('mousedown', handleMouseDown);
      app.view.removeEventListener('mousemove', handleMouseMove);
      app.view.removeEventListener('mouseup', handleMouseUp);
      app.view.removeEventListener('wheel', handleWheel);
    };
  }, [image]);

  // Update zoom level
  useEffect(() => {
    if (!spriteRef.current) return;
    spriteRef.current.scale.set(zoomLevel);
    updateViewport();
  }, [zoomLevel]);

  const updateViewport = () => {
    if (!spriteRef.current || !appRef.current) return;

    const sprite = spriteRef.current;
    const bounds = sprite.getBounds();
    onViewportChange({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    });
  };

  // Update grid visibility and opacity
  useEffect(() => {
    if (!appRef.current || !showGrid) return;

    const gridContainer = appRef.current.stage.getChildAt(1);
    gridContainer.visible = showGrid;
    gridContainer.alpha = gridOpacity;

    drawGrid();
  }, [showGrid, gridOpacity, zoomLevel]);

  const drawGrid = () => {
    if (!appRef.current || !showGrid) return;

    const gridContainer = appRef.current.stage.getChildAt(1);
    gridContainer.removeChildren();

    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, theme.palette.divider, gridOpacity);

    const sprite = spriteRef.current;
    const bounds = sprite.getBounds();

    // Draw vertical lines
    for (let x = bounds.x; x <= bounds.x + bounds.width; x += zoomLevel) {
      graphics.moveTo(x, bounds.y);
      graphics.lineTo(x, bounds.y + bounds.height);
    }

    // Draw horizontal lines
    for (let y = bounds.y; y <= bounds.y + bounds.height; y += zoomLevel) {
      graphics.moveTo(bounds.x, y);
      graphics.lineTo(bounds.x + bounds.width, y);
    }

    gridContainer.addChild(graphics);

    // Animate grid lines
    gridContainer.children.forEach(line => {
      line.alpha = 0;
      appRef.current.ticker.add(() => {
        if (line.alpha < 1) {
          line.alpha += 0.05;
        }
      });
    });
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * delta));
    setZoomLevel(newZoom);
  };

  const handleMouseDown = (event) => {
    isDraggingRef.current = true;
    selectionStartRef.current = {
      x: event.offsetX,
      y: event.offsetY
    };
  };

  const handleMouseMove = (event) => {
    if (!isDraggingRef.current || !appRef.current) return;

    const selectionGraphics = appRef.current.stage.getChildAt(2);
    selectionGraphics.clear();
    selectionGraphics.lineStyle(2, theme.palette.primary.main);
    selectionGraphics.beginFill(theme.palette.primary.main, 0.25);

    if (selectionMode === 'box') {
      const startX = selectionStartRef.current.x;
      const startY = selectionStartRef.current.y;
      const width = event.offsetX - startX;
      const height = event.offsetY - startY;

      selectionGraphics.drawRect(startX, startY, width, height);

      // Animate selection box
      appRef.current.ticker.add(() => {
        if (selectionGraphics.alpha < 1) {
          selectionGraphics.alpha += 0.05;
        }
      });
    }
  };

  const handleMouseUp = (event) => {
    if (!isDraggingRef.current || !appRef.current) return;

    isDraggingRef.current = false;
    const sprite = spriteRef.current;
    
    // Save current state to history
    historyRef.current.past.push([...selectedPixels]);
    historyRef.current.future = [];

    if (selectionMode === 'box') {
      // Calculate selected pixels for box selection
      const startX = Math.min(selectionStartRef.current.x, event.offsetX);
      const startY = Math.min(selectionStartRef.current.y, event.offsetY);
      const endX = Math.max(selectionStartRef.current.x, event.offsetX);
      const endY = Math.max(selectionStartRef.current.y, event.offsetY);

      // Convert to image coordinates
      const localStart = sprite.toLocal({ x: startX, y: startY });
      const localEnd = sprite.toLocal({ x: endX, y: endY });

      // Add selected pixels to state
      const newPixels = [];
      for (let x = Math.floor(localStart.x); x <= Math.ceil(localEnd.x); x++) {
        for (let y = Math.floor(localStart.y); y <= Math.ceil(localEnd.y); y++) {
          if (x >= 0 && x < image.width && y >= 0 && y < image.height) {
            newPixels.push({ x, y });
          }
        }
      }

      setSelectedPixels([...selectedPixels, ...newPixels]);
    } else {
      // Single pixel selection
      const local = sprite.toLocal({ x: event.offsetX, y: event.offsetY });
      const x = Math.floor(local.x);
      const y = Math.floor(local.y);

      if (x >= 0 && x < image.width && y >= 0 && y < image.height) {
        // Check if pixel is already selected
        const isSelected = selectedPixels.some(p => p.x === x && p.y === y);
        if (isSelected) {
          setSelectedPixels(selectedPixels.filter(p => p.x !== x || p.y !== y));
        } else {
          setSelectedPixels([...selectedPixels, { x, y }]);
        }
      }
    }

    // Clear selection overlay
    const selectionGraphics = appRef.current.stage.getChildAt(2);
    selectionGraphics.clear();
  };

  return <CanvasContainer ref={canvasRef} />;
};

export default ImageCanvas;

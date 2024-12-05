import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const ImageCanvas = ({
  image,
  selectedPixels,
  setSelectedPixels,
  zoomLevel,
  showGrid,
  gridOpacity
}) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !image) return;

    // Initialize PIXI Application
    const app = new PIXI.Application({
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8,
      backgroundColor: 0x282c34,
      resolution: window.devicePixelRatio || 1,
    });

    canvasRef.current.appendChild(app.view);
    appRef.current = app;

    // Load image
    const texture = PIXI.Texture.from(image.url);
    const sprite = new PIXI.Sprite(texture);

    // Center the sprite
    sprite.anchor.set(0.5);
    sprite.position.set(app.screen.width / 2, app.screen.height / 2);

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

    return () => {
      app.destroy(true);
      app.view.removeEventListener('mousedown', handleMouseDown);
      app.view.removeEventListener('mousemove', handleMouseMove);
      app.view.removeEventListener('mouseup', handleMouseUp);
    };
  }, [image]);

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
    graphics.lineStyle(1, 0xFFFFFF, gridOpacity);

    // Draw vertical lines
    for (let x = 0; x < appRef.current.screen.width; x += zoomLevel) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, appRef.current.screen.height);
    }

    // Draw horizontal lines
    for (let y = 0; y < appRef.current.screen.height; y += zoomLevel) {
      graphics.moveTo(0, y);
      graphics.lineTo(appRef.current.screen.width, y);
    }

    gridContainer.addChild(graphics);
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
    selectionGraphics.lineStyle(2, 0x00ff00);
    selectionGraphics.beginFill(0x00ff00, 0.25);

    const startX = selectionStartRef.current.x;
    const startY = selectionStartRef.current.y;
    const width = event.offsetX - startX;
    const height = event.offsetY - startY;

    selectionGraphics.drawRect(startX, startY, width, height);
  };

  const handleMouseUp = (event) => {
    if (!isDraggingRef.current || !appRef.current) return;

    isDraggingRef.current = false;
    
    // Calculate selected pixels
    const startX = Math.min(selectionStartRef.current.x, event.offsetX);
    const startY = Math.min(selectionStartRef.current.y, event.offsetY);
    const endX = Math.max(selectionStartRef.current.x, event.offsetX);
    const endY = Math.max(selectionStartRef.current.y, event.offsetY);

    // Convert to image coordinates
    const sprite = appRef.current.stage.getChildAt(0);
    const localStart = sprite.toLocal({ x: startX, y: startY });
    const localEnd = sprite.toLocal({ x: endX, y: endY });

    // Add selected pixels to state
    const newPixels = [];
    for (let x = Math.floor(localStart.x); x <= Math.ceil(localEnd.x); x++) {
      for (let y = Math.floor(localStart.y); y <= Math.ceil(localEnd.y); y++) {
        newPixels.push({ x, y });
      }
    }

    setSelectedPixels([...selectedPixels, ...newPixels]);
  };

  return <div ref={canvasRef} />;
};

export default ImageCanvas;

import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const MiniMap = ({ image, selectedPixels, viewportBounds }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !image) return;

    // Initialize PIXI Application for minimap
    const app = new PIXI.Application({
      width: 200,
      height: 200,
      backgroundColor: 0x1a1a1a,
      resolution: window.devicePixelRatio || 1,
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    // Load and display the image
    const texture = PIXI.Texture.from(image.url);
    const sprite = new PIXI.Sprite(texture);

    // Scale the sprite to fit the minimap
    const scale = Math.min(
      app.screen.width / sprite.width,
      app.screen.height / sprite.height
    );
    sprite.scale.set(scale);

    // Center the sprite
    sprite.position.set(
      (app.screen.width - sprite.width * scale) / 2,
      (app.screen.height - sprite.height * scale) / 2
    );

    app.stage.addChild(sprite);

    // Add selection overlay
    const selectionGraphics = new PIXI.Graphics();
    app.stage.addChild(selectionGraphics);

    return () => {
      app.destroy(true);
    };
  }, [image]);

  // Update selection overlay when pixels change
  useEffect(() => {
    if (!appRef.current || !selectedPixels.length) return;

    const selectionGraphics = appRef.current.stage.getChildAt(1);
    selectionGraphics.clear();
    selectionGraphics.beginFill(0x00ff00, 0.5);

    // Draw each selected pixel
    selectedPixels.forEach(pixel => {
      const sprite = appRef.current.stage.getChildAt(0);
      const scale = sprite.scale.x;
      const x = sprite.x + pixel.x * scale;
      const y = sprite.y + pixel.y * scale;
      selectionGraphics.drawRect(x, y, scale, scale);
    });

    selectionGraphics.endFill();
  }, [selectedPixels]);

  // Update viewport bounds overlay
  useEffect(() => {
    if (!appRef.current || !viewportBounds) return;

    const sprite = appRef.current.stage.getChildAt(0);
    const scale = sprite.scale.x;

    const viewportGraphics = new PIXI.Graphics();
    viewportGraphics.lineStyle(1, 0xffffff, 0.5);
    viewportGraphics.drawRect(
      sprite.x + viewportBounds.x * scale,
      sprite.y + viewportBounds.y * scale,
      viewportBounds.width * scale,
      viewportBounds.height * scale
    );

    appRef.current.stage.addChild(viewportGraphics);

    return () => {
      appRef.current.stage.removeChild(viewportGraphics);
    };
  }, [viewportBounds]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 20,
        border: '2px solid #666',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    />
  );
};

export default MiniMap;

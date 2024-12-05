import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { styled, useTheme } from '@mui/material/styles';

const MiniMapContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  width: 200,
  height: 200,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  opacity: 0,
  transform: 'scale(0.95)',
  transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
  '&.visible': {
    opacity: 1,
    transform: 'scale(1)',
  },
}));

const MiniMap = ({ image, selectedPixels, viewportBounds }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current || !image) return;

    // Initialize PIXI Application for minimap
    const app = new PIXI.Application({
      width: 200,
      height: 200,
      backgroundColor: theme.palette.background.default,
      resolution: window.devicePixelRatio || 1,
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    // Load image
    const texture = PIXI.Texture.from(image.url);
    const sprite = new PIXI.Sprite(texture);

    // Fit image into minimap
    const scale = Math.min(200 / image.width, 200 / image.height);
    sprite.scale.set(scale);
    sprite.position.set(
      (200 - image.width * scale) / 2,
      (200 - image.height * scale) / 2
    );

    app.stage.addChild(sprite);

    // Add selection overlay
    const selectionGraphics = new PIXI.Graphics();
    app.stage.addChild(selectionGraphics);

    // Draw each selected pixel
    const drawSelection = () => {
      selectionGraphics.clear();
      selectionGraphics.beginFill(0x00ff00, 0.5);
      selectedPixels.forEach(pixel => {
        const x = sprite.x + pixel.x * scale;
        const y = sprite.y + pixel.y * scale;
        selectionGraphics.drawRect(x, y, scale, scale);
      });
      selectionGraphics.endFill();
    };

    drawSelection();

    // Draw viewport rectangle
    const viewportGraphics = new PIXI.Graphics();
    app.stage.addChild(viewportGraphics);

    const drawViewport = () => {
      viewportGraphics.clear();
      viewportGraphics.lineStyle(2, 0xff0000);
      const x = viewportBounds.x * scale;
      const y = viewportBounds.y * scale;
      const width = viewportBounds.width * scale;
      const height = viewportBounds.height * scale;
      viewportGraphics.drawRect(x, y, width, height);
    };

    drawViewport();

    // Add fade-in animation
    containerRef.current.classList.add('visible');

    return () => {
      app.destroy(true);
    };
  }, [image, selectedPixels, viewportBounds, theme]);

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

  useEffect(() => {
    if (!appRef.current || !viewportBounds) return;

    const viewportGraphics = appRef.current.stage.getChildAt(2);
    viewportGraphics.clear();
    viewportGraphics.lineStyle(2, 0xff0000);
    const sprite = appRef.current.stage.getChildAt(0);
    const scale = sprite.scale.x;
    const x = viewportBounds.x * scale;
    const y = viewportBounds.y * scale;
    const width = viewportBounds.width * scale;
    const height = viewportBounds.height * scale;
    viewportGraphics.drawRect(x, y, width, height);
  }, [viewportBounds]);

  return <MiniMapContainer ref={containerRef} />;
};

export default MiniMap;

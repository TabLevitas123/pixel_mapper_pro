export interface PixelData {
  coordinates: [number, number];
  color: {
    hex: string;
    rgb: [number, number, number];
  };
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  mode: string;
  aspect_ratio: string;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export type SelectionMode = 'box' | 'pixel';

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  gridOpacity: number;
}

export interface ExportData {
  image_metadata: ImageMetadata;
  selected_pixels: PixelData[];
}

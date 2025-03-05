"use client";

import { DrawingCanvasContent } from "./components/drawing-canvas-content";
import { DrawingProvider } from "./components/drawing-provider";

/**
 * Main drawing canvas component
 * Combines subcomponents to provide the complete drawing experience
 */
export const DrawingCanvas = () => {
  return (
    <DrawingProvider>
      <DrawingCanvasContent />
    </DrawingProvider>
  );
};

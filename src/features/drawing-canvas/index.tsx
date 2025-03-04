"use client";

import { drawBlobToCanvas } from "@/features/drawing-canvas/drawing-core";
import type { Drawing } from "@/lib/client-db";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { CanvasArea } from "./canvas-area";
import { DrawingDialog } from "./drawing-dialog";
import type { DrawingStyle } from "./drawing-style";
import { ToolBar } from "./tool-bar";
import { useDrawingHistory } from "./use-drawing-history";
import { useDrawingStore } from "./use-drawing-store";

export type OnDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => void;

/**
 * Main drawing canvas component
 * Combines subcomponents to provide the complete drawing experience
 */
export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingListOpen, setIsDrawingListOpen] = useState(false);

  const {
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    drawings,
    createDrawing,
    selectDrawing,
    currentDrawingId,
  } = useDrawingStore();

  const { pushHistory, undo, clearHistory } = useDrawingHistory({
    canvasRef,
    historyId: currentDrawingId,
  });

  // Handler for drawing style updates
  const onDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => {
    updateDrawingStyle(newDrawingStyle);
  };

  // Drawing list dialog handlers
  const openDrawingList = () => {
    setIsDrawingListOpen(true);
  };

  const closeDrawingList = () => {
    setIsDrawingListOpen(false);
  };

  // Handler for switching to a different drawing
  const onChangeDrawing = async (drawing: Drawing) => {
    if (!canvasRef.current) return;
    try {
      await drawBlobToCanvas(canvasRef.current, drawing.image);
      selectDrawing(drawing.id);
      clearHistory(); // Clear history for the new drawing
      pushHistory(); // Add initial state to history
      setIsDrawingListOpen(false);
    } catch (error) {
      console.error("Failed to load drawing:", error);
    }
  };

  // Handler for creating a new drawing
  const createNewDrawing = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsDrawingListOpen(false);
    clearHistory(); // Clear history for the new drawing
    await createDrawing();
  };

  // Save drawing state after each drawing operation
  const onDrawEnd = () => {
    pushHistory();
  };

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled in individual components
    };
  }, []);

  return (
    <div
      className={cn(
        "relative h-full w-full select-none opacity-100 transition-opacity duration-300",
        isLoading && "opacity-10",
      )}
    >
      <CanvasArea
        drawingStyle={drawingStyle}
        onDrawEnd={onDrawEnd}
        canvasRef={canvasRef}
        className="h-full w-full"
      />

      <div className="pointer-events-none absolute inset-x-4 top-4 grid touch-none select-none grid-cols-3 items-start justify-between">
        <ToolBar
          drawingStyle={drawingStyle}
          onDrawingStyleChange={onDrawingStyleChange}
          onUndo={undo}
          onOpenDrawingList={openDrawingList}
          canvasRef={canvasRef}
        />
      </div>

      <DrawingDialog
        isOpen={isDrawingListOpen}
        onClose={closeDrawingList}
        drawings={drawings}
        onDrawingSelect={onChangeDrawing}
        onCreateNewDrawing={createNewDrawing}
        isLoading={isLoading}
      />
    </div>
  );
};

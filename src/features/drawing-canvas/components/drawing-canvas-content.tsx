"use client";
import { cn } from "@/lib/utils";
import { CanvasArea } from "../canvas-area";
import { ToolBar } from "../tool-bar";
import { useDrawing } from "./drawing-provider";

/**
 * DrawingCanvasContent component
 * Renders the canvas area, toolbar, and drawing dialog
 * Must be used within a DrawingProvider
 */
export const DrawingCanvasContent = () => {
  const {
    canvasRef,
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    onDrawingChange,
    onDrawingCreate,
    onDrawEnd,
    undo,
    drawings,
    onDrawingDelete,
  } = useDrawing();

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
          onDrawingStyleChange={updateDrawingStyle}
          onUndo={undo}
          canvasRef={canvasRef}
          drawings={drawings}
          onDrawingSelect={onDrawingChange}
          ononDrawingCreate={onDrawingCreate}
          onDrawingDelete={onDrawingDelete}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

"use client";
import { cn } from "@/lib/utils";
import { CanvasArea } from "../canvas-area";
import { DrawingDialog } from "../drawing-dialog";
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
    isDrawingListOpen,
    openDrawingList,
    closeDrawingList,
    onChangeDrawing,
    createNewDrawing,
    onDrawEnd,
    undo,
    drawings,
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

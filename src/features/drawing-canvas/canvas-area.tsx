"use client";

import { cn } from "@/lib/utils";
import type { RefObject } from "react";
import { useDrawing } from "./components/drawing-provider";
import { TemplateOverlay } from "./components/template-overlay";
import type { DrawingStyle } from "./drawing-style";
import { useCanvas } from "./use-canvas";

interface CanvasAreaProps {
  drawingStyle: DrawingStyle;
  onDrawEnd: () => void;
  className?: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const CanvasArea = ({
  drawingStyle,
  onDrawEnd,
  className = "",
  canvasRef,
}: CanvasAreaProps) => {
  const { onPointerStart, onPointerMove, onPointerEnd } = useCanvas({
    canvasRef,
    drawingStyle,
    onDrawEnd,
  });

  const { templateDirection } = useDrawing();

  return (
    <div className={cn("relative h-full w-full", className)}>
      <TemplateOverlay direction={templateDirection} />
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none select-none"
        onPointerDown={onPointerStart}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerLeave={onPointerEnd}
      />
    </div>
  );
};

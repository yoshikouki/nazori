"use client";

import { cn } from "@/lib/utils";
import { type RefObject } from "react";
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

  return (
    <div className={cn("relative h-full w-full", className)}>
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

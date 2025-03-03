"use client";

import { cn } from "@/lib/utils";
import { type RefObject, useEffect, useRef } from "react";
import { applyDrawingStyle } from "./drawing-core";
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
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const { onPointerStart, onPointerMove, onPointerEnd, resizeCanvas } = useCanvas({
    canvasRef,
    drawingStyle,
    onDrawEnd,
  });

  // resizeCanvasの参照を安定化
  const resizeCanvasRef = useRef(resizeCanvas);
  useEffect(() => {
    resizeCanvasRef.current = resizeCanvas;
  }, [resizeCanvas]);

  // キャンバスのリサイズ
  useEffect(() => {
    resizeCanvasRef.current();

    const handleResize = () => {
      resizeCanvasRef.current();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // 依存配列を空にする

  // 描画スタイルの適用
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    applyDrawingStyle(ctx, drawingStyle);
  }, [drawingStyle, canvasRef]);

  return (
    <div ref={canvasContainerRef} className={cn("relative h-full w-full", className)}>
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

"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, PencilLineIcon, Undo2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [lineStyle, _setLineStyle] = useState({ width: 2, color: "#000" });

  const onPointerDown = (e: PointerEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = { x: e.offsetX, y: e.offsetY };
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !isDrawingRef.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastPosRef.current = { x: e.offsetX, y: e.offsetY };
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;
    canvasRef.current.releasePointerCapture(e.pointerId);
  };

  const onSaveImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "drawing.png";
    link.click();
  };

  // Initialize drawing canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler
  }, [onPointerDown, onPointerMove, onPointerUp]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = lineStyle.width;
    ctx.lineCap = "round";
    ctx.strokeStyle = lineStyle.color;
  }, [lineStyle]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      <Button
        type="button"
        onClick={saveImage}
        className="absolute top-4 right-4"
      >
        Save Image
      </Button>
    </div>
  );
};

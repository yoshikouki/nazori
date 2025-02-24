"use client";

import { useEffect, useRef } from "react";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = { x: e.offsetX, y: e.offsetY };
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      lastPosRef.current = { x: e.offsetX, y: e.offsetY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      isDrawingRef.current = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const saveImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "drawing.png";
    link.click();
  };

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      <button
        type="button"
        onClick={saveImage}
        className="absolute top-4 right-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Save Image
      </button>
    </div>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, PencilLineIcon, Undo2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef<ImageData[]>([]);
  const undoRef = useRef(0);
  const [lineStyle, _setLineStyle] = useState({ width: 2, color: "#000" });
  const [penOnly, setPenOnly] = useState(false);

  const getAllowedPointerTypes = () =>
    penOnly ? ["pen"] : ["pen", "mouse", "touch"];

  const isAllowedPointerType = (type: string) => {
    return getAllowedPointerTypes().includes(type);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!canvasRef.current || !isAllowedPointerType(e.pointerType)) return;
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = { x: e.offsetX, y: e.offsetY };
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !isDrawingRef.current || !isAllowedPointerType(e.pointerType))
      return;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastPosRef.current = { x: e.offsetX, y: e.offsetY };
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!canvasRef.current || !isAllowedPointerType(e.pointerType)) return;
    e.preventDefault();
    isDrawingRef.current = false;
    canvasRef.current.releasePointerCapture(e.pointerId);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    historyRef.current = [
      ...historyRef.current.slice(
        0,
        historyRef.current.length - undoRef.current,
      ),
      imageData,
    ];
    undoRef.current = 0;
  };

  const onSaveImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "drawing.png";
    link.click();
  };

  const onUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    undoRef.current++;
    const historyIndex = historyRef.current.length - 1 - undoRef.current;
    const prevState = historyRef.current[historyIndex];
    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Initialize drawing canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }, []);

  // Register event listeners
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
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
      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            variant={penOnly ? "default" : "outline"}
            onClick={() => setPenOnly(!penOnly)}
          >
            <PencilLineIcon />
            ペン{penOnly ? "のみ" : ""}
          </Button>
        </div>
        <div className="inline-flex items-center gap-2">
          <Button type="button" onClick={onSaveImage}>
            <DownloadIcon />
            ほぞん
          </Button>
          <Button type="button" variant="outline" onClick={onUndo}>
            <Undo2Icon />
            もどる
          </Button>
        </div>
      </div>
    </div>
  );
};

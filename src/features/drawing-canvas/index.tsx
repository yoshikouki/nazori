"use client";

import { Button } from "@/components/ui/button";
import { HandIcon, PencilLineIcon, Undo2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LineColorPicker } from "./line-color-picker";
import { DefaultDrawingStyle, type DrawingStyle } from "./line-style";
import { LineWidthPicker } from "./line-width-picker";
import { SaveImageButton } from "./save-image-button";

export type OnDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => void;

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const midPointRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef<ImageData[]>([]);
  const undoRef = useRef(0);
  const [drawingStyle, setDrawingStyle] = useState<DrawingStyle>(DefaultDrawingStyle);

  const getAllowedPointerTypes = () =>
    drawingStyle.penOnly ? ["pen"] : ["pen", "mouse", "touch"];

  const isAllowedPointerType = (type: string) => {
    return getAllowedPointerTypes().includes(type);
  };

  const onPointerStart = (e: PointerEvent) => {
    if (!canvasRef.current || !isAllowedPointerType(e.pointerType)) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = { x: e.offsetX, y: e.offsetY };
    lastPosRef.current = pos;
    midPointRef.current = pos;
    canvasRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !isDrawingRef.current || !isAllowedPointerType(e.pointerType)) return;
    const currentPos = { x: e.offsetX, y: e.offsetY };
    const newMidPoint = {
      x: (lastPosRef.current.x + currentPos.x) / 2,
      y: (lastPosRef.current.y + currentPos.y) / 2,
    };
    ctx.beginPath();
    ctx.moveTo(midPointRef.current.x, midPointRef.current.y);
    ctx.quadraticCurveTo(
      lastPosRef.current.x,
      lastPosRef.current.y,
      newMidPoint.x,
      newMidPoint.y,
    );
    ctx.stroke();
    lastPosRef.current = currentPos;
    midPointRef.current = newMidPoint;
  };

  const onPointerEnd = (e: PointerEvent) => {
    if (!canvasRef.current || !isAllowedPointerType(e.pointerType)) return;
    e.preventDefault();
    isDrawingRef.current = false;
    canvasRef.current.releasePointerCapture(e.pointerId);
    pushHistory();
  };

  const pushHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [
      ...historyRef.current.slice(0, historyRef.current.length - undoRef.current),
      imageData,
    ];
    undoRef.current = 0;
  };

  const onUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    undoRef.current++;
    const historyIndex = historyRef.current.length - undoRef.current - 1;
    const prevState = historyRef.current[historyIndex];
    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const onResize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    pushHistory();
    // FIXME: Drawings outside the visible area are lost after resize
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.strokeStyle = drawingStyle.color;
    ctx.lineWidth = drawingStyle.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
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
    canvas.addEventListener("pointerdown", onPointerStart);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("resize", onResize);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerStart);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("resize", onResize);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler
  }, [onPointerStart, onPointerMove, onPointerEnd, onResize]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = drawingStyle.color;
    ctx.lineWidth = drawingStyle.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [drawingStyle.color, drawingStyle.width]);

  const onDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => {
    setDrawingStyle((prev) => ({ ...prev, ...newDrawingStyle }));
  };

  const togglePenOnly = () => {
    setDrawingStyle((prev) => ({ ...prev, penOnly: !prev.penOnly }));
  };

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      <div className="absolute inset-x-4 top-4 flex items-start justify-between">
        <div className="flex flex-col items-start justify-start gap-2 sm:flex-row">
          <div className="inline-flex flex-col items-start justify-start gap-2 sm:flex-row">
            <Button type="button" size="lg" variant="outline" onClick={onUndo}>
              <Undo2Icon />
              <span className="hidden sm:inline">もどす</span>
            </Button>
            <LineWidthPicker
              width={drawingStyle.width}
              color={drawingStyle.color}
              onWidthChange={onDrawingStyleChange}
            />
            <LineColorPicker color={drawingStyle.color} onColorChange={onDrawingStyleChange} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row-reverse sm:items-center">
          <SaveImageButton canvasRef={canvasRef} />
          <Button type="button" variant={"outline"} onClick={togglePenOnly}>
            {drawingStyle.penOnly ? <HandIcon /> : <PencilLineIcon />}
            {drawingStyle.penOnly ? "てもつかう" : "ペンでかく"}
          </Button>
        </div>
      </div>
    </div>
  );
};

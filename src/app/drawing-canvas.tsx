"use client";

import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  HandIcon,
  PencilLineIcon,
  Undo2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const midPointRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef<ImageData[]>([]);
  const undoRef = useRef(0);
  // const [lineStyle, _setLineStyle] = useState({ width: 2, color: "#000" });
  const lineStyle = { width: 2, color: "#000" };
  const [penOnly, setPenOnly] = useState(false);

  const getAllowedPointerTypes = () =>
    penOnly ? ["pen"] : ["pen", "mouse", "touch"];

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
    if (!ctx || !isDrawingRef.current || !isAllowedPointerType(e.pointerType))
      return;
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

  const onSaveImage = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();
    const title = `おもいで-${new Date().toLocaleString().replace(/[\s/:]/g, "")}`;
    if (navigator.share) {
      try {
        await navigator.share({
          files: [new File([blob], `${title}.png`, { type: "image/png" })],
          title,
        });
        return;
      } catch (error) {
        console.error("保存に失敗しました:", error);
      }
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${title}.png`;
    link.click();
  };

  const pushHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [
      ...historyRef.current.slice(
        0,
        historyRef.current.length - undoRef.current,
      ),
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
    return () => {
      canvas.removeEventListener("pointerdown", onPointerStart);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerEnd);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler
  }, [onPointerStart, onPointerMove, onPointerEnd]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = lineStyle.color;
    ctx.lineWidth = lineStyle.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [lineStyle]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onUndo}>
            <Undo2Icon />
            もどす
          </Button>
          <Button
            type="button"
            variant={"outline"}
            onClick={() => setPenOnly(!penOnly)}
          >
            {penOnly ? <HandIcon /> : <PencilLineIcon />}
            {penOnly ? "てもつかう" : "ペンでかく"}
          </Button>
        </div>
        <div className="inline-flex items-center gap-2">
          <Button type="button" onClick={onSaveImage}>
            <DownloadIcon />
            ほぞん
          </Button>
        </div>
      </div>
    </div>
  );
};

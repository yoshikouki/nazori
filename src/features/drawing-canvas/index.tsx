"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EraserIcon, HandIcon, PencilLineIcon, PlusIcon, Undo2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { DrawingStyle } from "./drawing-style";
import { LineColorPicker } from "./line-color-picker";
import { LineWidthPicker } from "./line-width-picker";
import { SaveImageButton } from "./save-image-button";
import { useDrawingHistory } from "./use-drawing-history";
import { useDrawingStore } from "./use-drawing-store";
export type OnDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => void;

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const midPointRef = useRef({ x: 0, y: 0 });
  const { pushHistory, onUndo } = useDrawingHistory({
    canvasRef,
  });
  const { drawingStyle, updateDrawingStyle, isLoading } = useDrawingStore();
  const pendingPointsRef = useRef<{ x: number; y: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const allowedPointerTypes = drawingStyle.penOnly ? ["pen"] : ["pen", "mouse", "touch"];

  const isAllowedPointerType = (type: string) => {
    return allowedPointerTypes.includes(type);
  };

  const drawPoints = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || pendingPointsRef.current.length === 0) {
      if (animationFrameRef.current !== null && !isDrawingRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      } else if (isDrawingRef.current) {
        animationFrameRef.current = requestAnimationFrame(drawPoints);
      }
      return;
    }
    const points = [...pendingPointsRef.current];
    pendingPointsRef.current = [];

    for (const currentPos of points) {
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
    }
    if (isDrawingRef.current) {
      animationFrameRef.current = requestAnimationFrame(drawPoints);
    }
  };

  const onDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => {
    updateDrawingStyle(newDrawingStyle);
  };

  const togglePenOnly = () => {
    updateDrawingStyle({ penOnly: !drawingStyle.penOnly });
  };

  const toggleEraser = () => {
    updateDrawingStyle({ isEraser: !drawingStyle.isEraser });
  };

  // Initialize drawing canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    return () => {
      if (animationFrameRef.current === null) return;
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    };
  }, []);

  // Register event listeners
  // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const onPointerStart = (e: PointerEvent) => {
      if (!isAllowedPointerType(e.pointerType)) return;
      e.preventDefault();
      isDrawingRef.current = true;
      const pos = { x: e.offsetX, y: e.offsetY };
      lastPosRef.current = pos;
      midPointRef.current = pos;
      pendingPointsRef.current = [pos];
      canvas.setPointerCapture(e.pointerId);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      animationFrameRef.current = requestAnimationFrame(drawPoints);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrawingRef.current || !isAllowedPointerType(e.pointerType)) return;
      pendingPointsRef.current.push({ x: e.offsetX, y: e.offsetY });
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (!isAllowedPointerType(e.pointerType)) return;
      e.preventDefault();
      isDrawingRef.current = false;
      canvas.releasePointerCapture(e.pointerId);
      if (pendingPointsRef.current.length > 0) {
        drawPoints();
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      pushHistory();
    };

    const onResize = () => {
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
      ctx.strokeStyle = drawingStyle.lineColor;
      ctx.fillStyle = drawingStyle.lineColor; // Also set fillStyle for point drawing
      ctx.lineWidth = drawingStyle.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

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
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (drawingStyle.isEraser) {
      // 消しゴムモードの場合は合成モードを変更
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)"; // 透明度は関係ないが、形式上設定
    } else {
      // 通常の描画モード
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawingStyle.lineColor;
      ctx.fillStyle = drawingStyle.lineColor; // Also set fillStyle for point drawing
    }

    ctx.lineWidth = drawingStyle.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [drawingStyle.lineColor, drawingStyle.lineWidth, drawingStyle.isEraser]);

  return (
    <div
      className={cn(
        "relative h-full w-full select-none opacity-100 transition-opacity duration-300",
        isLoading && "opacity-10",
      )}
    >
      <canvas ref={canvasRef} className="h-full w-full touch-none select-none" />
      <div
        // className="pointer-events-none absolute inset-x-4 top-4 flex touch-none select-none items-start justify-between"
        className="pointer-events-none absolute inset-x-4 top-4 grid touch-none select-none grid-cols-3 items-start justify-between"
      >
        <div className="flex flex-col items-start justify-start gap-2 *:pointer-events-auto">
          <Button
            type="button"
            size="default"
            variant="ghost"
            className="aspect-square select-none p-0"
            asChild
          >
            <Link href="/">
              <Image src="/logo-no-padding.webp" alt="logo" width={20} height={20} />
            </Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={onUndo}
            className="select-none"
          >
            <Undo2Icon />
            <span className="hidden sm:inline">もどす</span>
          </Button>
          <Button
            type="button"
            size="lg"
            variant={drawingStyle.isEraser ? "default" : "outline"}
            onClick={toggleEraser}
            className="select-none"
          >
            <EraserIcon />
            <span className="hidden sm:inline">けしごむ</span>
          </Button>
          <LineWidthPicker
            width={drawingStyle.lineWidth}
            color={drawingStyle.lineColor}
            onWidthChange={onDrawingStyleChange}
          />
          <LineColorPicker
            color={drawingStyle.lineColor}
            onColorChange={onDrawingStyleChange}
          />
        </div>
        <div className="flex items-center justify-center gap-2 *:pointer-events-auto">
          <Button type="button" variant="outline" className="aspect-square select-none p-0">
            <PlusIcon />
          </Button>
        </div>
        <div className="flex flex-col items-end gap-2 *:pointer-events-auto">
          <SaveImageButton canvasRef={canvasRef} />
          <Button
            type="button"
            variant={drawingStyle.penOnly ? "default" : "outline"}
            onClick={togglePenOnly}
            className="pointer-events-auto select-none"
          >
            {drawingStyle.penOnly ? <PencilLineIcon /> : <HandIcon />}
            <span className="hidden sm:inline">{drawingStyle.penOnly ? "ペン" : "て"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

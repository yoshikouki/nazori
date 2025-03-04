import { type MutableRefObject, useRef } from "react";
import {
  type Point,
  applyDrawingStyle,
  isAllowedPointerType as checkPointerType,
  clearCanvas as clearCanvasCore,
  drawSmoothLine,
  resizeCanvasToParent,
} from "./drawing-core";
import type { DrawingStyle } from "./drawing-style";

interface UseCanvasProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  drawingStyle: DrawingStyle;
  onDrawEnd?: () => void;
}

export const useCanvas = ({ canvasRef, drawingStyle, onDrawEnd }: UseCanvasProps) => {
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<Point>({ x: 0, y: 0 });
  const midPointRef = useRef<Point>({ x: 0, y: 0 });
  const pendingPointsRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const isAllowedPointerType = (type: string) => {
    return checkPointerType(type, drawingStyle.penOnly);
  };

  const drawPoints = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || pendingPointsRef.current.length === 0) {
      if (animationFrameRef.current !== null && !isDrawingRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      } else if (isDrawingRef.current) {
        // Using requestAnimationFrame for smooth drawing and better performance
        animationFrameRef.current = requestAnimationFrame(drawPoints);
      }
      return;
    }

    // Apply drawing style settings
    applyDrawingStyle(ctx, drawingStyle);

    const points = [...pendingPointsRef.current];
    pendingPointsRef.current = [];

    // Draw smooth curve through collected points
    const { lastPos, midPoint } = drawSmoothLine(
      ctx,
      points,
      lastPosRef.current,
      midPointRef.current,
    );

    // Update reference points for next drawing segment
    lastPosRef.current = lastPos;
    midPointRef.current = midPoint;

    if (isDrawingRef.current) {
      // Continue animation loop while drawing
      animationFrameRef.current = requestAnimationFrame(drawPoints);
    }
  };

  const onPointerStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isAllowedPointerType(e.pointerType)) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    lastPosRef.current = pos;
    midPointRef.current = pos;
    pendingPointsRef.current = [pos];
    // Capture pointer to receive events outside canvas bounds
    canvas.setPointerCapture(e.pointerId);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    animationFrameRef.current = requestAnimationFrame(drawPoints);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isAllowedPointerType(e.pointerType)) return;
    pendingPointsRef.current.push({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isAllowedPointerType(e.pointerType)) return;
    e.preventDefault();
    isDrawingRef.current = false;
    // Release pointer capture when drawing ends
    canvas.releasePointerCapture(e.pointerId);
    if (pendingPointsRef.current.length > 0) {
      drawPoints();
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    onDrawEnd?.();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    clearCanvasCore(ctx, canvas.width, canvas.height);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvasToParent(canvas, drawingStyle);
  };

  return {
    onPointerStart,
    onPointerMove,
    onPointerEnd,
    clearCanvas,
    resizeCanvas,
    isDrawing: isDrawingRef,
  };
};

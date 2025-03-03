/**
 * Core module for drawing functionality with pure functions
 * Separates state changes as return values to isolate side effects
 */

import type { DrawingStyle } from "./drawing-style";

/**
 * Interface representing a coordinate point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Applies drawing style settings to the canvas context
 * @param ctx Canvas context
 * @param drawingStyle Drawing style configuration
 * @returns Context with applied settings
 */
export const applyDrawingStyle = (
  ctx: CanvasRenderingContext2D,
  drawingStyle: DrawingStyle,
): CanvasRenderingContext2D => {
  ctx.lineWidth = drawingStyle.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (drawingStyle.isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)"; // 透明度は関係ないが、形式上設定
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = drawingStyle.lineColor;
  }

  return ctx;
};

/**
 * Calculates the midpoint between two points
 * @param point1 First point
 * @param point2 Second point
 * @returns Midpoint
 */
export const calculateMidPoint = (point1: Point, point2: Point): Point => {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
};

/**
 * Draws a smooth curve through a series of points
 * Uses quadratic curves between midpoints for better visual quality
 * @param ctx Canvas context
 * @param points Array of points to draw
 * @param lastPos Last drawing position
 * @param midPoint Middle point for curve control
 * @returns Updated last position and midpoint
 */
export const drawSmoothLine = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  lastPos: Point,
  midPoint: Point,
): { lastPos: Point; midPoint: Point } => {
  if (points.length === 0) return { lastPos, midPoint };

  let currentLastPos = { ...lastPos };
  let currentMidPoint = { ...midPoint };

  for (const currentPos of points) {
    const newMidPoint = calculateMidPoint(currentLastPos, currentPos);

    ctx.beginPath();
    ctx.moveTo(currentMidPoint.x, currentMidPoint.y);
    ctx.quadraticCurveTo(currentLastPos.x, currentLastPos.y, newMidPoint.x, newMidPoint.y);
    ctx.stroke();

    currentLastPos = currentPos;
    currentMidPoint = newMidPoint;
  }

  return { lastPos: currentLastPos, midPoint: currentMidPoint };
};

/**
 * Clears the entire canvas
 * @param ctx Canvas context
 * @param width Canvas width
 * @param height Canvas height
 */
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  ctx.clearRect(0, 0, width, height);
};

/**
 * Resizes canvas to match parent element dimensions
 * Preserves drawing content during resize
 * @param canvas Canvas element
 * @param drawingStyle Drawing style to reapply after resize
 * @returns Whether resize was performed
 */
export const resizeCanvasToParent = (
  canvas: HTMLCanvasElement,
  drawingStyle: DrawingStyle,
): boolean => {
  const parent = canvas.parentElement;
  if (!parent) return false;

  const { width, height } = parent.getBoundingClientRect();
  if (canvas.width === width && canvas.height === height) return false;

  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  // 現在の描画内容を保存
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // キャンバスサイズ変更
  canvas.width = width;
  canvas.height = height;

  // 描画内容を復元
  ctx.putImageData(imageData, 0, 0);

  // 描画スタイルを再設定
  applyDrawingStyle(ctx, drawingStyle);

  return true;
};

/**
 * Checks if the pointer type is allowed based on settings
 * @param type Pointer type (pen, mouse, touch)
 * @param penOnly Whether only pen input is allowed
 * @returns Whether the pointer type is allowed
 */
export const isAllowedPointerType = (type: string, penOnly: boolean): boolean => {
  const allowedTypes = penOnly ? ["pen"] : ["pen", "mouse", "touch"];
  return allowedTypes.includes(type);
};

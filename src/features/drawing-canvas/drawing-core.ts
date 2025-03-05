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

type CanvasOrContext = HTMLCanvasElement | CanvasRenderingContext2D | null;

const isCanvasRenderingContext2D = (obj: unknown): obj is CanvasRenderingContext2D => {
  return obj !== null && typeof obj === "object" && "strokeStyle" in obj && "beginPath" in obj;
};

const isHTMLCanvasElement = (obj: unknown): obj is HTMLCanvasElement => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "getContext" in obj &&
    typeof (obj as Record<string, unknown>).getContext === "function"
  );
};

const getCanvasContext = (canvas: CanvasOrContext): CanvasRenderingContext2D | null => {
  if (!canvas) return null;
  if (isCanvasRenderingContext2D(canvas)) return canvas;
  if (isHTMLCanvasElement(canvas)) return canvas.getContext("2d");
  return null;
};

/**
 * Applies drawing style settings to the canvas context
 * @param ctx Canvas context
 * @param drawingStyle Drawing style configuration
 * @returns Context with applied settings
 */
export const applyDrawingStyle = (
  sourceCtx: CanvasOrContext,
  drawingStyle: DrawingStyle,
): CanvasRenderingContext2D | null => {
  const ctx = getCanvasContext(sourceCtx);
  if (!ctx) return null;
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
  sourceCtx: CanvasOrContext,
  points: Point[],
  lastPos: Point,
  midPoint: Point,
): { lastPos: Point; midPoint: Point } => {
  const ctx = getCanvasContext(sourceCtx);
  if (!ctx || points.length === 0) return { lastPos, midPoint };

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
 * @param canvas Canvas element or context
 */
export const clearCanvas = (sourceCanvas: CanvasOrContext): void => {
  const ctx = getCanvasContext(sourceCanvas);
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

/**
 * Resizes canvas to match parent element dimensions
 * Preserves drawing content during resize
 * @param canvas Canvas element or context
 * @param drawingStyle Drawing style to reapply after resize
 * @returns Whether resize was performed
 */
export const resizeCanvasToParent = (
  sourceCanvas: CanvasOrContext,
  drawingStyle: DrawingStyle,
): boolean => {
  const ctx = getCanvasContext(sourceCanvas);
  if (!ctx) return false;

  const canvas = ctx.canvas;
  const parent = canvas.parentElement;
  if (!parent) return false;

  const { width, height } = parent.getBoundingClientRect();
  if (canvas.width === width && canvas.height === height) return false;

  // 現在の描画内容を保存
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // キャンバスサイズ変更
  canvas.width = width;
  canvas.height = height;

  // 描画内容を復元
  ctx.putImageData(imageData, 0, 0);

  // 描画スタイルを再設定
  const updatedCtx = applyDrawingStyle(ctx, drawingStyle);
  if (!updatedCtx) return false;

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

/**
 * Converts canvas to a Blob
 * @param canvas Canvas element
 * @returns Promise resolving to Blob or null
 */
export const canvasToBlob = (sourceCanvas: CanvasOrContext): Promise<Blob | null> => {
  const canvas = getCanvasContext(sourceCanvas)?.canvas;
  if (!canvas) return Promise.resolve(null);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });
};

/**
 * Converts Blob to an Image element
 * @param blob Image blob
 * @returns Promise resolving to HTMLImageElement
 */
const blobToImage = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(blob);
  });
};

/**
 * Draws a blob image to canvas
 * @param canvas Canvas element or context
 * @param blob Image blob
 */
export const drawBlobToCanvas = async (
  sourceCanvas: CanvasOrContext,
  blob: Blob | null,
): Promise<void> => {
  const ctx = getCanvasContext(sourceCanvas);
  if (!ctx || !blob) return;
  const img = await blobToImage(blob);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src); // Prevent memory leaks
};

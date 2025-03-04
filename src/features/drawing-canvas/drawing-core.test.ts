import { describe, expect, it, vi } from "vitest";
import {
  applyDrawingStyle,
  calculateMidPoint,
  clearCanvas,
  drawSmoothLine,
  isAllowedPointerType,
  resizeCanvasToParent,
} from "./drawing-core";
import { DefaultDrawingStyle } from "./drawing-style";

describe("drawing-core", () => {
  describe("calculateMidPoint", () => {
    it("calculates the midpoint between two points", () => {
      const point1 = { x: 10, y: 20 };
      const point2 = { x: 30, y: 40 };
      const result = calculateMidPoint(point1, point2);

      expect(result.x).toBe(20);
      expect(result.y).toBe(30);
    });

    it("handles negative coordinates", () => {
      const point1 = { x: -10, y: -20 };
      const point2 = { x: 10, y: 20 };
      const result = calculateMidPoint(point1, point2);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("handles zero coordinates", () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 0, y: 0 };
      const result = calculateMidPoint(point1, point2);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("handles decimal coordinates", () => {
      const point1 = { x: 10.5, y: 20.5 };
      const point2 = { x: 30.5, y: 40.5 };
      const result = calculateMidPoint(point1, point2);

      expect(result.x).toBe(20.5);
      expect(result.y).toBe(30.5);
    });
  });

  describe("isAllowedPointerType", () => {
    it("allows pen input when penOnly is true", () => {
      expect(isAllowedPointerType("pen", true)).toBe(true);
      expect(isAllowedPointerType("mouse", true)).toBe(false);
      expect(isAllowedPointerType("touch", true)).toBe(false);
    });

    it("allows all input types when penOnly is false", () => {
      expect(isAllowedPointerType("pen", false)).toBe(true);
      expect(isAllowedPointerType("mouse", false)).toBe(true);
      expect(isAllowedPointerType("touch", false)).toBe(true);
    });

    it("handles unknown pointer types", () => {
      expect(isAllowedPointerType("unknown", true)).toBe(false);
      expect(isAllowedPointerType("unknown", false)).toBe(false);
    });

    it("handles empty string pointer type", () => {
      expect(isAllowedPointerType("", true)).toBe(false);
      expect(isAllowedPointerType("", false)).toBe(false);
    });
  });

  describe("applyDrawingStyle", () => {
    it("applies normal drawing style", () => {
      const ctx = {
        lineWidth: 0,
        lineCap: "",
        lineJoin: "",
        strokeStyle: "",
        globalCompositeOperation: "",
      } as unknown as CanvasRenderingContext2D;

      const style = {
        ...DefaultDrawingStyle,
        isEraser: false,
      };

      applyDrawingStyle(ctx, style);

      expect(ctx.lineWidth).toBe(style.lineWidth);
      expect(ctx.lineCap).toBe("round");
      expect(ctx.lineJoin).toBe("round");
      expect(ctx.strokeStyle).toBe(style.lineColor);
      expect(ctx.globalCompositeOperation).toBe("source-over");
    });

    it("applies eraser drawing style", () => {
      const ctx = {
        lineWidth: 0,
        lineCap: "",
        lineJoin: "",
        strokeStyle: "",
        globalCompositeOperation: "",
      } as unknown as CanvasRenderingContext2D;

      const style = {
        ...DefaultDrawingStyle,
        isEraser: true,
      };

      applyDrawingStyle(ctx, style);

      expect(ctx.globalCompositeOperation).toBe("destination-out");
    });

    it("applies custom line width", () => {
      const ctx = {
        lineWidth: 0,
        lineCap: "",
        lineJoin: "",
        strokeStyle: "",
        globalCompositeOperation: "",
      } as unknown as CanvasRenderingContext2D;

      const style = {
        ...DefaultDrawingStyle,
        lineWidth: 20,
      };

      applyDrawingStyle(ctx, style);

      expect(ctx.lineWidth).toBe(20);
    });

    it("applies custom line color", () => {
      const ctx = {
        lineWidth: 0,
        lineCap: "",
        lineJoin: "",
        strokeStyle: "",
        globalCompositeOperation: "",
      } as unknown as CanvasRenderingContext2D;

      const style = {
        ...DefaultDrawingStyle,
        lineColor: "#FF0000",
      };

      applyDrawingStyle(ctx, style);

      expect(ctx.strokeStyle).toBe("#FF0000");
    });
  });

  describe("clearCanvas", () => {
    it("clears the canvas", () => {
      const ctx = {
        clearRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      clearCanvas(ctx, 100, 200);

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 200);
    });

    it("handles zero dimensions", () => {
      const ctx = {
        clearRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      clearCanvas(ctx, 0, 0);

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 0, 0);
    });

    it("handles negative dimensions", () => {
      const ctx = {
        clearRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      clearCanvas(ctx, -10, -20);

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, -10, -20);
    });
  });

  describe("drawSmoothLine", () => {
    it("draws a smooth line through points", () => {
      const ctx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        stroke: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const points = [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ];
      const lastPos = { x: 5, y: 5 };
      const midPoint = { x: 7.5, y: 7.5 };

      const result = drawSmoothLine(ctx, points, lastPos, midPoint);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.quadraticCurveTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(result.lastPos).toEqual(points[points.length - 1]);
    });

    it("returns original points when no points are provided", () => {
      const ctx = {} as CanvasRenderingContext2D;
      const points: Array<{ x: number; y: number }> = [];
      const lastPos = { x: 5, y: 5 };
      const midPoint = { x: 7.5, y: 7.5 };

      const result = drawSmoothLine(ctx, points, lastPos, midPoint);

      expect(result.lastPos).toEqual(lastPos);
      expect(result.midPoint).toEqual(midPoint);
    });

    it("handles a single point", () => {
      const ctx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        stroke: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const points = [{ x: 10, y: 10 }];
      const lastPos = { x: 5, y: 5 };
      const midPoint = { x: 7.5, y: 7.5 };

      const result = drawSmoothLine(ctx, points, lastPos, midPoint);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.quadraticCurveTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(result.lastPos).toEqual(points[0]);
    });
  });

  describe("resizeCanvasToParent", () => {
    it("resizes canvas to match parent dimensions", () => {
      const imageData = { width: 50, height: 50 };
      const ctx = {
        getImageData: vi.fn(() => imageData),
        putImageData: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const canvas = {
        width: 50,
        height: 50,
        parentElement: {
          getBoundingClientRect: () => ({ width: 100, height: 200 }),
        },
        getContext: vi.fn(() => ctx),
      } as unknown as HTMLCanvasElement;

      const result = resizeCanvasToParent(canvas, DefaultDrawingStyle);

      expect(result).toBe(true);
      expect(canvas.width).toBe(100);
      expect(canvas.height).toBe(200);
      expect(ctx.putImageData).toHaveBeenCalled();
    });

    it("returns false when no parent element exists", () => {
      const canvas = {
        parentElement: null,
      } as unknown as HTMLCanvasElement;

      const result = resizeCanvasToParent(canvas, DefaultDrawingStyle);

      expect(result).toBe(false);
    });

    it("returns false when canvas dimensions already match parent", () => {
      const canvas = {
        width: 100,
        height: 200,
        parentElement: {
          getBoundingClientRect: () => ({ width: 100, height: 200 }),
        },
      } as unknown as HTMLCanvasElement;

      const result = resizeCanvasToParent(canvas, DefaultDrawingStyle);

      expect(result).toBe(false);
    });

    it("returns false when getContext returns null", () => {
      const canvas = {
        width: 50,
        height: 50,
        parentElement: {
          getBoundingClientRect: () => ({ width: 100, height: 200 }),
        },
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement;

      const result = resizeCanvasToParent(canvas, DefaultDrawingStyle);

      expect(result).toBe(false);
    });

    it("handles zero parent dimensions", () => {
      const imageData = { width: 50, height: 50 };
      const ctx = {
        getImageData: vi.fn(() => imageData),
        putImageData: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const canvas = {
        width: 50,
        height: 50,
        parentElement: {
          getBoundingClientRect: () => ({ width: 0, height: 0 }),
        },
        getContext: vi.fn(() => ctx),
      } as unknown as HTMLCanvasElement;

      const result = resizeCanvasToParent(canvas, DefaultDrawingStyle);

      expect(result).toBe(true);
      expect(canvas.width).toBe(0);
      expect(canvas.height).toBe(0);
    });
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DefaultDrawingStyle } from "./drawing-style";
import { useCanvas } from "./use-canvas";

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return 1; // 無限ループを防ぐためにcallbackを直接呼び出さない
});
global.cancelAnimationFrame = vi.fn();

describe("useCanvas", () => {
  it("initializes with correct state", () => {
    const canvasRef = { current: document.createElement("canvas") };
    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
      }),
    );

    expect(result.current.isDrawing.current).toBe(false);
    expect(result.current.onPointerStart).toBeInstanceOf(Function);
    expect(result.current.onPointerMove).toBeInstanceOf(Function);
    expect(result.current.onPointerEnd).toBeInstanceOf(Function);
    expect(result.current.clearCanvas).toBeInstanceOf(Function);
    expect(result.current.resizeCanvas).toBeInstanceOf(Function);
  });

  it("handles pointer start event", () => {
    const canvasRef = { current: document.createElement("canvas") };
    const setPointerCapture = vi.fn();
    canvasRef.current.setPointerCapture = setPointerCapture;

    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
      }),
    );

    const mockEvent = {
      preventDefault: vi.fn(),
      pointerId: 123,
      pointerType: "mouse",
      nativeEvent: {
        offsetX: 10,
        offsetY: 20,
      },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    // requestAnimationFrameをモックして無限ループを防ぐ
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = vi.fn(() => 1);

    act(() => {
      result.current.onPointerStart(mockEvent);
    });

    // 元に戻す
    global.requestAnimationFrame = originalRAF;

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(setPointerCapture).toHaveBeenCalledWith(123);
    expect(result.current.isDrawing.current).toBe(true);
  });

  it("handles pointer move event when drawing", () => {
    const canvasRef = { current: document.createElement("canvas") };
    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
      }),
    );

    // Start drawing
    act(() => {
      result.current.isDrawing.current = true;
    });

    const mockEvent = {
      pointerType: "mouse",
      nativeEvent: {
        offsetX: 10,
        offsetY: 20,
      },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    act(() => {
      result.current.onPointerMove(mockEvent);
    });

    // We can't directly test the internal state, but we can verify it doesn't throw
    expect(() => result.current.onPointerMove(mockEvent)).not.toThrow();
  });

  it("handles pointer end event", () => {
    const canvasRef = { current: document.createElement("canvas") };
    const releasePointerCapture = vi.fn();
    canvasRef.current.releasePointerCapture = releasePointerCapture;

    const onDrawEnd = vi.fn();

    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
        onDrawEnd,
      }),
    );

    // Start drawing
    act(() => {
      result.current.isDrawing.current = true;
    });

    const mockEvent = {
      preventDefault: vi.fn(),
      pointerId: 123,
      pointerType: "mouse",
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    // requestAnimationFrameをモックして無限ループを防ぐ
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = vi.fn(() => 1);

    act(() => {
      result.current.onPointerEnd(mockEvent);
    });

    // 元に戻す
    global.requestAnimationFrame = originalRAF;

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(releasePointerCapture).toHaveBeenCalledWith(123);
    expect(result.current.isDrawing.current).toBe(false);
    expect(onDrawEnd).toHaveBeenCalled();
  });

  it("clears canvas", () => {
    const canvasRef = {
      current: document.createElement("canvas"),
    };

    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
      }),
    );

    // This is more of an integration test to ensure it doesn't throw
    expect(() => {
      act(() => {
        result.current.clearCanvas();
      });
    }).not.toThrow();
  });

  it("resizes canvas", () => {
    const canvasRef = {
      current: document.createElement("canvas"),
    };

    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
      }),
    );

    // This is more of an integration test to ensure it doesn't throw
    expect(() => {
      act(() => {
        result.current.resizeCanvas();
      });
    }).not.toThrow();
  });

  it("handles drawPoints function with empty points", () => {
    const canvasRef = { current: document.createElement("canvas") };
    const mockCtx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      stroke: vi.fn(),
      lineWidth: 0,
      lineCap: "",
      lineJoin: "",
      strokeStyle: "",
    };

    // Mock getContext
    const originalGetContext = canvasRef.current.getContext;
    canvasRef.current.getContext = vi.fn(
      () => mockCtx,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    // setPointerCaptureとreleasePointerCaptureをモック
    canvasRef.current.setPointerCapture = vi.fn();
    canvasRef.current.releasePointerCapture = vi.fn();

    // requestAnimationFrameをモック
    let rafCallback: FrameRequestCallback | null = null;
    const rafMock = vi.fn((callback: FrameRequestCallback) => {
      rafCallback = callback;
      return 1;
    });
    vi.spyOn(global, "requestAnimationFrame").mockImplementation(rafMock);
    vi.spyOn(global, "cancelAnimationFrame").mockImplementation(vi.fn());

    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
      }),
    );

    // Start drawing
    act(() => {
      result.current.isDrawing.current = true;
    });

    // Call onPointerStart to initialize the drawing process
    const mockEvent = {
      preventDefault: vi.fn(),
      pointerId: 123,
      pointerType: "mouse",
      nativeEvent: {
        offsetX: 10,
        offsetY: 20,
      },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    act(() => {
      result.current.onPointerStart(mockEvent);
    });

    // Verify requestAnimationFrame was called
    expect(global.requestAnimationFrame).toHaveBeenCalled();

    // 手動でdrawPointsのコールバックを1回だけ実行
    if (rafCallback) {
      act(() => {
        rafCallback(0);
      });
    }

    // 元のgetContextメソッドを復元
    canvasRef.current.getContext = originalGetContext;
    vi.restoreAllMocks(); // モックをリセット
  });

  it("handles drawPoints function with multiple points", () => {
    const canvasRef = { current: document.createElement("canvas") };
    const mockCtx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      stroke: vi.fn(),
      lineWidth: 0,
      lineCap: "",
      lineJoin: "",
      strokeStyle: "",
      globalCompositeOperation: "",
    } as unknown as CanvasRenderingContext2D;

    // TypeScriptの型エラーを回避するためにgetContextをモック
    const originalGetContext = canvasRef.current.getContext;
    canvasRef.current.getContext = vi.fn(
      () => mockCtx,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    // setPointerCaptureとreleasePointerCaptureをモック
    canvasRef.current.setPointerCapture = vi.fn();
    canvasRef.current.releasePointerCapture = vi.fn();

    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
      }),
    );

    // Start drawing
    act(() => {
      result.current.isDrawing.current = true;
    });

    // Call onPointerStart to initialize
    const startEvent = {
      preventDefault: vi.fn(),
      pointerId: 123,
      pointerType: "mouse",
      nativeEvent: {
        offsetX: 10,
        offsetY: 20,
      },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    // requestAnimationFrameをモックして無限ループを防ぐ
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = vi.fn(() => 1);

    act(() => {
      result.current.onPointerStart(startEvent);
    });

    // Add multiple points with onPointerMove
    const moveEvent1 = {
      pointerType: "mouse",
      nativeEvent: {
        offsetX: 15,
        offsetY: 25,
      },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    const moveEvent2 = {
      pointerType: "mouse",
      nativeEvent: {
        offsetX: 20,
        offsetY: 30,
      },
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    act(() => {
      result.current.onPointerMove(moveEvent1);
      result.current.onPointerMove(moveEvent2);
    });

    // End drawing to trigger final drawPoints
    const endEvent = {
      preventDefault: vi.fn(),
      pointerId: 123,
      pointerType: "mouse",
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    act(() => {
      result.current.onPointerEnd(endEvent);
    });

    // 元に戻す
    global.requestAnimationFrame = originalRAF;

    // Verify drawing functions were called
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();

    // 元のgetContextメソッドを復元
    canvasRef.current.getContext = originalGetContext;
  });

  it("calls onDrawEnd callback when drawing ends", () => {
    const canvasRef = { current: document.createElement("canvas") };
    const onDrawEnd = vi.fn();

    // releasePointerCaptureをモック
    canvasRef.current.releasePointerCapture = vi.fn();

    const { result } = renderHook(() =>
      useCanvas({
        canvasRef,
        drawingStyle: DefaultDrawingStyle,
        onDrawEnd,
      }),
    );

    // Start drawing
    act(() => {
      result.current.isDrawing.current = true;
    });

    // End drawing
    const endEvent = {
      preventDefault: vi.fn(),
      pointerId: 123,
      pointerType: "mouse",
    } as unknown as React.PointerEvent<HTMLCanvasElement>;

    act(() => {
      result.current.onPointerEnd(endEvent);
    });

    // Verify onDrawEnd was called
    expect(onDrawEnd).toHaveBeenCalled();
  });
});

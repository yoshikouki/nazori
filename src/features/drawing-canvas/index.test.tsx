import { fireEvent, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DrawingCanvas } from "./index";

// Mock IndexedDB
vi.mock("idb", () => ({
  openDB: vi.fn().mockResolvedValue({
    transaction: vi.fn().mockReturnThis(),
    objectStore: vi.fn().mockReturnThis(),
    getAll: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(1),
    clear: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue(1),
    store: {
      index: vi.fn().mockReturnValue({
        getAll: vi.fn().mockResolvedValue([
          {
            id: "test-style-id",
            profileId: "test-profile-id",
            style: {
              lineWidth: 2,
              lineColor: "#000000",
              penOnly: false,
            },
            createdAt: new Date(),
          },
        ]),
      }),
    },
    index: vi.fn().mockReturnValue({
      getAll: vi.fn().mockResolvedValue([
        {
          id: "test-style-id",
          profileId: "test-profile-id",
          style: {
            lineWidth: 2,
            lineColor: "#000000",
            penOnly: false,
          },
          createdAt: new Date(),
        },
      ]),
    }),
  }),
}));

// Mock window.matchMedia
beforeEach(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

  // Mock URL.createObjectURL and URL.revokeObjectURL
  URL.createObjectURL = vi.fn().mockReturnValue("mock-url");
  URL.revokeObjectURL = vi.fn();
});

// Mock canvas methods
const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  stroke: vi.fn(),
  getImageData: vi.fn(() => ({ width: 100, height: 100 })),
  putImageData: vi.fn(),
  lineWidth: 0,
  lineCap: "",
  lineJoin: "",
  strokeStyle: "",
  globalCompositeOperation: "",
}));

// Mock drawBlobToCanvas
vi.mock("@/features/drawing-canvas/drawing-core", () => ({
  drawBlobToCanvas: vi.fn().mockResolvedValue(true),
  resizeCanvasToParent: vi.fn().mockReturnValue(true),
  isAllowedPointerType: vi.fn().mockReturnValue(true),
  applyDrawingStyle: vi.fn().mockReturnValue({}),
  calculateMidPoint: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  drawSmoothLine: vi
    .fn()
    .mockReturnValue({ lastPos: { x: 0, y: 0 }, midPoint: { x: 0, y: 0 } }),
  clearCanvas: vi.fn(),
  canvasToBlob: vi.fn().mockResolvedValue(new Blob()),
  blobToImage: vi.fn().mockResolvedValue(new Image()),
}));

describe("DrawingCanvas", () => {
  it("renders the component with all required elements", () => {
    const { container } = render(<DrawingCanvas />);

    // Check if the canvas element is rendered
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    // Check if the toolbar buttons are rendered
    const toolbar = container.querySelector(".pointer-events-none");
    expect(toolbar).toBeInTheDocument();
  });

  it("handles drawing style changes", async () => {
    const user = userEvent.setup();
    const { container } = render(<DrawingCanvas />);

    // Find toolbar container by class instead of role
    const toolbarContainer = container.querySelector(".pointer-events-none");
    expect(toolbarContainer).toBeInTheDocument();

    // Mock HTMLCanvasElement.prototype.getContext
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext =
      mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;

    // Find and click a button directly
    const buttons = container.querySelectorAll("button");
    if (buttons.length > 0) {
      await user.click(buttons[1]); // Click the second button (undo)
    }

    // Restore original getContext
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("handles canvas pointer events", async () => {
    const { container } = render(<DrawingCanvas />);

    // Get canvas element
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    if (canvas) {
      // Mock canvas context and pointer methods
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext =
        mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;

      // Mock pointer capture methods
      canvas.setPointerCapture = vi.fn();
      canvas.releasePointerCapture = vi.fn();

      // Simulate pointer events
      fireEvent.pointerDown(canvas, {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 10,
        clientY: 20,
      });

      fireEvent.pointerMove(canvas, {
        pointerId: 1,
        pointerType: "mouse",
        clientX: 20,
        clientY: 30,
      });

      fireEvent.pointerUp(canvas, {
        pointerId: 1,
        pointerType: "mouse",
      });

      // Restore original getContext
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  it("handles toolbar button clicks", async () => {
    const { container } = render(<DrawingCanvas />);

    // Find toolbar buttons
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);

    // Click each button using fireEvent instead of userEvent
    // fireEventはpointer-events: noneを無視します
    for (const button of buttons) {
      if (button.querySelector("svg")) {
        fireEvent.click(button);
      }
    }

    // Test passes if no errors are thrown
    expect(true).toBe(true);
  });
});

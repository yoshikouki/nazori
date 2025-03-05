import { vi } from "vitest";

/**
 * Canvas関連のモックファクトリー
 * テスト用にCanvas関連のオブジェクトのモックを生成する
 */

// PredefinedColorSpaceの型定義
type PredefinedColorSpace = "srgb" | "display-p3";

/**
 * DOMRectのモックを生成する関数
 */
const createMockDOMRect = (width: number, height: number): DOMRect => {
  return {
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    toJSON: () => ({}),
  };
};

/**
 * CanvasRenderingContext2Dのモックを生成するファクトリー
 */
export const createMockContext = () => {
  return {
    // 基本プロパティ
    canvas: {},
    lineWidth: 0,
    lineCap: "",
    lineJoin: "",
    strokeStyle: "",
    fillStyle: "",
    globalCompositeOperation: "",

    // メソッド
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      width: 0,
      height: 0,
      data: new Uint8ClampedArray(),
      colorSpace: "srgb" as PredefinedColorSpace,
    })),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    toDataURL: vi.fn(() => "data:image/png;base64,"),
  } as unknown as CanvasRenderingContext2D;
};

/**
 * HTMLCanvasElementのモックを生成するファクトリー
 */
export const createMockCanvas = () => {
  const mockContext = createMockContext();

  // HTMLElementのモック作成
  const mockParentElement = {
    getBoundingClientRect: vi.fn(() => createMockDOMRect(0, 0)),
    // 他のHTMLElementのプロパティは必要に応じて追加
  } as unknown as HTMLElement;

  const canvas = {
    width: 0,
    height: 0,
    parentElement: mockParentElement,
    getContext: vi.fn(() => mockContext),
    toBlob: vi.fn((callback: BlobCallback) => {
      const blob = new Blob([""], { type: "image/png" });
      callback(blob);
    }),
  } as unknown as HTMLCanvasElement;

  // contextのcanvasプロパティを正しく設定
  Object.defineProperty(mockContext, "canvas", {
    get: () => canvas,
  });

  return {
    canvas,
    context: mockContext,
  };
};

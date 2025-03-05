import "@vitest/browser/providers/playwright";
import { vi } from "vitest";

// Next.jsのモジュールをモック
vi.mock("next/image", () => ({
  default: function MockImage({ src, alt, width, height, ...props }: Record<string, unknown>) {
    return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" />`;
  },
  __esModule: true,
}));

vi.mock("next/link", () => ({
  default: function MockLink({ href, children, ...props }: Record<string, unknown>) {
    return `<a href="${href}">${children}</a>`;
  },
  __esModule: true,
}));

// process.envのモック
if (typeof window !== "undefined") {
  // ブラウザ環境でprocessが定義されていない場合は定義する
  window.process = window.process || {};
  window.process.env = window.process.env || {};
}

// 必要なグローバル変数を設定
// ブラウザ環境とNode環境で分岐
if (typeof window !== "undefined") {
  // ブラウザ環境
  (window as Window & typeof globalThis).global = window;
} else {
  // Node環境
  global.process = global.process || {};
  global.process.env = global.process.env || {};
}

import "@vitest/browser/providers/playwright";
import React from "react";
import { vi } from "vitest";

// Next.jsのモジュールをモック
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => React.createElement("img", props),
  __esModule: true,
}));

vi.mock("next/link", () => ({
  default: (props: Record<string, unknown>) => React.createElement("a", props),
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

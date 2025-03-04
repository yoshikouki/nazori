import React from "react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    return React.createElement("img", props);
  },
}));

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
    return React.createElement("a", { href, ...props }, children);
  },
}));

// Mock SaveImageButton component to avoid fetch errors
vi.mock("../features/drawing-canvas/save-image-button", () => ({
  SaveImageButton: ({
    canvasRef,
  }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) => {
    return React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          console.log("Save image button clicked");
        },
      },
      "ほぞん",
    );
  },
}));

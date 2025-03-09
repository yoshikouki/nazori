"use client";

import { cn } from "@/lib/utils";
import { useDrawing } from "./drawing-provider";

export type TemplateDirection = "horizontal" | "vertical";

interface TemplateOverlayProps {
  className?: string;
  direction?: TemplateDirection;
}

export const TemplateOverlay = ({
  className,
  direction = "vertical",
}: TemplateOverlayProps) => {
  const { currentTemplate } = useDrawing();

  if (!currentTemplate) {
    return null;
  }

  // 縦書きか横書きかによってスタイルを変更
  const isVertical = direction === "vertical";

  // 縦書きの場合は文字サイズを調整（横書きより少し小さく）
  const fontSize = isVertical ? "min(25vw, 25vh)" : "min(30vw, 30vh)";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className,
      )}
    >
      <div
        className="select-none text-center text-gray-400 opacity-20"
        style={{
          fontSize,
          lineHeight: 1,
          fontFamily: "sans-serif",
          userSelect: "none",
          writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
          textOrientation: isVertical ? "upright" : "mixed",
        }}
      >
        {currentTemplate.content}
      </div>
    </div>
  );
};

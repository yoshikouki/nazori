"use client";

import { Button } from "@/components/ui/button";
import { EraserIcon, HandIcon, PencilLineIcon, PlusIcon, Undo2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import type { DrawingStyle } from "./drawing-style";
import type { OnDrawingStyleChange } from "./index";
import { LineColorPicker } from "./line-color-picker";
import { LineWidthPicker } from "./line-width-picker";
import { SaveImageButton } from "./save-image-button";

interface ToolBarProps {
  drawingStyle: DrawingStyle;
  onDrawingStyleChange: OnDrawingStyleChange;
  onUndo: () => void;
  onOpenDrawingList: () => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const ToolBar = ({
  drawingStyle,
  onDrawingStyleChange,
  onUndo,
  onOpenDrawingList,
  canvasRef,
}: ToolBarProps) => {
  const togglePenOnly = () => {
    onDrawingStyleChange({ penOnly: !drawingStyle.penOnly });
  };

  const toggleEraser = () => {
    onDrawingStyleChange({ isEraser: !drawingStyle.isEraser });
  };

  return (
    <>
      <div className="flex flex-col items-start justify-start gap-2 *:pointer-events-auto">
        <Button
          type="button"
          size="default"
          variant="ghost"
          className="aspect-square select-none p-0"
          asChild
        >
          <Link href="/">
            <Image src="/logo-no-padding.webp" alt="logo" width={20} height={20} />
          </Link>
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onUndo}
          className="select-none"
        >
          <Undo2Icon />
          <span className="hidden sm:inline">もどす</span>
        </Button>
        <Button
          type="button"
          size="lg"
          variant={drawingStyle.isEraser ? "default" : "outline"}
          onClick={toggleEraser}
          className="select-none"
        >
          <EraserIcon />
          <span className="hidden sm:inline">けしごむ</span>
        </Button>
        <LineWidthPicker
          width={drawingStyle.lineWidth}
          color={drawingStyle.lineColor}
          onWidthChange={onDrawingStyleChange}
        />
        <LineColorPicker color={drawingStyle.lineColor} onColorChange={onDrawingStyleChange} />
      </div>

      <div className="flex items-center justify-center gap-2 *:pointer-events-auto">
        <Button
          type="button"
          variant="outline"
          className="aspect-square select-none p-0"
          onClick={onOpenDrawingList}
        >
          <PlusIcon />
        </Button>
      </div>

      <div className="flex flex-col items-end gap-2 *:pointer-events-auto">
        <SaveImageButton canvasRef={canvasRef} />
        <Button
          type="button"
          variant={drawingStyle.penOnly ? "default" : "outline"}
          onClick={togglePenOnly}
          className="pointer-events-auto select-none"
        >
          {drawingStyle.penOnly ? <PencilLineIcon /> : <HandIcon />}
          <span className="hidden sm:inline">{drawingStyle.penOnly ? "ペン" : "て"}</span>
        </Button>
      </div>
    </>
  );
};

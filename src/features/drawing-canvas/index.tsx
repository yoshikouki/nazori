"use client";

import { drawBlobToCanvas } from "@/lib/canvas";
import type { Drawing } from "@/lib/client-db";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { CanvasArea } from "./canvas-area";
import { DrawingDialog } from "./drawing-dialog";
import type { DrawingStyle } from "./drawing-style";
import { ToolBar } from "./tool-bar";
import { useDrawingHistory } from "./use-drawing-history";
import { useDrawingStore } from "./use-drawing-store";

export type OnDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => void;

/**
 * 描画キャンバスのメインコンポーネント
 * 各サブコンポーネントを組み合わせて全体の機能を提供します
 */
export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingListOpen, setIsDrawingListOpen] = useState(false);

  const {
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    drawings,
    createDrawing,
    selectDrawing,
    currentDrawingId,
  } = useDrawingStore();

  const { pushHistory, undo, clearHistory } = useDrawingHistory({
    canvasRef,
    historyId: currentDrawingId,
  });

  // 描画スタイルの更新ハンドラー
  const onDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => {
    updateDrawingStyle(newDrawingStyle);
  };

  // 描画リストダイアログの開閉ハンドラー
  const openDrawingList = () => {
    setIsDrawingListOpen(true);
  };

  const closeDrawingList = () => {
    setIsDrawingListOpen(false);
  };

  // 描画変更ハンドラー
  const onChangeDrawing = async (drawing: Drawing) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    try {
      await drawBlobToCanvas(ctx, drawing.image);
      selectDrawing(drawing.id);
      clearHistory(); // 履歴をクリア
      pushHistory(); // 新しい状態を履歴に追加
      setIsDrawingListOpen(false);
    } catch (error) {
      console.error("Failed to load drawing:", error);
    }
  };

  // 新規描画作成ハンドラー
  const createNewDrawing = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsDrawingListOpen(false);
    clearHistory(); // 履歴をクリア
    await createDrawing();
  };

  // 描画終了ハンドラー
  const onDrawEnd = () => {
    pushHistory();
  };

  // アニメーションフレームのクリーンアップ
  useEffect(() => {
    return () => {
      // クリーンアップは各コンポーネント内で行うため、ここでは何もしない
    };
  }, []);

  return (
    <div
      className={cn(
        "relative h-full w-full select-none opacity-100 transition-opacity duration-300",
        isLoading && "opacity-10",
      )}
    >
      <CanvasArea
        drawingStyle={drawingStyle}
        onDrawEnd={onDrawEnd}
        canvasRef={canvasRef}
        className="h-full w-full"
      />

      <div className="pointer-events-none absolute inset-x-4 top-4 grid touch-none select-none grid-cols-3 items-start justify-between">
        <ToolBar
          drawingStyle={drawingStyle}
          onDrawingStyleChange={onDrawingStyleChange}
          onUndo={undo}
          onOpenDrawingList={openDrawingList}
          canvasRef={canvasRef}
        />
      </div>

      <DrawingDialog
        isOpen={isDrawingListOpen}
        onClose={closeDrawingList}
        drawings={drawings}
        onDrawingSelect={onChangeDrawing}
        onCreateNewDrawing={createNewDrawing}
        isLoading={isLoading}
      />
    </div>
  );
};

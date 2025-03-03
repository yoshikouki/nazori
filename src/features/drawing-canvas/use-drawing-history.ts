"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { useDrawingStore } from "./use-drawing-store";

interface UseDrawingHistoryProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const useDrawingHistory = ({ canvasRef }: UseDrawingHistoryProps) => {
  const { updateCurrentDrawing } = useDrawingStore();
  const historyRef = useRef<ImageData[]>([]);

  const pushHistory = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imageData);

    // 描画内容を保存
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const result = await updateCurrentDrawing(blob);
      if (!result) {
        // 保存に失敗した場合は履歴からも削除
        historyRef.current.pop();
      }
    });
  };

  const onUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const lastImageData = historyRef.current.pop();
    if (!lastImageData) return;

    ctx.putImageData(lastImageData, 0, 0);
  };

  return { pushHistory, onUndo };
};

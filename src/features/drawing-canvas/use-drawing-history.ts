"use client";

import { canvasToBlob, drawBlobToCanvas } from "@/lib/canvas";
import type { RefObject } from "react";
import { useDrawingStore } from "./use-drawing-store";

interface UseDrawingHistoryProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const useDrawingHistory = ({ canvasRef }: UseDrawingHistoryProps) => {
  const { addToHistory, undoHistory } = useDrawingStore();

  const pushHistory = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const blob = await canvasToBlob(canvas);
    if (!blob) {
      console.error("Failed to convert canvas to blob");
      return;
    }
    await addToHistory(blob);
  };

  const onUndo = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const updatedHistory = await undoHistory();
    if (!updatedHistory) return;
    if (updatedHistory.currentIndex >= 0) {
      const prevBlob = updatedHistory.imageDataList[updatedHistory.currentIndex];
      if (prevBlob) {
        await drawBlobToCanvas(ctx, prevBlob);
        return;
      }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return {
    pushHistory,
    onUndo,
  };
};

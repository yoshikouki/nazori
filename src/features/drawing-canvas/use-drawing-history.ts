"use client";

import { canvasToBlob, drawBlobToCanvas } from "@/features/drawing-canvas/drawing-core";
import type { DrawingHistory } from "@/features/drawing-canvas/models/drawing-history";
import { drawingHistoryRepository } from "@/features/drawing-canvas/repositories";
import type { RefObject } from "react";
import { useEffect } from "react";

interface UseDrawingHistoryProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  profileId: string | null | undefined;
}

export const useDrawingHistory = ({ canvasRef, profileId }: UseDrawingHistoryProps) => {
  const pushHistory = async () => {
    const blob = await canvasToBlob(canvasRef.current);
    if (!profileId || !canvasRef.current || !blob) return;
    await drawingHistoryRepository.addImage(profileId, blob);
  };

  const drawHistoryToCanvas = async (history: DrawingHistory | null | undefined) => {
    if (!history || history.currentIndex < 0 || !canvasRef.current) return;
    const currentImage = history.imageList[history.currentIndex];
    await drawBlobToCanvas(canvasRef.current, currentImage);
  };

  const undo = async () => {
    if (!profileId || !canvasRef.current) return;
    const updatedHistory = await drawingHistoryRepository.undo(profileId);
    await drawHistoryToCanvas(updatedHistory);
  };

  const clearHistory = async () => {
    if (!profileId || !canvasRef.current) return;
    await drawingHistoryRepository.clear(profileId);
  };

  // Update history state when profileId changes
  useEffect(() => {
    if (!profileId) return;
    const loadHistory = async () => {
      if (!profileId || !canvasRef.current) return;
      const history =
        (await drawingHistoryRepository.getByProfileId(profileId)) ||
        (await drawingHistoryRepository.create(profileId));
      await drawHistoryToCanvas(history);
    };
    loadHistory();
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler
  }, [profileId, canvasRef, drawHistoryToCanvas]);

  return {
    pushHistory,
    undo,
    clearHistory,
  };
};

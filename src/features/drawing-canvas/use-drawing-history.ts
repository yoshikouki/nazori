"use client";

import {
  canvasToBlob,
  clearCanvas,
  drawBlobToCanvas,
} from "@/features/drawing-canvas/drawing-core";
import { drawingHistoryRepository } from "@/features/drawing-canvas/repositories";
import type { RefObject } from "react";
import { useEffect } from "react";

interface UseDrawingHistoryProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  profileId: string | null | undefined;
}

/**
 * Custom hook for managing drawing history
 * Integrates in-memory history with IndexedDB persistence
 */
export const useDrawingHistory = ({ canvasRef, profileId }: UseDrawingHistoryProps) => {
  /**
   * Adds current canvas state to history
   * Throttles saves to prevent excessive database operations
   */
  const pushHistory = async () => {
    if (!profileId || !canvasRef.current) return;

    // Get current canvas state as blob
    const blob = await canvasToBlob(canvasRef.current);
    if (!blob) {
      return;
    }

    // Push to history
    await drawingHistoryRepository.addImage(profileId, blob);
  };

  /**
   * Moves back one step in history
   * Updates canvas with previous state
   */
  const undo = async () => {
    if (!profileId || !canvasRef.current) return;

    const updatedHistory = await drawingHistoryRepository.undo(profileId);
    if (!updatedHistory || updatedHistory.currentIndex < 0) return;

    // Draw current history state to canvas
    const currentImage = updatedHistory.imageList[updatedHistory.currentIndex];
    await drawBlobToCanvas(canvasRef.current, currentImage);
  };

  /**
   * Moves forward one step in history
   * Updates canvas with next state
   */
  const redo = async () => {
    if (!profileId || !canvasRef.current) return;

    const updatedHistory = await drawingHistoryRepository.redo(profileId);
    if (!updatedHistory) {
      return;
    }

    // Draw current history state to canvas
    if (updatedHistory.currentIndex >= 0) {
      const currentImage = updatedHistory.imageList[updatedHistory.currentIndex];
      await drawBlobToCanvas(canvasRef.current, currentImage);
    } else {
      // Clear canvas if we've redone to initial state
      clearCanvas(canvasRef.current);
    }
  };

  /**
   * Clears all history and resets canvas
   */
  const clearHistory = async () => {
    if (!profileId || !canvasRef.current) return;

    await drawingHistoryRepository.clear(profileId);
  };

  // Update history state when profileId changes
  useEffect(() => {
    if (!profileId) return;

    const loadHistory = async () => {
      if (!profileId || !canvasRef.current) return;

      const history = await drawingHistoryRepository.getByProfileId(profileId);
      if (!history) {
        return;
      }

      // Draw current history state to canvas
      if (history.currentIndex >= 0) {
        const currentImage = history.imageList[history.currentIndex];
        await drawBlobToCanvas(canvasRef.current, currentImage);
      } else {
        // Clear canvas if history is at initial state
        clearCanvas(canvasRef.current);
      }
    };

    loadHistory();
  }, [profileId, canvasRef]);

  return {
    pushHistory,
    undo,
    redo,
    clearHistory,
  };
};

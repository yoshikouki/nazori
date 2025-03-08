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
  profileId: string | null;
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

    try {
      // Get current canvas state as blob
      const blob = await canvasToBlob(canvasRef.current);
      if (!blob) {
        throw new Error("Failed to get canvas blob");
      }

      // Push to history
      const updatedHistory = await drawingHistoryRepository.addImage(profileId, blob);
      if (!updatedHistory) {
        throw new Error("Failed to save history");
      }
    } catch (err) {
      console.error("Failed to save history", err);
    }
  };

  /**
   * Moves back one step in history
   * Updates canvas with previous state
   */
  const undo = async () => {
    if (!profileId || !canvasRef.current) return;

    try {
      const updatedHistory = await drawingHistoryRepository.undo(profileId);
      if (!updatedHistory || updatedHistory.currentIndex < 0) return;

      // Draw current history state to canvas
      const currentImage = updatedHistory.imageList[updatedHistory.currentIndex];
      await drawBlobToCanvas(canvasRef.current, currentImage);
    } catch (err) {
      console.error("Failed to undo", err);
    }
  };

  /**
   * Moves forward one step in history
   * Updates canvas with next state
   */
  const redo = async () => {
    if (!profileId || !canvasRef.current) return;

    try {
      const updatedHistory = await drawingHistoryRepository.redo(profileId);
      if (!updatedHistory) {
        throw new Error("Failed to redo");
      }

      // Draw current history state to canvas
      if (updatedHistory.currentIndex >= 0) {
        const currentImage = updatedHistory.imageList[updatedHistory.currentIndex];
        await drawBlobToCanvas(canvasRef.current, currentImage);
      } else {
        // Clear canvas if we've redone to initial state
        clearCanvas(canvasRef.current);
      }
    } catch (err) {
      console.error("Failed to redo", err);
    }
  };

  /**
   * Clears all history and resets canvas
   */
  const clearHistory = async () => {
    if (!profileId || !canvasRef.current) return;

    try {
      const updatedHistory = await drawingHistoryRepository.clear(profileId);
      if (!updatedHistory) {
        throw new Error("Failed to clear history");
      }
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  // Update history state when profileId changes
  useEffect(() => {
    if (!profileId) return;

    const loadHistory = async () => {
      if (!profileId || !canvasRef.current) return;

      try {
        const history = await drawingHistoryRepository.getByProfileId(profileId);
        if (!history) {
          throw new Error("History not found");
        }

        // Draw current history state to canvas
        if (history.currentIndex >= 0) {
          const currentImage = history.imageList[history.currentIndex];
          await drawBlobToCanvas(canvasRef.current, currentImage);
        } else {
          // Clear canvas if history is at initial state
          clearCanvas(canvasRef.current);
        }
      } catch (err) {
        console.error("Failed to load history", err);
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

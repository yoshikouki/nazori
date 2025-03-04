"use client";

import {
  canvasToBlob,
  clearCanvas,
  drawBlobToCanvas,
} from "@/features/drawing-canvas/drawing-core";
import { drawingHistoryRepository } from "@/lib/client-db/repositories";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

interface UseDrawingHistoryProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  historyId: string | null;
}

/**
 * Custom hook for managing drawing history
 * Integrates in-memory history with IndexedDB persistence
 */
export const useDrawingHistory = ({ canvasRef, historyId }: UseDrawingHistoryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Timestamp of last operation for throttling
  const lastOperationTimeRef = useRef<number>(0);
  // Auto-save interval in milliseconds
  const autoSaveInterval = 2000;

  /**
   * Adds current canvas state to history
   * Throttles saves to prevent excessive database operations
   */
  const pushHistory = async (force = false) => {
    if (!historyId || !canvasRef.current) return;

    const now = Date.now();
    // Skip if not forced and within throttle interval
    if (!force && now - lastOperationTimeRef.current < autoSaveInterval) {
      return;
    }

    lastOperationTimeRef.current = now;
    setIsLoading(true);

    try {
      // Get current canvas state as blob
      const blob = await canvasToBlob(canvasRef.current);
      if (!blob) {
        throw new Error("Failed to get canvas blob");
      }

      // Push to history
      await drawingHistoryRepository.addImage(historyId, blob);

      // Enable undo after adding history
      setCanUndo(true);
      // Disable redo since we've created a new history branch
      setCanRedo(false);
    } catch (err) {
      console.error("Failed to save history", err);
      setError(err instanceof Error ? err : new Error("Failed to save history"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Moves back one step in history
   * Updates canvas with previous state
   */
  const undo = async () => {
    if (!historyId || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const updatedHistory = await drawingHistoryRepository.undo(historyId);
      if (!updatedHistory) {
        throw new Error("Failed to undo");
      }

      // Update undo/redo availability based on current position
      setCanUndo(updatedHistory.currentIndex > -1);
      setCanRedo(updatedHistory.currentIndex < updatedHistory.imageList.length - 1);

      // Draw current history state to canvas
      if (updatedHistory.currentIndex >= 0) {
        const currentImage = updatedHistory.imageList[updatedHistory.currentIndex];
        await drawBlobToCanvas(canvasRef.current, currentImage);
      } else {
        // Clear canvas if we've undone all history
        clearCanvas(canvasRef.current);
      }
    } catch (err) {
      console.error("Failed to undo", err);
      setError(err instanceof Error ? err : new Error("Failed to undo"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Moves forward one step in history
   * Updates canvas with next state
   */
  const redo = async () => {
    if (!historyId || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const updatedHistory = await drawingHistoryRepository.redo(historyId);
      if (!updatedHistory) {
        throw new Error("Failed to redo");
      }

      // Update undo/redo availability
      setCanUndo(updatedHistory.currentIndex > -1);
      setCanRedo(updatedHistory.currentIndex < updatedHistory.imageList.length - 1);

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
      setError(err instanceof Error ? err : new Error("Failed to redo"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears all history and resets canvas
   */
  const clearHistory = async () => {
    if (!historyId || !canvasRef.current) return;

    setIsLoading(true);
    try {
      await drawingHistoryRepository.clear(historyId);

      // Reset undo/redo availability
      setCanUndo(false);
      setCanRedo(false);

      // Clear canvas
      clearCanvas(canvasRef.current);
    } catch (err) {
      console.error("Failed to clear history", err);
      setError(err instanceof Error ? err : new Error("Failed to clear history"));
    } finally {
      setIsLoading(false);
    }
  };

  // Update history state when historyId changes
  useEffect(() => {
    if (!historyId) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    const loadHistory = async () => {
      if (!historyId || !canvasRef.current) return;

      setIsLoading(true);
      try {
        const history = await drawingHistoryRepository.getById(historyId);
        if (!history) {
          throw new Error("History not found");
        }

        // Update undo/redo availability
        setCanUndo(history.currentIndex > -1);
        setCanRedo(history.currentIndex < history.imageList.length - 1);

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
        setError(err instanceof Error ? err : new Error("Failed to load history"));
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [historyId, canvasRef]);

  return {
    pushHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    isLoading,
    error,
  };
};

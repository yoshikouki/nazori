"use client";

import { useEffect, useState } from "react";
import type { DrawingStyle } from "../drawing-style";
import { DefaultDrawingStyle } from "../drawing-style";
import type { DrawingStyleRepository } from "../interfaces/repositories";
import type { DrawingStyleRecord } from "../models/drawing-style-record";

export interface DrawingStyleStore {
  drawingStyle: DrawingStyle;
  updateDrawingStyle: (newStyle: Partial<DrawingStyle>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDrawingStyleStore = (
  repository: DrawingStyleRepository,
  profileId: string | null,
): DrawingStyleStore => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [drawingStyleRecord, setDrawingStyleRecord] = useState<DrawingStyleRecord | null>(null);
  const [isEraser, setIsEraser] = useState(false);

  // Current drawing style derived from stored record and eraser state
  const drawingStyle: DrawingStyle = drawingStyleRecord
    ? {
        lineWidth: drawingStyleRecord.lineWidth,
        lineColor: drawingStyleRecord.lineColor,
        penOnly: drawingStyleRecord.penOnly,
        isEraser: isEraser,
      }
    : DefaultDrawingStyle;

  /**
   * Updates drawing style with partial changes
   * Handles special case for eraser mode which is not persisted
   */
  const updateDrawingStyle = async (newStyle: Partial<DrawingStyle>) => {
    if (!drawingStyleRecord) return;

    try {
      // Special handling for eraser mode - not stored in DB
      if ("isEraser" in newStyle) {
        const { isEraser, ...styleWithoutEraser } = newStyle;
        setIsEraser(!!isEraser);

        // Exit if only eraser mode was changed
        if (Object.keys(styleWithoutEraser).length === 0) return;

        // Update DB with non-eraser style changes
        const updatedStyle = await repository.update(drawingStyleRecord.id, {
          ...drawingStyle,
          ...styleWithoutEraser,
          isEraser: drawingStyleRecord.isEraser,
        });

        if (updatedStyle) {
          setDrawingStyleRecord(updatedStyle);
        }
        return;
      }

      // Normal style update
      const updatedStyle = await repository.update(drawingStyleRecord.id, {
        ...drawingStyle,
        ...newStyle,
        isEraser: drawingStyleRecord.isEraser,
      });

      if (updatedStyle) {
        setDrawingStyleRecord(updatedStyle);
      }
    } catch (err) {
      console.error("Failed to update style", err);
      setError(err instanceof Error ? err : new Error("Failed to update style"));
    }
  };

  /**
   * Loads drawing style data from repository
   */
  useEffect(() => {
    const loadData = async () => {
      if (!profileId) return;

      try {
        setIsLoading(true);

        // Get or create drawing style
        const styleRecord =
          (await repository.getByProfileId(profileId)) ||
          (await repository.create(profileId, DefaultDrawingStyle));

        setDrawingStyleRecord(styleRecord);
      } catch (err) {
        console.error("Failed to load drawing style", err);
        setError(err instanceof Error ? err : new Error("Failed to load drawing style"));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profileId, repository]);

  return {
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    error,
  };
};

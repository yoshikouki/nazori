"use client";

import { useEffect, useState } from "react";
import type { DrawingRepository } from "../interfaces/repositories";
import type { Drawing } from "../models/drawing";

export interface DrawingDataStore {
  drawings: Drawing[];
  currentDrawingId: string | null;
  createDrawing: () => Promise<Drawing | undefined>;
  updateCurrentDrawing: (image: Blob) => Promise<Drawing | undefined>;
  selectDrawing: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useDrawingDataStore = (
  repository: DrawingRepository,
  profileId: string | null,
): DrawingDataStore => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);

  /**
   * Creates a new drawing for the current profile
   */
  const createDrawing = async () => {
    if (!profileId) return;

    try {
      const drawing = await repository.create(profileId);
      setDrawings([drawing, ...drawings]);
      setCurrentDrawingId(drawing.id);
      return drawing;
    } catch (err) {
      console.error("Failed to create drawing", err);
      setError(err instanceof Error ? err : new Error("Failed to create drawing"));
    }
  };

  /**
   * Updates the current drawing with new image data
   */
  const updateCurrentDrawing = async (image: Blob): Promise<Drawing | undefined> => {
    if (!profileId || !currentDrawingId) {
      setError(new Error("Failed to update drawing: No profile or drawing selected"));
      return;
    }

    try {
      // Save drawing to storage
      const updatedDrawing = await repository.updateImage(currentDrawingId, image);
      if (!updatedDrawing) {
        throw new Error("Failed to update drawing");
      }

      // Update drawing list with new version
      setDrawings(drawings.map((d) => (d.id === currentDrawingId ? updatedDrawing : d)));
      return updatedDrawing;
    } catch (err) {
      console.error("Failed to update drawing", err);
      setError(err instanceof Error ? err : new Error("Failed to update drawing"));
      return;
    }
  };

  /**
   * Selects a drawing by ID
   */
  const selectDrawing = (id: string) => {
    setCurrentDrawingId(id);
  };

  /**
   * Loads drawings data from repository
   */
  useEffect(() => {
    const loadData = async () => {
      if (!profileId) return;

      try {
        setIsLoading(true);

        // Get drawings list
        const drawingsList = await repository.getByProfileId(profileId);
        setDrawings(drawingsList);

        // Select the first drawing if no drawing is selected
        if (drawingsList.length > 0 && !currentDrawingId) {
          setCurrentDrawingId(drawingsList[0].id);
        }
      } catch (err) {
        console.error("Failed to load drawings", err);
        setError(err instanceof Error ? err : new Error("Failed to load drawings"));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profileId, repository, currentDrawingId]);

  return {
    drawings,
    currentDrawingId,
    createDrawing,
    updateCurrentDrawing,
    selectDrawing,
    isLoading,
    error,
  };
};

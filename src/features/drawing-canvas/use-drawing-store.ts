"use client";

import type { Drawing } from "@/features/drawing-canvas/models/drawing";
import type { DrawingHistory } from "@/features/drawing-canvas/models/drawing-history";
import type { DrawingStyleRecord } from "@/features/drawing-canvas/models/drawing-style-record";
import type { Profile } from "@/features/drawing-canvas/models/profile";
import {
  drawingHistoryRepository,
  drawingRepository,
  drawingStyleRepository,
  profileRepository,
} from "@/features/drawing-canvas/repositories";
import { useEffect, useState } from "react";
import { DefaultDrawingStyle, type DrawingStyle } from "./drawing-style";

/**
 * Custom hook for managing drawing data store
 * Handles persistence and state management for drawing-related data
 */
export const useDrawingStore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [drawingStyleRecord, setDrawingStyleRecord] = useState<DrawingStyleRecord | null>(null);
  const [isEraser, setIsEraser] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<DrawingHistory | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);

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

    // Special handling for eraser mode - not stored in DB
    if ("isEraser" in newStyle) {
      const { isEraser, ...styleWithoutEraser } = newStyle;
      setIsEraser(!!isEraser);

      // Exit if only eraser mode was changed
      if (Object.keys(styleWithoutEraser).length === 0) return;

      // Update DB with non-eraser style changes
      const updatedStyle = await drawingStyleRepository.update(drawingStyleRecord.id, {
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
    const updatedStyle = await drawingStyleRepository.update(drawingStyleRecord.id, {
      ...drawingStyle,
      ...newStyle,
      isEraser: drawingStyleRecord.isEraser,
    });

    if (updatedStyle) {
      setDrawingStyleRecord(updatedStyle);
    }
  };

  /**
   * Creates a new drawing for the current profile
   */
  const createDrawing = async () => {
    if (!currentProfile) return;
    const drawing = await drawingRepository.create(currentProfile.id);
    setDrawings((prev) => [drawing, ...prev]);
    setCurrentDrawingId(drawing.id);
    return drawing;
  };

  /**
   * Updates the current drawing with new image data
   */
  const updateCurrentDrawing = async (image: Blob | null): Promise<Drawing | undefined> => {
    if (!currentProfile || !currentDrawingId || !image) {
      return;
    }

    // Save drawing to storage
    const updatedDrawing = await drawingRepository.updateImage(currentDrawingId, image);
    if (!updatedDrawing) {
      return;
    }

    // Update drawing list with new version
    setDrawings(drawings.map((d) => (d.id === currentDrawingId ? updatedDrawing : d)));
    return updatedDrawing;
  };

  /**
   * Selects a drawing by ID
   */
  const selectDrawing = (id: string) => {
    setCurrentDrawingId(id);
  };

  /**
   * Loads initial data from IndexedDB
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Get or create profile
      const profile =
        currentProfile ??
        (await profileRepository.getFirst()) ??
        (await profileRepository.create());

      if (profile.id !== currentProfile?.id) {
        setCurrentProfile(profile);
        // Skip further loading if profile changed
        return;
      }

      // Get or create drawing style
      const styleRecord =
        (await drawingStyleRepository.getByProfileId(profile.id)) ||
        (await drawingStyleRepository.create(profile.id, DefaultDrawingStyle));
      setDrawingStyleRecord(styleRecord);

      // Get or create drawing history
      const history =
        (await drawingHistoryRepository.getByProfileId(profile.id)) ||
        (await drawingHistoryRepository.create(profile.id));
      setDrawingHistory(history);

      // Get drawings list
      const drawings = await drawingRepository.getByProfileId(profile.id);
      setDrawings(drawings);
      setIsLoading(false);
    };

    loadData();
  }, [currentProfile]);

  /**
   * Deletes a drawing by ID
   */
  const deleteDrawing = async (id: string): Promise<boolean> => {
    const success = await drawingRepository.delete(id);
    if (success) {
      setDrawings(drawings.filter((d) => d.id !== id));
      if (currentDrawingId === id) {
        setCurrentDrawingId(null);
      }
      return true;
    }
    return false;
  };

  return {
    isLoading,
    currentProfile,
    // Drawing style
    drawingStyle,
    updateDrawingStyle,
    // Drawings
    drawings,
    selectDrawing,
    createDrawing,
    deleteDrawing,
    // Selected drawing
    currentDrawingId,
    updateCurrentDrawing,
  };
};

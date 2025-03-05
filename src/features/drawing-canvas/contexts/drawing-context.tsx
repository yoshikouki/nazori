"use client";

import { createContext, useContext, useMemo } from "react";
import type { DrawingStyle } from "../drawing-style";
import type {
  DrawingHistoryRepository,
  DrawingRepository,
  DrawingStyleRepository,
  ProfileRepository,
} from "../interfaces/repositories";
import type { Drawing } from "../models/drawing";
import { profileRepository } from "../repositories";
import { drawingStyleRepository } from "../repositories";
import { drawingRepository } from "../repositories";
import { useDrawingDataStore } from "../stores/use-drawing-data-store";
import { useDrawingStyleStore } from "../stores/use-drawing-style-store";
import { useProfileStore } from "../stores/use-profile-store";

export interface DrawingContextValue {
  // Drawing style
  drawingStyle: DrawingStyle;
  updateDrawingStyle: (newStyle: Partial<DrawingStyle>) => Promise<void>;

  // Drawings
  drawings: Drawing[];
  currentDrawingId: string | null;
  createDrawing: () => Promise<Drawing | undefined>;
  updateCurrentDrawing: (image: Blob) => Promise<Drawing | undefined>;
  selectDrawing: (id: string) => void;

  // Loading state
  isLoading: boolean;
  error: Error | null;
}

export const DrawingContext = createContext<DrawingContextValue | null>(null);

interface DrawingProviderProps {
  children: React.ReactNode;
  repositories?: {
    drawingStyleRepository?: DrawingStyleRepository;
    drawingRepository?: DrawingRepository;
    profileRepository?: ProfileRepository;
    drawingHistoryRepository?: DrawingHistoryRepository;
  };
}

export const DrawingProvider: React.FC<DrawingProviderProps> = ({
  children,
  repositories = {},
}) => {
  // プロファイルストアを初期化
  const profileStore = useProfileStore(repositories.profileRepository || profileRepository);

  // DrawingStyleストアを初期化
  const drawingStyleStore = useDrawingStyleStore(
    repositories.drawingStyleRepository || drawingStyleRepository,
    profileStore.currentProfile?.id || null,
  );

  // DrawingDataストアを初期化
  const drawingDataStore = useDrawingDataStore(
    repositories.drawingRepository || drawingRepository,
    profileStore.currentProfile?.id || null,
  );

  // ローディング状態とエラー状態を集約
  const isLoading =
    profileStore.isLoading || drawingStyleStore.isLoading || drawingDataStore.isLoading;
  const error = profileStore.error || drawingStyleStore.error || drawingDataStore.error;

  // コンテキスト値をメモ化
  const contextValue = useMemo<DrawingContextValue>(
    () => ({
      // Drawing style
      drawingStyle: drawingStyleStore.drawingStyle,
      updateDrawingStyle: drawingStyleStore.updateDrawingStyle,

      // Drawings
      drawings: drawingDataStore.drawings,
      currentDrawingId: drawingDataStore.currentDrawingId,
      createDrawing: drawingDataStore.createDrawing,
      updateCurrentDrawing: drawingDataStore.updateCurrentDrawing,
      selectDrawing: drawingDataStore.selectDrawing,

      // Loading state
      isLoading,
      error,
    }),
    [drawingStyleStore, drawingDataStore, isLoading, error],
  );

  return <DrawingContext.Provider value={contextValue}>{children}</DrawingContext.Provider>;
};

export const useDrawingContext = (): DrawingContextValue => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error("useDrawingContext must be used within a DrawingProvider");
  }
  return context;
};

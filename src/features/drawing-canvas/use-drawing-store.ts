"use client";

import {
  type DrawingHistory,
  type DrawingStyleRecord,
  type Profile,
  drawingHistoryOperations,
  drawingStyleOperations,
  profileOperations,
} from "@/lib/client-db";
import { useEffect, useState } from "react";
import { DefaultDrawingStyle, type DrawingStyle } from "./drawing-style";

export const useDrawingStore = () => {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [drawingStyleRecord, setDrawingStyleRecord] = useState<DrawingStyleRecord | null>(null);
  const [drawingHistory, setDrawingHistory] = useState<DrawingHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const drawingStyle: DrawingStyle = drawingStyleRecord
    ? {
        lineWidth: drawingStyleRecord.lineWidth,
        lineColor: drawingStyleRecord.lineColor,
        penOnly: drawingStyleRecord.penOnly,
      }
    : DefaultDrawingStyle;

  const canUndo = drawingHistory ? drawingHistory.currentIndex > 0 : false;
  const canRedo = drawingHistory
    ? drawingHistory.currentIndex < drawingHistory.imageDataList.length - 1
    : false;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const profile =
          currentProfile ??
          (await profileOperations.getFirst()) ??
          (await profileOperations.create());
        if (profile.id !== currentProfile?.id) {
          setCurrentProfile(profile);
          return; // Skip subsequent processing if the profile has changed
        }
        const styleRecord =
          (await drawingStyleOperations.getByProfileId(profile.id)) ||
          (await drawingStyleOperations.create(profile.id, DefaultDrawingStyle));
        setDrawingStyleRecord(styleRecord);
        const history =
          (await drawingHistoryOperations.getByProfileId(profile.id)) ||
          (await drawingHistoryOperations.create(profile.id));
        setDrawingHistory(history);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("データの読み込みに失敗しました"));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentProfile]);

  const updateDrawingHistory = async (
    imageData: Blob | null,
    action: "add" | "undo" | "redo" = "add",
  ): Promise<DrawingHistory | undefined> => {
    if (!drawingHistory || !currentProfile) return undefined;
    try {
      let updatedHistory: DrawingHistory | undefined;
      switch (action) {
        case "add":
          if (imageData) {
            updatedHistory = await drawingHistoryOperations.addImageData(
              drawingHistory.id,
              imageData,
            );
          }
          break;
        case "undo":
          updatedHistory = await drawingHistoryOperations.undo(drawingHistory.id);
          break;
        case "redo":
          updatedHistory = await drawingHistoryOperations.redo(drawingHistory.id);
          break;
      }

      if (!updatedHistory) {
        setError(new Error("履歴の更新に失敗しました"));
        return undefined;
      }
      setDrawingHistory(updatedHistory);
      return updatedHistory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("履歴の更新に失敗しました"));
      return undefined;
    }
  };

  const addToHistory = async (imageData: Blob): Promise<DrawingHistory | undefined> => {
    if (!drawingHistory || !currentProfile) return undefined;
    try {
      const updatedHistory = await drawingHistoryOperations.addImageData(
        drawingHistory.id,
        imageData,
      );
      if (!updatedHistory) {
        setError(new Error("履歴の追加に失敗しました"));
        return undefined;
      }
      setDrawingHistory(updatedHistory);
      return updatedHistory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("履歴の追加に失敗しました"));
      return undefined;
    }
  };

  const undoHistory = async (): Promise<DrawingHistory | undefined> => {
    if (!drawingHistory || !currentProfile) return undefined;
    try {
      const updatedHistory = await drawingHistoryOperations.undo(drawingHistory.id);
      if (!updatedHistory) {
        setError(new Error("元に戻す操作に失敗しました"));
        return undefined;
      }
      setDrawingHistory(updatedHistory);
      return updatedHistory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("元に戻す操作に失敗しました"));
      return undefined;
    }
  };

  const updateDrawingStyle = async (newStyle: Partial<DrawingStyle>) => {
    if (!drawingStyleRecord) return;
    try {
      const updatedStyle = await drawingStyleOperations.update(drawingStyleRecord.id, {
        ...drawingStyle,
        ...newStyle,
      });
      if (updatedStyle) {
        setDrawingStyleRecord(updatedStyle);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("スタイルの更新に失敗しました"));
    }
  };

  return {
    drawingStyle,
    drawingHistory,
    canUndo,
    canRedo,
    isLoading,
    error,
    updateDrawingHistory,
    addToHistory,
    undoHistory,
    updateDrawingStyle,
  };
};

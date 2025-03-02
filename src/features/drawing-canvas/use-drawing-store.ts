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
        setCurrentProfile(profile);
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

  const updateDrawingStyle = async (newStyle: Partial<DrawingStyle>) => {
    try {
      if (drawingStyleRecord) {
        const updatedStyle = { ...drawingStyleRecord, ...newStyle };
        const updated = await drawingStyleOperations.update(
          drawingStyleRecord.id,
          updatedStyle,
        );
        if (updated) {
          setDrawingStyleRecord(updated);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("スタイルの更新に失敗しました"));
    }
  };

  const addImageData = async (imageData: string) => {
    if (!drawingHistory) return;

    try {
      const updated = await drawingHistoryOperations.addImageData(drawingHistory.id, imageData);
      if (updated) {
        setDrawingHistory(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("画像データの追加に失敗しました"));
    }
  };

  const undo = async () => {
    if (!drawingHistory || !canUndo) return;

    try {
      const updated = await drawingHistoryOperations.undo(drawingHistory.id);
      if (updated) {
        setDrawingHistory(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("元に戻す操作に失敗しました"));
    }
  };

  const redo = async () => {
    if (!drawingHistory || !canRedo) return;

    try {
      const updated = await drawingHistoryOperations.redo(drawingHistory.id);
      if (updated) {
        setDrawingHistory(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("やり直し操作に失敗しました"));
    }
  };

  const clearDrawing = async () => {
    if (!drawingHistory) return;

    try {
      const newHistory = await drawingHistoryOperations.create(profileId);
      setDrawingHistory(newHistory);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("描画のクリアに失敗しました"));
    }
  };

  const getCurrentImageData = () => {
    if (!drawingHistory) return null;

    const { imageDataList, currentIndex } = drawingHistory;
    if (currentIndex < 0 || imageDataList.length === 0) return null;

    return imageDataList[currentIndex];
  };

  const drawingStyle: DrawingStyle = drawingStyleRecord
    ? {
        lineWidth: drawingStyleRecord.lineWidth,
        lineColor: drawingStyleRecord.lineColor,
        penOnly: drawingStyleRecord.penOnly,
      }
    : DefaultDrawingStyle;

  return {
    drawingStyle,
    updateDrawingStyle,
    drawingHistory,
    addImageData,
    undo,
    redo,
    clearDrawing,
    getCurrentImageData,
    canUndo,
    canRedo,
    isLoading,
    error,
  };
};

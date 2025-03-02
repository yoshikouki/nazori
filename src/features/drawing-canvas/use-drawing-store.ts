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
  const [isEraser, setIsEraser] = useState(false);

  const drawingStyle: DrawingStyle = drawingStyleRecord
    ? {
        lineWidth: drawingStyleRecord.lineWidth,
        lineColor: drawingStyleRecord.lineColor,
        penOnly: drawingStyleRecord.penOnly,
        isEraser: isEraser,
      }
    : DefaultDrawingStyle;

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

    if ("isEraser" in newStyle) {
      setIsEraser(!!newStyle.isEraser);
      const { isEraser: _, ...styleWithoutEraser } = newStyle;
      if (Object.keys(styleWithoutEraser).length === 0) return;

      const styleToUpdate = styleWithoutEraser;

      try {
        const updatedStyle = await drawingStyleOperations.update(drawingStyleRecord.id, {
          ...drawingStyle,
          ...styleToUpdate,
          isEraser: drawingStyleRecord.isEraser,
        });
        if (updatedStyle) {
          setDrawingStyleRecord(updatedStyle);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("スタイルの更新に失敗しました"));
      }
      return;
    }

    try {
      const updatedStyle = await drawingStyleOperations.update(drawingStyleRecord.id, {
        ...drawingStyle,
        ...newStyle,
        isEraser: drawingStyleRecord.isEraser,
      });
      if (updatedStyle) {
        setDrawingStyleRecord(updatedStyle);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("スタイルの更新に失敗しました"));
    }
  };

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
          // Skip subsequent processing if the profile has changed
          return;
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

  return {
    drawingStyle,
    drawingHistory,
    isLoading,
    error,
    addToHistory,
    undoHistory,
    updateDrawingStyle,
  };
};

"use client";

import {
  type DrawingHistory,
  type DrawingStyleRecord,
  drawingHistoryOperations,
  drawingStyleOperations,
} from "@/lib/client-db";
import { useEffect, useState } from "react";
import { DefaultDrawingStyle, type DrawingStyle } from "./line-style";

interface UseDrawingStoreProps {
  profileId: string;
}

interface UseDrawingStoreReturn {
  // 描画スタイル関連
  drawingStyle: DrawingStyle;
  updateDrawingStyle: (newStyle: Partial<DrawingStyle>) => Promise<void>;

  // 描画履歴関連
  drawingHistory: DrawingHistory | null;
  addImageData: (imageData: string) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clearDrawing: () => Promise<void>;
  getCurrentImageData: () => string | null;
  canUndo: boolean;
  canRedo: boolean;

  // ローディング状態
  isLoading: boolean;
  error: Error | null;
}

export const useDrawingStore = ({ profileId }: UseDrawingStoreProps): UseDrawingStoreReturn => {
  const [drawingStyle, setDrawingStyle] = useState<DrawingStyle>(DefaultDrawingStyle);
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

        const styleRecord = await drawingStyleOperations.getByProfileId(profileId);
        if (styleRecord) {
          setDrawingStyleRecord(styleRecord);
          setDrawingStyle(styleRecord.style);
        } else {
          const newStyleRecord = await drawingStyleOperations.create(
            profileId,
            DefaultDrawingStyle,
          );
          setDrawingStyleRecord(newStyleRecord);
        }

        let history = await drawingHistoryOperations.getByProfileId(profileId);
        if (!history) {
          history = await drawingHistoryOperations.create(profileId);
        }
        setDrawingHistory(history);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("データの読み込みに失敗しました"));
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      loadData();
    }
  }, [profileId]);

  const updateDrawingStyle = async (newStyle: Partial<DrawingStyle>) => {
    try {
      const updatedStyle = { ...drawingStyle, ...newStyle };
      setDrawingStyle(updatedStyle);

      if (drawingStyleRecord) {
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

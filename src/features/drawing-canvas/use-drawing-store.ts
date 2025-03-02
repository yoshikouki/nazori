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

  // 元に戻す・やり直しが可能かどうかを計算
  const canUndo = drawingHistory ? drawingHistory.currentIndex > 0 : false;
  const canRedo = drawingHistory
    ? drawingHistory.currentIndex < drawingHistory.imageDataList.length - 1
    : false;

  // 初期データの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // スタイルの読み込み
        const styleRecord = await drawingStyleOperations.getByProfileId(profileId);
        if (styleRecord) {
          setDrawingStyleRecord(styleRecord);
          setDrawingStyle(styleRecord.style);
        } else {
          // スタイルが存在しない場合は新規作成
          const newStyleRecord = await drawingStyleOperations.create(
            profileId,
            DefaultDrawingStyle,
          );
          setDrawingStyleRecord(newStyleRecord);
        }

        // 履歴の読み込み
        let history = await drawingHistoryOperations.getByProfileId(profileId);
        if (!history) {
          // 履歴が存在しない場合は新規作成
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

  // 描画スタイルの更新
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

  // 画像データの追加
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

  // 元に戻す
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

  // やり直し
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

  // 描画をクリア
  const clearDrawing = async () => {
    if (!drawingHistory) return;

    try {
      // 新しい履歴を作成
      const newHistory = await drawingHistoryOperations.create(profileId);
      setDrawingHistory(newHistory);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("描画のクリアに失敗しました"));
    }
  };

  // 現在の画像データを取得
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

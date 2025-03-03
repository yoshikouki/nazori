"use client";

import {
  type Drawing,
  type DrawingHistory,
  type DrawingStyleRecord,
  type Profile,
  drawingHistoryOperations,
  drawingOperations,
  drawingStyleOperations,
  profileOperations,
} from "@/lib/client-db";
import { useEffect, useState } from "react";
import { DefaultDrawingStyle, type DrawingStyle } from "./drawing-style";

export const useDrawingStore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [drawingStyleRecord, setDrawingStyleRecord] = useState<DrawingStyleRecord | null>(null);
  const [isEraser, setIsEraser] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<DrawingHistory | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);

  const drawingStyle: DrawingStyle = drawingStyleRecord
    ? {
        lineWidth: drawingStyleRecord.lineWidth,
        lineColor: drawingStyleRecord.lineColor,
        penOnly: drawingStyleRecord.penOnly,
        isEraser: isEraser,
      }
    : DefaultDrawingStyle;

  const addToHistory = async (image: Blob): Promise<DrawingHistory | undefined> => {
    if (!drawingHistory || !currentProfile) return undefined;
    try {
      const updatedHistory = await drawingHistoryOperations.addImage(drawingHistory.id, image);
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
      const { isEraser, ...styleWithoutEraser } = newStyle;
      setIsEraser(!!isEraser);
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

  const createDrawing = async () => {
    if (!currentProfile) return;
    try {
      const drawing = await drawingOperations.create(currentProfile.id);
      setDrawings([drawing, ...drawings]);
      setCurrentDrawingId(drawing.id);
      return drawing;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("描画の作成に失敗しました"));
    }
  };

  const updateCurrentDrawing = async (image: Blob): Promise<Drawing | undefined> => {
    if (!currentProfile || !currentDrawingId) {
      setError(
        new Error("描画の更新に失敗しました: プロファイルまたは描画が選択されていません"),
      );
      return;
    }

    try {
      // 描画を保存
      const updatedDrawing = await drawingOperations.updateImage(currentDrawingId, image);
      if (!updatedDrawing) {
        setError(new Error("描画の更新に失敗しました"));
        return;
      }
      setDrawings(drawings.map((d) => (d.id === currentDrawingId ? updatedDrawing : d)));

      // 履歴に追加
      await addToHistory(image);

      return updatedDrawing;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("描画の更新に失敗しました"));
      return;
    }
  };

  const selectDrawing = (id: string) => {
    setCurrentDrawingId(id);
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
        const drawings = await drawingOperations.getByProfileId(profile.id);
        setDrawings(drawings);
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
    drawings,
    createDrawing,
    updateCurrentDrawing,
    currentDrawingId,
    selectDrawing,
  };
};

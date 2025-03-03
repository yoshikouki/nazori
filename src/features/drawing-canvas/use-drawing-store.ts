"use client";

import type { Drawing, DrawingHistory, DrawingStyleRecord, Profile } from "@/lib/client-db";
import {
  drawingHistoryRepository,
  drawingRepository,
  drawingStyleRepository,
  profileRepository,
} from "@/lib/client-db/repositories";
import { useEffect, useState } from "react";
import { DefaultDrawingStyle, type DrawingStyle } from "./drawing-style";

/**
 * 描画データストアを管理するカスタムフック
 * データの永続化と状態管理を担当します
 */
export const useDrawingStore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [drawingStyleRecord, setDrawingStyleRecord] = useState<DrawingStyleRecord | null>(null);
  const [isEraser, setIsEraser] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<DrawingHistory | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);

  // 現在の描画スタイル
  const drawingStyle: DrawingStyle = drawingStyleRecord
    ? {
        lineWidth: drawingStyleRecord.lineWidth,
        lineColor: drawingStyleRecord.lineColor,
        penOnly: drawingStyleRecord.penOnly,
        isEraser: isEraser,
      }
    : DefaultDrawingStyle;

  /**
   * 描画スタイルを更新する
   */
  const updateDrawingStyle = async (newStyle: Partial<DrawingStyle>) => {
    if (!drawingStyleRecord) return;

    try {
      // 消しゴムモードの更新は特別扱い（DBには保存しない）
      if ("isEraser" in newStyle) {
        const { isEraser, ...styleWithoutEraser } = newStyle;
        setIsEraser(!!isEraser);

        // 消しゴムモード以外の更新がなければ終了
        if (Object.keys(styleWithoutEraser).length === 0) return;

        // 消しゴムモード以外の更新があれば、DBに保存
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

      // 通常のスタイル更新
      const updatedStyle = await drawingStyleRepository.update(drawingStyleRecord.id, {
        ...drawingStyle,
        ...newStyle,
        isEraser: drawingStyleRecord.isEraser,
      });

      if (updatedStyle) {
        setDrawingStyleRecord(updatedStyle);
      }
    } catch (err) {
      console.error("スタイルの更新に失敗しました", err);
      setError(err instanceof Error ? err : new Error("スタイルの更新に失敗しました"));
    }
  };

  /**
   * 新しい描画を作成する
   */
  const createDrawing = async () => {
    if (!currentProfile) return;

    try {
      const drawing = await drawingRepository.create(currentProfile.id);
      setDrawings([drawing, ...drawings]);
      setCurrentDrawingId(drawing.id);
      return drawing;
    } catch (err) {
      console.error("描画の作成に失敗しました", err);
      setError(err instanceof Error ? err : new Error("描画の作成に失敗しました"));
    }
  };

  /**
   * 現在の描画を更新する
   */
  const updateCurrentDrawing = async (image: Blob): Promise<Drawing | undefined> => {
    if (!currentProfile || !currentDrawingId) {
      setError(
        new Error("描画の更新に失敗しました: プロファイルまたは描画が選択されていません"),
      );
      return;
    }

    try {
      // 描画を保存
      const updatedDrawing = await drawingRepository.updateImage(currentDrawingId, image);
      if (!updatedDrawing) {
        throw new Error("描画の更新に失敗しました");
      }

      // 描画リストを更新
      setDrawings(drawings.map((d) => (d.id === currentDrawingId ? updatedDrawing : d)));
      return updatedDrawing;
    } catch (err) {
      console.error("描画の更新に失敗しました", err);
      setError(err instanceof Error ? err : new Error("描画の更新に失敗しました"));
      return;
    }
  };

  /**
   * 描画を選択する
   */
  const selectDrawing = (id: string) => {
    setCurrentDrawingId(id);
  };

  /**
   * データを読み込む
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // プロファイルの取得または作成
        const profile =
          currentProfile ??
          (await profileRepository.getFirst()) ??
          (await profileRepository.create());

        if (profile.id !== currentProfile?.id) {
          setCurrentProfile(profile);
          // プロファイルが変更された場合は、後続の処理をスキップ
          return;
        }

        // 描画スタイルの取得または作成
        const styleRecord =
          (await drawingStyleRepository.getByProfileId(profile.id)) ||
          (await drawingStyleRepository.create(profile.id, DefaultDrawingStyle));
        setDrawingStyleRecord(styleRecord);

        // 描画履歴の取得または作成
        const history =
          (await drawingHistoryRepository.getByProfileId(profile.id)) ||
          (await drawingHistoryRepository.create(profile.id));
        setDrawingHistory(history);

        // 描画リストの取得
        const drawings = await drawingRepository.getByProfileId(profile.id);
        setDrawings(drawings);
      } catch (err) {
        console.error("データの読み込みに失敗しました", err);
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
    updateDrawingStyle,
    drawings,
    createDrawing,
    updateCurrentDrawing,
    currentDrawingId,
    selectDrawing,
  };
};

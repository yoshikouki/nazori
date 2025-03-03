"use client";

import { drawingHistoryRepository } from "@/lib/client-db/repositories";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

interface UseDrawingHistoryProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  historyId: string | null;
}

/**
 * 描画履歴を管理するカスタムフック
 * メモリ内履歴とIndexedDB履歴を統合します
 */
export const useDrawingHistory = ({ canvasRef, historyId }: UseDrawingHistoryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // 最後の操作のタイムスタンプを保持
  const lastOperationTimeRef = useRef<number>(0);
  // 自動保存の間隔（ミリ秒）
  const autoSaveInterval = 2000;

  /**
   * 現在のキャンバス状態を履歴に追加する
   */
  const pushHistory = async (force = false) => {
    if (!historyId || !canvasRef.current) return;

    const now = Date.now();
    // 強制保存でない場合は、前回の保存から一定時間経過していない場合はスキップ
    if (!force && now - lastOperationTimeRef.current < autoSaveInterval) {
      return;
    }

    lastOperationTimeRef.current = now;
    setIsLoading(true);

    try {
      const canvas = canvasRef.current;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob));
      });

      if (!blob) {
        throw new Error("キャンバスの画像取得に失敗しました");
      }

      await drawingHistoryRepository.addImage(historyId, blob);
      // 履歴が追加されたので、元に戻す操作が可能になる
      setCanUndo(true);
      // 履歴を追加した時点で、やり直し操作はできなくなる
      setCanRedo(false);
    } catch (err) {
      console.error("履歴の保存に失敗しました", err);
      setError(err instanceof Error ? err : new Error("履歴の保存に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 履歴を一つ戻す
   */
  const undo = async () => {
    if (!historyId || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const updatedHistory = await drawingHistoryRepository.undo(historyId);
      if (!updatedHistory) {
        throw new Error("履歴を戻す操作に失敗しました");
      }

      // 現在のインデックスが-1より大きい場合、まだ戻れる
      setCanUndo(updatedHistory.currentIndex > -1);
      // 現在のインデックスが最後の要素より小さい場合、やり直しできる
      setCanRedo(updatedHistory.currentIndex < updatedHistory.imageList.length - 1);

      // キャンバスに現在の履歴を描画
      if (updatedHistory.currentIndex >= 0) {
        const currentImage = updatedHistory.imageList[updatedHistory.currentIndex];
        await drawImageToCanvas(currentImage);
      } else {
        // 履歴がない場合はキャンバスをクリア
        clearCanvas();
      }
    } catch (err) {
      console.error("履歴を戻す操作に失敗しました", err);
      setError(err instanceof Error ? err : new Error("履歴を戻す操作に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 履歴を一つ進める
   */
  const redo = async () => {
    if (!historyId || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const updatedHistory = await drawingHistoryRepository.redo(historyId);
      if (!updatedHistory) {
        throw new Error("履歴を進める操作に失敗しました");
      }

      // 現在のインデックスが-1より大きい場合、まだ戻れる
      setCanUndo(updatedHistory.currentIndex > -1);
      // 現在のインデックスが最後の要素より小さい場合、やり直しできる
      setCanRedo(updatedHistory.currentIndex < updatedHistory.imageList.length - 1);

      // キャンバスに現在の履歴を描画
      if (updatedHistory.currentIndex >= 0) {
        const currentImage = updatedHistory.imageList[updatedHistory.currentIndex];
        await drawImageToCanvas(currentImage);
      }
    } catch (err) {
      console.error("履歴を進める操作に失敗しました", err);
      setError(err instanceof Error ? err : new Error("履歴を進める操作に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 履歴をクリアする
   */
  const clearHistory = async () => {
    if (!historyId) return;

    setIsLoading(true);
    try {
      await drawingHistoryRepository.clear(historyId);
      setCanUndo(false);
      setCanRedo(false);
      clearCanvas();
    } catch (err) {
      console.error("履歴のクリアに失敗しました", err);
      setError(err instanceof Error ? err : new Error("履歴のクリアに失敗しました"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * キャンバスをクリアする
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  /**
   * Blobをキャンバスに描画する
   */
  const drawImageToCanvas = async (blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        reject(new Error("キャンバスが見つかりません"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = () => {
        reject(new Error("画像の読み込みに失敗しました"));
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  // 履歴IDが変更されたときに、履歴の状態を更新
  useEffect(() => {
    if (!historyId) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const history = await drawingHistoryRepository.getById(historyId);
        if (!history) return;

        setCanUndo(history.currentIndex > -1);
        setCanRedo(history.currentIndex < history.imageList.length - 1);

        // 現在の履歴があれば描画
        if (history.currentIndex >= 0 && history.imageList.length > 0) {
          const currentImage = history.imageList[history.currentIndex];
          await drawImageToCanvas(currentImage);
        } else {
          clearCanvas();
        }
      } catch (err) {
        console.error("履歴の読み込みに失敗しました", err);
        setError(err instanceof Error ? err : new Error("履歴の読み込みに失敗しました"));
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compilerのため
  }, [historyId, clearCanvas, drawImageToCanvas]);

  return {
    pushHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    isLoading,
    error,
  };
};

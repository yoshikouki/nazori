import { clientDB, generateId } from "../../../lib/client-db/index";
import type { DrawingHistory } from "../models/drawing-history";

/**
 * 描画履歴のリポジトリクラス
 * データアクセスロジックをカプセル化します
 */
class DrawingHistoryRepository {
  /**
   * IDで履歴を取得する
   */
  async getById(id: string): Promise<DrawingHistory | undefined> {
    try {
      const db = await clientDB();
      return db.get("drawing_histories", id);
    } catch (error) {
      console.error("履歴の取得に失敗しました", error);
      throw new Error("履歴の取得に失敗しました");
    }
  }

  /**
   * プロファイルIDに紐づく最新の履歴を取得する
   */
  async getByProfileId(profileId: string): Promise<DrawingHistory | undefined> {
    try {
      const db = await clientDB();
      const index = db.transaction("drawing_histories").store.index("by-profile-id");
      const histories = await index.getAll(profileId);
      // 最新の履歴を返す
      return histories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    } catch (error) {
      console.error("履歴の取得に失敗しました", error);
      throw new Error("履歴の取得に失敗しました");
    }
  }

  /**
   * 新しい履歴を作成する
   */
  async create(profileId: string): Promise<DrawingHistory> {
    try {
      const db = await clientDB();
      const now = new Date();
      const history: DrawingHistory = {
        id: generateId(),
        profileId,
        imageList: [],
        currentIndex: -1,
        createdAt: now,
        updatedAt: now,
      };
      await db.add("drawing_histories", history);
      return history;
    } catch (error) {
      console.error("履歴の作成に失敗しました", error);
      throw new Error("履歴の作成に失敗しました");
    }
  }

  /**
   * 履歴に画像を追加する
   */
  async addImage(id: string, image: Blob): Promise<DrawingHistory | undefined> {
    try {
      const db = await clientDB();
      const history = await db.get("drawing_histories", id);
      if (!history) return undefined;

      // 現在のインデックス以降のデータを削除し、新しいデータを追加
      const newList = history.imageList.slice(0, history.currentIndex + 1);
      newList.push(image);

      // 履歴が多すぎる場合は古いものを削除（最大50件）
      const maxHistoryLength = 50;
      const trimmedList =
        newList.length > maxHistoryLength
          ? newList.slice(newList.length - maxHistoryLength)
          : newList;

      const updatedHistory: DrawingHistory = {
        ...history,
        imageList: trimmedList,
        currentIndex: trimmedList.length - 1,
        updatedAt: new Date(),
      };
      await db.put("drawing_histories", updatedHistory);
      return updatedHistory;
    } catch (error) {
      console.error("履歴への画像追加に失敗しました", error);
      throw new Error("履歴への画像追加に失敗しました");
    }
  }

  /**
   * 履歴を一つ戻す
   */
  async undo(id: string): Promise<DrawingHistory | undefined> {
    try {
      const db = await clientDB();
      const history = await db.get("drawing_histories", id);
      if (!history || history.currentIndex < 0) return history;

      const updatedHistory: DrawingHistory = {
        ...history,
        currentIndex: history.currentIndex - 1,
        updatedAt: new Date(),
      };
      await db.put("drawing_histories", updatedHistory);
      return updatedHistory;
    } catch (error) {
      console.error("履歴を戻す操作に失敗しました", error);
      throw new Error("履歴を戻す操作に失敗しました");
    }
  }

  /**
   * 履歴を一つ進める
   */
  async redo(id: string): Promise<DrawingHistory | undefined> {
    try {
      const db = await clientDB();
      const history = await db.get("drawing_histories", id);
      if (!history || history.currentIndex >= history.imageList.length - 1) return history;

      const updatedHistory: DrawingHistory = {
        ...history,
        currentIndex: history.currentIndex + 1,
        updatedAt: new Date(),
      };
      await db.put("drawing_histories", updatedHistory);
      return updatedHistory;
    } catch (error) {
      console.error("履歴を進める操作に失敗しました", error);
      throw new Error("履歴を進める操作に失敗しました");
    }
  }

  /**
   * 履歴をクリアする
   */
  async clear(id: string): Promise<DrawingHistory | undefined> {
    try {
      const db = await clientDB();
      const history = await db.get("drawing_histories", id);
      if (!history) return undefined;

      const updatedHistory: DrawingHistory = {
        ...history,
        imageList: [],
        currentIndex: -1,
        updatedAt: new Date(),
      };
      await db.put("drawing_histories", updatedHistory);
      return updatedHistory;
    } catch (error) {
      console.error("履歴のクリアに失敗しました", error);
      throw new Error("履歴のクリアに失敗しました");
    }
  }

  /**
   * 現在の履歴インデックスの画像を取得する
   */
  async getCurrentImage(id: string): Promise<Blob | undefined> {
    try {
      const history = await this.getById(id);
      if (!history || history.currentIndex < 0 || history.imageList.length === 0) {
        return undefined;
      }
      return history.imageList[history.currentIndex];
    } catch (error) {
      console.error("現在の履歴画像の取得に失敗しました", error);
      throw new Error("現在の履歴画像の取得に失敗しました");
    }
  }
}

// シングルトンインスタンスをエクスポート
export const drawingHistoryRepository = new DrawingHistoryRepository();

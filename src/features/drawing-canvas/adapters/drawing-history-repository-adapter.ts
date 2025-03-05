import type { DrawingHistoryRepository } from "../interfaces/repositories";
import type { DrawingHistory } from "../models/drawing-history";
import { drawingHistoryRepository as dbRepository } from "../repositories";

/**
 * DrawingHistoryRepositoryのアダプタークラス
 * インターフェイスとリポジトリ実装の間の橋渡しをします
 */
export class DrawingHistoryRepositoryAdapter implements DrawingHistoryRepository {
  /**
   * プロファイルIDに紐づく描画履歴を取得する
   */
  async getByProfileId(profileId: string): Promise<DrawingHistory | null> {
    try {
      const result = await dbRepository.getByProfileId(profileId);
      return result || null;
    } catch (err) {
      console.error("Failed to get drawing history by profile ID", err);
      return null;
    }
  }

  /**
   * IDで描画履歴を取得する
   */
  async getById(id: string): Promise<DrawingHistory | null> {
    try {
      const result = await dbRepository.getById(id);
      return result || null;
    } catch (err) {
      console.error("Failed to get drawing history by ID", err);
      return null;
    }
  }

  /**
   * 新しい描画履歴を作成する
   */
  async create(profileId: string): Promise<DrawingHistory> {
    return dbRepository.create(profileId);
  }

  /**
   * 描画履歴に画像を追加する
   */
  async addImage(id: string, image: Blob): Promise<DrawingHistory | null> {
    try {
      const result = await dbRepository.addImage(id, image);
      return result || null;
    } catch (err) {
      console.error("Failed to add image to drawing history", err);
      return null;
    }
  }

  /**
   * 描画履歴を一つ戻る
   */
  async undo(id: string): Promise<DrawingHistory | null> {
    try {
      const result = await dbRepository.undo(id);
      return result || null;
    } catch (err) {
      console.error("Failed to undo drawing history", err);
      return null;
    }
  }

  /**
   * 描画履歴を一つ進める
   */
  async redo(id: string): Promise<DrawingHistory | null> {
    try {
      const result = await dbRepository.redo(id);
      return result || null;
    } catch (err) {
      console.error("Failed to redo drawing history", err);
      return null;
    }
  }

  /**
   * 描画履歴をクリアする
   */
  async clear(id: string): Promise<DrawingHistory | null> {
    try {
      const result = await dbRepository.clear(id);
      return result || null;
    } catch (err) {
      console.error("Failed to clear drawing history", err);
      return null;
    }
  }
}

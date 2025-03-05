import type { DrawingRepository } from "../interfaces/repositories";
import type { Drawing } from "../models/drawing";
import { drawingRepository as dbRepository } from "../repositories";

/**
 * DrawingRepositoryのアダプタークラス
 * インターフェイスとリポジトリ実装の間の橋渡しをします
 */
export class DrawingRepositoryAdapter implements DrawingRepository {
  /**
   * プロファイルIDに紐づく描画を取得する
   */
  async getByProfileId(profileId: string): Promise<Drawing[]> {
    try {
      const results = await dbRepository.getByProfileId(profileId);
      return results || [];
    } catch (err) {
      console.error("Failed to get drawings by profile ID", err);
      return [];
    }
  }

  /**
   * IDで描画を取得する
   */
  async getById(id: string): Promise<Drawing | null> {
    try {
      const result = await dbRepository.getById(id);
      return result || null;
    } catch (err) {
      console.error("Failed to get drawing by ID", err);
      return null;
    }
  }

  /**
   * 新しい描画を作成する
   */
  async create(profileId: string): Promise<Drawing> {
    return dbRepository.create(profileId);
  }

  /**
   * 描画の画像を更新する
   */
  async updateImage(id: string, image: Blob): Promise<Drawing | null> {
    try {
      const result = await dbRepository.updateImage(id, image);
      return result || null;
    } catch (err) {
      console.error("Failed to update drawing image", err);
      return null;
    }
  }

  /**
   * 描画を削除する
   */
  async delete(id: string): Promise<boolean> {
    try {
      await dbRepository.delete(id);
      return true;
    } catch (err) {
      console.error("Failed to delete drawing", err);
      return false;
    }
  }
}

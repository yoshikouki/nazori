import type { DrawingStyle } from "../drawing-style";
import type { DrawingStyleRepository } from "../interfaces/repositories";
import type { DrawingStyleRecord } from "../models/drawing-style-record";
import { drawingStyleRepository as dbRepository } from "../repositories";

/**
 * DrawingStyleRepositoryのアダプタークラス
 * インターフェイスとリポジトリ実装の間の橋渡しをします
 */
export class DrawingStyleRepositoryAdapter implements DrawingStyleRepository {
  /**
   * プロファイルIDに紐づく描画スタイルを取得する
   */
  async getByProfileId(profileId: string): Promise<DrawingStyleRecord | null> {
    try {
      const result = await dbRepository.getByProfileId(profileId);
      return result || null;
    } catch (err) {
      console.error("Failed to get drawing style by profile ID", err);
      return null;
    }
  }

  /**
   * 新しい描画スタイルを作成する
   */
  async create(profileId: string, style: DrawingStyle): Promise<DrawingStyleRecord> {
    return dbRepository.create(profileId, style);
  }

  /**
   * 描画スタイルを更新する
   */
  async update(id: string, style: Partial<DrawingStyle>): Promise<DrawingStyleRecord | null> {
    try {
      // 既存の描画スタイルを取得して、新しいスタイルの属性で更新する
      const existing = await dbRepository.getById(id);
      if (!existing) return null;

      // 完全なDrawingStyleオブジェクトを作成
      const completeStyle: DrawingStyle = {
        lineWidth: style.lineWidth ?? existing.lineWidth,
        lineColor: style.lineColor ?? existing.lineColor,
        penOnly: style.penOnly ?? existing.penOnly,
        isEraser: style.isEraser ?? existing.isEraser,
      };

      const result = await dbRepository.update(id, completeStyle);
      return result || null;
    } catch (err) {
      console.error("Failed to update drawing style", err);
      return null;
    }
  }
}

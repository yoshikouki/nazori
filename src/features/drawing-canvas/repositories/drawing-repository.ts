import { clientDB, generateId } from "../../../lib/client-db/index";
import { EMPTY_CANVAS_BASE64 } from "../../../lib/empty-canvas";
import type { Drawing } from "../models/drawing";

/**
 * 描画データのリポジトリクラス
 * データアクセスロジックをカプセル化します
 */
class DrawingRepository {
  /**
   * IDで描画を取得する
   */
  async getById(id: string): Promise<Drawing | undefined> {
    const db = await clientDB();
    return db.get("drawings", id);
  }

  /**
   * プロファイルIDに紐づく描画を全て取得する
   */
  async getByProfileId(profileId: string): Promise<Drawing[]> {
    const db = await clientDB();
    const index = db.transaction("drawings").store.index("by-profile-id");
    return index.getAll(profileId);
  }

  /**
   * 新しい描画を作成する
   */
  async create(profileId: string): Promise<Drawing> {
    const db = await clientDB();
    const now = new Date();
    const emptyBlob = await fetch(EMPTY_CANVAS_BASE64).then((res) => res.blob());
    const drawing: Drawing = {
      id: generateId(),
      profileId,
      image: emptyBlob,
      createdAt: now,
      updatedAt: now,
    };
    await db.add("drawings", drawing);
    return drawing;
  }

  /**
   * 描画の画像を更新する
   */
  async updateImage(id: string, image: Blob): Promise<Drawing | undefined> {
    const db = await clientDB();
    const drawing = await db.get("drawings", id);
    if (!drawing) return undefined;

    const updatedDrawing: Drawing = {
      ...drawing,
      image,
      updatedAt: new Date(),
    };
    await db.put("drawings", updatedDrawing);
    return updatedDrawing;
  }

  /**
   * 描画を削除する
   */
  async delete(id: string): Promise<boolean> {
    const db = await clientDB();
    await db.delete("drawings", id);
    return true;
  }
}

// シングルトンインスタンスをエクスポート
export const drawingRepository = new DrawingRepository();

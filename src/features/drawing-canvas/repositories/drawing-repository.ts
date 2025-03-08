import { type Drawing, clientDB, generateId } from "../../../lib/client-db/index";

/**
 * 描画データのリポジトリクラス
 * データアクセスロジックをカプセル化します
 */
class DrawingRepository {
  /**
   * IDで描画を取得する
   */
  async getById(id: string): Promise<Drawing | undefined> {
    try {
      const db = await clientDB();
      return db.get("drawings", id);
    } catch (error) {
      console.error("描画の取得に失敗しました", error);
      throw new Error("描画の取得に失敗しました");
    }
  }

  /**
   * プロファイルIDに紐づく描画を全て取得する
   */
  async getByProfileId(profileId: string): Promise<Drawing[]> {
    try {
      const db = await clientDB();
      const index = db.transaction("drawings").store.index("by-profile-id");
      return index.getAll(profileId);
    } catch (error) {
      console.error("描画の取得に失敗しました", error);
      throw new Error("描画の取得に失敗しました");
    }
  }

  /**
   * 新しい描画を作成する
   */
  async create(profileId: string, image = new Blob()): Promise<Drawing> {
    try {
      const db = await clientDB();
      const now = new Date();
      const drawing: Drawing = {
        id: generateId(),
        profileId,
        image,
        createdAt: now,
        updatedAt: now,
      };
      await db.add("drawings", drawing);
      return drawing;
    } catch (error) {
      console.error("描画の作成に失敗しました", error);
      throw new Error("描画の作成に失敗しました");
    }
  }

  /**
   * 描画の画像を更新する
   */
  async updateImage(id: string, image: Blob): Promise<Drawing | undefined> {
    try {
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
    } catch (error) {
      console.error("描画の更新に失敗しました", error);
      throw new Error("描画の更新に失敗しました");
    }
  }

  /**
   * 描画を削除する
   */
  async delete(id: string): Promise<boolean> {
    try {
      const db = await clientDB();
      await db.delete("drawings", id);
      return true;
    } catch (error) {
      console.error("描画の削除に失敗しました", error);
      throw new Error("描画の削除に失敗しました");
    }
  }
}

// シングルトンインスタンスをエクスポート
export const drawingRepository = new DrawingRepository();

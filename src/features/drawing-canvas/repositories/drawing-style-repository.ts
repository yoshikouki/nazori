import { clientDB, generateId } from "../../../lib/client-db/index";
import type { DrawingStyle } from "../drawing-style";
import type { DrawingStyleRecord } from "../models/drawing-style-record";

/**
 * 描画スタイルのリポジトリクラス
 * データアクセスロジックをカプセル化します
 */
class DrawingStyleRepository {
  /**
   * IDでスタイルを取得する
   */
  async getById(id: string): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    return db.get("drawing_styles", id);
  }

  /**
   * 最初のスタイルを取得する
   */
  async getFirst(): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    const styles = await db.getAll("drawing_styles");
    return styles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  /**
   * プロファイルIDに紐づく最新のスタイルを取得する
   */
  async getByProfileId(profileId: string): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    const index = db.transaction("drawing_styles").store.index("by-profile-id");
    const styles = await index.getAll(profileId);
    // 最新のスタイルを返す
    return styles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  /**
   * 新しいスタイルを作成する
   */
  async create(profileId: string, style: DrawingStyle): Promise<DrawingStyleRecord> {
    const db = await clientDB();
    const now = new Date();
    const styleRecord: DrawingStyleRecord = {
      id: generateId(),
      profileId,
      ...style,
      createdAt: now,
      updatedAt: now,
    };
    await db.add("drawing_styles", styleRecord);
    return styleRecord;
  }

  /**
   * スタイルを更新する
   */
  async update(id: string, style: DrawingStyle): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    const styleRecord = await db.get("drawing_styles", id);
    if (!styleRecord) return undefined;

    const updatedStyle: DrawingStyleRecord = {
      ...styleRecord,
      ...style,
      updatedAt: new Date(),
    };
    await db.put("drawing_styles", updatedStyle);
    return updatedStyle;
  }
}

// シングルトンインスタンスをエクスポート
export const drawingStyleRepository = new DrawingStyleRepository();

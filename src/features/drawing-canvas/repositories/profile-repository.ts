import { clientDB, generateId } from "../../../lib/client-db/index";
import type { Profile } from "../models/profile";

/**
 * プロファイルのリポジトリクラス
 * データアクセスロジックをカプセル化します
 */
class ProfileRepository {
  /**
   * IDでプロファイルを取得する
   */
  async getById(id: string): Promise<Profile | undefined> {
    try {
      const db = await clientDB();
      return db.get("profiles", id);
    } catch (error) {
      console.error("プロファイルの取得に失敗しました", error);
      throw new Error("プロファイルの取得に失敗しました");
    }
  }

  /**
   * 最初のプロファイルを取得する
   */
  async getFirst(): Promise<Profile | undefined> {
    try {
      const db = await clientDB();
      const profiles = await db.getAll("profiles");
      return profiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    } catch (error) {
      console.error("プロファイルの取得に失敗しました", error);
      throw new Error("プロファイルの取得に失敗しました");
    }
  }

  /**
   * 新しいプロファイルを作成する
   */
  async create(name?: string): Promise<Profile> {
    try {
      const db = await clientDB();
      const now = new Date();
      const profile: Profile = {
        id: generateId(),
        name,
        createdAt: now,
        updatedAt: now,
      };
      await db.add("profiles", profile);
      return profile;
    } catch (error) {
      console.error("プロファイルの作成に失敗しました", error);
      throw new Error("プロファイルの作成に失敗しました");
    }
  }

  /**
   * プロファイルを更新する
   */
  async update(
    id: string,
    data: Partial<Omit<Profile, "id" | "createdAt">>,
  ): Promise<Profile | undefined> {
    try {
      const db = await clientDB();
      const profile = await db.get("profiles", id);
      if (!profile) return undefined;

      const updatedProfile = {
        ...profile,
        ...data,
        updatedAt: new Date(),
      };
      await db.put("profiles", updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error("プロファイルの更新に失敗しました", error);
      throw new Error("プロファイルの更新に失敗しました");
    }
  }
}

// シングルトンインスタンスをエクスポート
export const profileRepository = new ProfileRepository();

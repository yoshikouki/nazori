import type { ProfileRepository } from "../interfaces/repositories";
import type { Profile } from "../models/profile";
import { profileRepository as dbRepository } from "../repositories";

/**
 * ProfileRepositoryのアダプタークラス
 * インターフェイスとリポジトリ実装の間の橋渡しをします
 */
export class ProfileRepositoryAdapter implements ProfileRepository {
  /**
   * 最初のプロファイルを取得する
   */
  async getFirst(): Promise<Profile | null> {
    try {
      const result = await dbRepository.getFirst();
      return result || null;
    } catch (err) {
      console.error("Failed to get first profile", err);
      return null;
    }
  }

  /**
   * IDでプロファイルを取得する
   */
  async getById(id: string): Promise<Profile | null> {
    try {
      const result = await dbRepository.getById(id);
      return result || null;
    } catch (err) {
      console.error("Failed to get profile by ID", err);
      return null;
    }
  }

  /**
   * 新しいプロファイルを作成する
   */
  async create(): Promise<Profile> {
    return dbRepository.create();
  }

  /**
   * プロファイルを更新する
   */
  async update(id: string, data: Partial<Profile>): Promise<Profile | null> {
    try {
      const result = await dbRepository.update(id, data);
      return result || null;
    } catch (err) {
      console.error("Failed to update profile", err);
      return null;
    }
  }
}

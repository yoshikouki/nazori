import type {
  DrawingHistoryRepository,
  DrawingRepository,
  DrawingStyleRepository,
  ProfileRepository,
} from "../interfaces/repositories";
import { DrawingHistoryRepositoryAdapter } from "./drawing-history-repository-adapter";
import { DrawingRepositoryAdapter } from "./drawing-repository-adapter";
import { DrawingStyleRepositoryAdapter } from "./drawing-style-repository-adapter";
import { ProfileRepositoryAdapter } from "./profile-repository-adapter";

/**
 * リポジトリインスタンスを作成するファクトリ関数
 * 依存性注入を容易にします
 */
export const createRepositories = (options?: {
  drawingStyleRepository?: DrawingStyleRepository;
  drawingRepository?: DrawingRepository;
  profileRepository?: ProfileRepository;
  drawingHistoryRepository?: DrawingHistoryRepository;
}) => {
  return {
    drawingStyleRepository:
      options?.drawingStyleRepository ?? new DrawingStyleRepositoryAdapter(),
    drawingRepository: options?.drawingRepository ?? new DrawingRepositoryAdapter(),
    profileRepository: options?.profileRepository ?? new ProfileRepositoryAdapter(),
    drawingHistoryRepository:
      options?.drawingHistoryRepository ?? new DrawingHistoryRepositoryAdapter(),
  };
};

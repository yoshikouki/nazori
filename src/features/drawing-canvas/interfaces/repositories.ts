import type { DrawingStyle } from "../drawing-style";
import type { Drawing } from "../models/drawing";
import type { DrawingHistory } from "../models/drawing-history";
import type { DrawingStyleRecord } from "../models/drawing-style-record";
import type { Profile } from "../models/profile";

export interface DrawingStyleRepository {
  getByProfileId(profileId: string): Promise<DrawingStyleRecord | null>;
  create(profileId: string, style: DrawingStyle): Promise<DrawingStyleRecord>;
  update(id: string, style: Partial<DrawingStyle>): Promise<DrawingStyleRecord | null>;
}

export interface DrawingRepository {
  getByProfileId(profileId: string): Promise<Drawing[]>;
  getById(id: string): Promise<Drawing | null>;
  create(profileId: string): Promise<Drawing>;
  updateImage(id: string, image: Blob): Promise<Drawing | null>;
  delete(id: string): Promise<boolean>;
}

export interface ProfileRepository {
  getFirst(): Promise<Profile | null>;
  getById(id: string): Promise<Profile | null>;
  create(): Promise<Profile>;
  update(id: string, data: Partial<Profile>): Promise<Profile | null>;
}

export interface DrawingHistoryRepository {
  getByProfileId(profileId: string): Promise<DrawingHistory | null>;
  getById(id: string): Promise<DrawingHistory | null>;
  create(profileId: string): Promise<DrawingHistory>;
  addImage(id: string, image: Blob): Promise<DrawingHistory | null>;
  undo(id: string): Promise<DrawingHistory | null>;
  redo(id: string): Promise<DrawingHistory | null>;
  clear(id: string): Promise<DrawingHistory | null>;
}

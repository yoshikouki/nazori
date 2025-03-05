import type { DrawingStyle } from "../drawing-style";

export interface DrawingStyleRecord extends DrawingStyle {
  id: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

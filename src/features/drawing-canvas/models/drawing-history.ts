export interface DrawingHistory {
  id: string;
  profileId: string;
  imageList: Blob[];
  currentIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

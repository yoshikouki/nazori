import type { DrawingStyle } from "@/features/drawing-canvas/drawing-style";
import { type DBSchema, openDB } from "idb";

export interface Profile {
  id: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Drawing {
  id: string;
  profileId: string;
  image: Blob;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingHistory {
  id: string;
  profileId: string;
  imageList: Blob[]; // Blob
  currentIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingStyleRecord extends DrawingStyle {
  id: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NazoriDB extends DBSchema {
  profiles: {
    key: string;
    value: Profile;
    indexes: {
      "by-created-at": Date;
    };
  };
  drawings: {
    key: string;
    value: Drawing;
    indexes: {
      "by-profile-id": string;
      "by-created-at": Date;
    };
  };
  drawing_histories: {
    key: string;
    value: DrawingHistory;
    indexes: {
      "by-profile-id": string;
      "by-created-at": Date;
    };
  };
  drawing_styles: {
    key: string;
    value: DrawingStyleRecord;
    indexes: {
      "by-profile-id": string;
      "by-created-at": Date;
    };
  };
}

const DB_VERSION = 1;
const DB_NAME = "nazori-db";

export const initDB = async () => {
  return openDB<NazoriDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("profiles")) {
        const profilesStore = db.createObjectStore("profiles", { keyPath: "id" });
        profilesStore.createIndex("by-created-at", "createdAt");
      }

      if (!db.objectStoreNames.contains("drawings")) {
        const drawingsStore = db.createObjectStore("drawings", { keyPath: "id" });
        drawingsStore.createIndex("by-profile-id", "profileId");
        drawingsStore.createIndex("by-created-at", "createdAt");
      }

      if (!db.objectStoreNames.contains("drawing_histories")) {
        const historiesStore = db.createObjectStore("drawing_histories", { keyPath: "id" });
        historiesStore.createIndex("by-profile-id", "profileId");
        historiesStore.createIndex("by-created-at", "createdAt");
      }

      if (!db.objectStoreNames.contains("drawing_styles")) {
        const stylesStore = db.createObjectStore("drawing_styles", { keyPath: "id" });
        stylesStore.createIndex("by-profile-id", "profileId");
        stylesStore.createIndex("by-created-at", "createdAt");
      }
    },
  });
};

let clientDbInstance: ReturnType<typeof initDB> | null = null;

export const clientDB = async () => {
  if (!clientDbInstance) {
    clientDbInstance = initDB();
  }
  return clientDbInstance;
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const profileOperations = {
  async getFirst(): Promise<Profile | undefined> {
    const db = await clientDB();
    const profiles = await db.getAll("profiles");
    return profiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  },

  async getById(id: string): Promise<Profile | undefined> {
    const db = await clientDB();
    return db.get("profiles", id);
  },

  async create(name?: string): Promise<Profile> {
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
  },

  async update(
    id: string,
    data: Partial<Omit<Profile, "id" | "userId" | "createdAt">>,
  ): Promise<Profile | undefined> {
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
  },
};

export const drawingOperations = {
  async create(profileId: string, imageData: Blob): Promise<Drawing> {
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
  },

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
  },
};

export const drawingHistoryOperations = {
  async create(profileId: string): Promise<DrawingHistory> {
    const db = await clientDB();
    const now = new Date();
    const history: DrawingHistory = {
      id: generateId(),
      profileId,
      imageList: [],
      currentIndex: -1,
      createdAt: now,
      updatedAt: now,
    };
    await db.add("drawing_histories", history);
    return history;
  },

  async getByProfileId(profileId: string): Promise<DrawingHistory | undefined> {
    const db = await clientDB();
    const index = db.transaction("drawing_histories").store.index("by-profile-id");
    const histories = await index.getAll(profileId);
    // 最新の履歴を返す
    return histories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  },

  async addImageData(id: string, image: Blob): Promise<DrawingHistory | undefined> {
    const db = await clientDB();
    const history = await db.get("drawing_histories", id);
    if (!history) return undefined;

    // 現在のインデックス以降のデータを削除し、新しいデータを追加
    const newList = history.imageList.slice(0, history.currentIndex + 1);
    newList.push(image);

    const updatedHistory: DrawingHistory = {
      ...history,
      imageList: newList,
      currentIndex: newList.length - 1,
      updatedAt: new Date(),
    };
    await db.put("drawing_histories", updatedHistory);
    return updatedHistory;
  },

  async undo(id: string): Promise<DrawingHistory | undefined> {
    const db = await clientDB();
    const history = await db.get("drawing_histories", id);
    if (!history || history.currentIndex < 0) return history;

    const updatedHistory: DrawingHistory = {
      ...history,
      currentIndex: history.currentIndex - 1,
      updatedAt: new Date(),
    };
    await db.put("drawing_histories", updatedHistory);
    return updatedHistory;
  },

  async redo(id: string): Promise<DrawingHistory | undefined> {
    const db = await clientDB();
    const history = await db.get("drawing_histories", id);
    if (!history || history.currentIndex >= history.imageList.length - 1) return history;

    const updatedHistory: DrawingHistory = {
      ...history,
      currentIndex: history.currentIndex + 1,
      updatedAt: new Date(),
    };
    await db.put("drawing_histories", updatedHistory);
    return updatedHistory;
  },
};

export const drawingStyleOperations = {
  async getFirst(): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    const styles = await db.getAll("drawing_styles");
    return styles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  },

  async getByProfileId(profileId: string): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    const index = db.transaction("drawing_styles").store.index("by-profile-id");
    const styles = await index.getAll(profileId);
    // 最新のスタイルを返す
    return styles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  },

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
  },

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
  },
};

import type { DrawingStyle } from "@/features/drawing-canvas/drawing-style";
import { type DBSchema, openDB } from "idb";

export interface User {
  id: string;
  createdAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Drawing {
  id: string;
  profileId: string;
  imageData: ImageData;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingHistory {
  id: string;
  profileId: string;
  imageDataList: string[]; // Base64エンコードされた画像データの配列
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
  users: {
    key: string;
    value: User;
    indexes: {
      "by-created-at": Date;
    };
  };
  profiles: {
    key: string;
    value: Profile;
    indexes: {
      "by-user-id": string;
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
      if (!db.objectStoreNames.contains("users")) {
        const usersStore = db.createObjectStore("users", { keyPath: "id" });
        usersStore.createIndex("by-created-at", "createdAt");
      }

      if (!db.objectStoreNames.contains("profiles")) {
        const profilesStore = db.createObjectStore("profiles", { keyPath: "id" });
        profilesStore.createIndex("by-user-id", "userId");
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

export const userOperations = {
  async create(): Promise<User> {
    const db = await clientDB();
    const user: User = {
      id: generateId(),
      createdAt: new Date(),
    };
    await db.add("users", user);
    return user;
  },

  async getById(id: string): Promise<User | undefined> {
    const db = await clientDB();
    return db.get("users", id);
  },

  async getAll(): Promise<User[]> {
    const db = await clientDB();
    return db.getAll("users");
  },
};

export const profileOperations = {
  async create(userId: string, name?: string): Promise<Profile> {
    const db = await clientDB();
    const now = new Date();
    const profile: Profile = {
      id: generateId(),
      userId,
      name,
      createdAt: now,
      updatedAt: now,
    };
    await db.add("profiles", profile);
    return profile;
  },

  async getById(id: string): Promise<Profile | undefined> {
    const db = await clientDB();
    return db.get("profiles", id);
  },

  async getByUserId(userId: string): Promise<Profile[]> {
    const db = await clientDB();
    const index = db.transaction("profiles").store.index("by-user-id");
    return index.getAll(userId);
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
  async create(profileId: string, imageData: ImageData): Promise<Drawing> {
    const db = await clientDB();
    const now = new Date();
    const drawing: Drawing = {
      id: generateId(),
      profileId,
      imageData,
      createdAt: now,
      updatedAt: now,
    };
    await db.add("drawings", drawing);
    return drawing;
  },

  async getById(id: string): Promise<Drawing | undefined> {
    const db = await clientDB();
    return db.get("drawings", id);
  },

  async getByProfileId(profileId: string): Promise<Drawing[]> {
    const db = await clientDB();
    const index = db.transaction("drawings").store.index("by-profile-id");
    return index.getAll(profileId);
  },
};

export const drawingHistoryOperations = {
  async create(profileId: string): Promise<DrawingHistory> {
    const db = await clientDB();
    const now = new Date();
    const history: DrawingHistory = {
      id: generateId(),
      profileId,
      imageDataList: [],
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

  async addImageData(id: string, imageData: string): Promise<DrawingHistory | undefined> {
    const db = await clientDB();
    const history = await db.get("drawing_histories", id);
    if (!history) return undefined;

    // 現在のインデックス以降のデータを削除し、新しいデータを追加
    const newList = history.imageDataList.slice(0, history.currentIndex + 1);
    newList.push(imageData);

    const updatedHistory: DrawingHistory = {
      ...history,
      imageDataList: newList,
      currentIndex: newList.length - 1,
      updatedAt: new Date(),
    };
    await db.put("drawing_histories", updatedHistory);
    return updatedHistory;
  },

  async undo(id: string): Promise<DrawingHistory | undefined> {
    const db = await clientDB();
    const history = await db.get("drawing_histories", id);
    if (!history || history.currentIndex <= 0) return history;

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
    if (!history || history.currentIndex >= history.imageDataList.length - 1) return history;

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
  async create(profileId: string, style: DrawingStyle): Promise<DrawingStyleRecord> {
    const db = await clientDB();
    const now = new Date();
    const styleRecord: DrawingStyleRecord = {
      id: generateId(),
      profileId,
      style,
      createdAt: now,
      updatedAt: now,
    };
    await db.add("drawing_styles", styleRecord);
    return styleRecord;
  },

  async getByProfileId(profileId: string): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    const index = db.transaction("drawing_styles").store.index("by-profile-id");
    const styles = await index.getAll(profileId);
    // 最新のスタイルを返す
    return styles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  },

  async update(id: string, style: DrawingStyle): Promise<DrawingStyleRecord | undefined> {
    const db = await clientDB();
    const styleRecord = await db.get("drawing_styles", id);
    if (!styleRecord) return undefined;

    const updatedStyle: DrawingStyleRecord = {
      ...styleRecord,
      style,
      updatedAt: new Date(),
    };
    await db.put("drawing_styles", updatedStyle);
    return updatedStyle;
  },
};

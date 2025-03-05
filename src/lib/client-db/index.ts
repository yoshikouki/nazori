import type { DrawingStyle } from "@/features/drawing-canvas/drawing-style";
import { type DBSchema, openDB } from "idb";
import { ulid } from "ulid";

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
  return ulid();
};

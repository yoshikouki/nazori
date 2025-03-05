"use client";

import { useEffect, useState } from "react";
import type { ProfileRepository } from "../interfaces/repositories";
import type { Profile } from "../models/profile";

export interface ProfileStore {
  currentProfile: Profile | null;
  updateProfile: (data: Partial<Profile>) => Promise<Profile | null>;
  isLoading: boolean;
  error: Error | null;
}

export const useProfileStore = (repository: ProfileRepository): ProfileStore => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  /**
   * Updates the current profile
   */
  const updateProfile = async (data: Partial<Profile>): Promise<Profile | null> => {
    if (!currentProfile) return null;

    try {
      const updatedProfile = await repository.update(currentProfile.id, data);
      if (updatedProfile) {
        setCurrentProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (err) {
      console.error("Failed to update profile", err);
      setError(err instanceof Error ? err : new Error("Failed to update profile"));
      return null;
    }
  };

  /**
   * Loads profile data from repository
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get or create profile
        const profile = (await repository.getFirst()) ?? (await repository.create());

        setCurrentProfile(profile);
      } catch (err) {
        console.error("Failed to load profile", err);
        setError(err instanceof Error ? err : new Error("Failed to load profile"));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [repository]);

  return {
    currentProfile,
    updateProfile,
    isLoading,
    error,
  };
};

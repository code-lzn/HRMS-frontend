/**
 * Global Constraints:
 * - All API endpoints under /api/v1/profile/*
 * - No userId parameter in any function (backend extracts from token)
 * - Use Ant Design 5 components
 * - Mock delay 300-800ms
 */

import { useState, useCallback } from 'react';
import * as profileService from '@/services/profile';
import type { ProfileVO, PendingCountVO } from '@/services/profile/typings';

export default function useProfileModel() {
  const [profile, setProfile] = useState<ProfileVO | null>(null);
  const [pendingCount, setPendingCount] = useState<PendingCountVO | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    const data = await profileService.getPendingCount();
    setPendingCount(data);
  }, []);

  return { profile, pendingCount, loading, fetchProfile, fetchPendingCount, setProfile };
}

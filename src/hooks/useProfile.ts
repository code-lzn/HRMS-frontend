/**
 * Global Constraints:
 * - All API endpoints under /api/v1/profile/*
 * - No userId parameter in any function (backend extracts from token)
 * - Use Ant Design 5 components
 * - Mock delay 300-800ms
 */

import { useModel } from '@umijs/max';
import type { ProfileVO, PendingCountVO } from '@/services/profile/typings';

/**
 * Convenience hook to access the profile model.
 * Wraps useModel('profile') with proper typing.
 */
export function useProfile() {
  const model = useModel('profile') as {
    profile: ProfileVO | null;
    pendingCount: PendingCountVO | null;
    loading: boolean;
    fetchProfile: () => Promise<void>;
    fetchPendingCount: () => Promise<void>;
    setProfile: (profile: ProfileVO | null) => void;
  };
  return model;
}

export default useProfile;

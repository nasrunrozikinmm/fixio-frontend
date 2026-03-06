'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

/**
 * Hook untuk akses auth state + role helpers.
 */
export function useAuth() {
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const isAdmin = user?.role === 'administrator';
  const isModerator = user?.role === 'moderator' || isAdmin;
  const isCreator = isAuthenticated;

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isModerator,
    isCreator,
  };
}

'use client';

import { useGetMeQuery } from '@/store/api/authApi';

/**
 * AuthProvider — bootstrap auth state saat app init.
 * Triggers GET /api/auth/me dan otomatis update authSlice via extraReducers.
 */
export default function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useGetMeQuery();
  return <>{children}</>;
}

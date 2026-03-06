'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import { useEffect, type ReactNode } from 'react';
import { Box, Skeleton } from '@mui/material';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard — wrapper yang cek auth state.
 * Jika belum login → buka Login Modal (bukan redirect).
 * Jika loading → tampilkan skeleton.
 */
export default function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const { isAuthenticated, loading } = useAuth();
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openLoginModal();
    }
  }, [loading, isAuthenticated, openLoginModal]);

  // Skeleton loading gate — mencegah flash konten restricted
  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  // Belum login — tampilkan placeholder (modal sudah terbuka via useEffect)
  if (!isAuthenticated) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center', color: 'text.secondary' }}>
        Silakan login untuk mengakses halaman ini.
      </Box>
    );
  }

  return <>{children}</>;
}

'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

interface PostCardSkeletonProps {
  /**
   * Variant matching PostCard:
   * - "feed": dengan preview kritik skeleton (4 baris total).
   * - "compact": tanpa preview (2 baris utama).
   */
  variant?: 'feed' | 'compact';
}

/**
 * PostCardSkeleton — Loading placeholder yang mirrors PostCard layout.
 *
 * Reusable: Home feed, Explore results, Profile post list, Moderation queue.
 * Sesuai requirement: "Gunakan MUI Skeleton (bukan spinner)".
 */
export default function PostCardSkeleton({ variant = 'feed' }: Readonly<PostCardSkeletonProps>) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Badges skeleton */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 0.5 }} />
          <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 0.5 }} />
        </Stack>

        {/* Title skeleton — 2 baris */}
        <Skeleton variant="text" width="90%" height={22} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={22} sx={{ mb: variant === 'feed' ? 1 : 1.5 }} />

        {/* Preview kritik skeleton (hanya feed) */}
        {variant === 'feed' && (
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="75%" height={18} />
          </Box>
        )}

        {/* Meta row skeleton */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rounded" width={40} height={18} sx={{ borderRadius: 0.5 }} />
          <Skeleton variant="rounded" width={32} height={18} sx={{ borderRadius: 0.5 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={80} height={16} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

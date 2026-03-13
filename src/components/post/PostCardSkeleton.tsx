'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

interface PostCardSkeletonProps {
  variant?: 'feed' | 'compact';
}

/**
 * PostCardSkeleton — Quora-style loading placeholder matching PostCard layout.
 */
export default function PostCardSkeleton({ variant = 'feed' }: Readonly<PostCardSkeletonProps>) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        {/* Author row */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box>
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="text" width={80} height={12} />
          </Box>
        </Stack>

        {/* Badges */}
        <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
          <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 10 }} />
          <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: 10 }} />
        </Stack>

        {/* Title */}
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="55%" height={20} sx={{ mb: variant === 'feed' ? 0.75 : 1 }} />

        {/* Preview (feed only) */}
        {variant === 'feed' && (
          <Box sx={{ mb: 1.5 }}>
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="85%" height={16} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        )}

        {/* Action bar */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: 10 }} />
          <Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: 10 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="circular" width={20} height={20} />
        </Stack>
      </CardContent>
    </Card>
  );
}

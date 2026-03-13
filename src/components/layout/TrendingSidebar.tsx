'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { useGetPostsQuery } from '@/store/api/postApi';
import { useGetTrendingSectorsQuery } from '@/store/api/sectorApi';
import type { User } from '@/types';

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * TrendingSidebar — Trending posts + top contributors.
 *
 * Extracted from home/RightSidebar for reuse across all pages.
 * If `children` is provided, they are rendered between Trending and Top Kontributor.
 */
export default function TrendingSidebar({ children }: Readonly<{ children?: React.ReactNode }>) {
  const { data: topPostsData, isLoading } = useGetPostsQuery({
    sort: 'vote_count desc',
    status: 'approved',
    limit: 50,
  });

  const { data: trendingSectors, isLoading: sectorsLoading } = useGetTrendingSectorsQuery({
    days: 7,
    limit: 5,
  });

  const trendingPosts = useMemo(() => {
    if (!topPostsData?.data) return [];
    return topPostsData.data.slice(0, 5);
  }, [topPostsData]);

  const topContributors = useMemo(() => {
    if (!topPostsData?.data) return [];
    const userMap = new Map<string, { user: User; postCount: number; totalVotes: number }>();

    for (const post of topPostsData.data) {
      if (!post.user) continue;
      const existing = userMap.get(post.user.id);
      if (existing) {
        existing.postCount += 1;
        existing.totalVotes += post.vote_count;
      } else {
        userMap.set(post.user.id, {
          user: post.user,
          postCount: 1,
          totalVotes: post.vote_count,
        });
      }
    }

    return Array.from(userMap.values())
      .sort((a, b) => b.totalVotes - a.totalVotes || b.postCount - a.postCount)
      .slice(0, 5);
  }, [topPostsData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ── Trending Posts ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
          <TrendingUpIcon sx={{ fontSize: 18, color: 'info.main' }} />
          <Typography variant="body2" fontWeight={600}>
            Trending
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`trend-sk-${i.toString()}`} variant="text" height={16} />
            ))}
          </Stack>
        ) : trendingPosts.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Belum ada post trending.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {trendingPosts.map((post) => (
              <Box
                key={post.id}
                component={Link}
                href={`/post/${post.id}`}
                sx={{
                  textDecoration: 'none',
                  color: 'text.primary',
                  borderRadius: 0.5,
                  py: 0.25,
                  '&:hover': { color: 'info.main' },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '0.75rem',
                  }}
                >
                  {post.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {post.vote_count} vote · {post.comment_count} komentar
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* ── Injected children (e.g. SidebarAd) ── */}
      {children}

      {/* ── Trending Sectors ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
          <WhatshotIcon sx={{ fontSize: 18, color: 'error.main' }} />
          <Typography variant="body2" fontWeight={600}>
            Sektor Populer
          </Typography>
        </Stack>

        {sectorsLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`sector-sk-${i.toString()}`} variant="rounded" width="60%" height={24} />
            ))}
          </Stack>
        ) : !trendingSectors || trendingSectors.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Belum ada data sektor.
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
            {trendingSectors.map((sector) => (
              <Chip
                key={sector.id}
                component={Link}
                href={`/explore?sector=${sector.slug}`}
                label={`${sector.name} (${sector.post_count ?? 0})`}
                size="small"
                clickable
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* ── Top Kontributor ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
          <EmojiEventsIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography variant="body2" fontWeight={600}>
            Top Kontributor
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack key={`contrib-sk-${i.toString()}`} direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={28} height={28} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={14} />
                  <Skeleton variant="text" width="40%" height={12} />
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : topContributors.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Belum ada kontributor.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {topContributors.map(({ user, postCount, totalVotes }) => (
              <Stack
                key={user.id}
                component={Link}
                href={`/user/${user.id}`}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 0.5,
                  px: 0.25,
                  py: 0.25,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Avatar
                  src={user.avatar_url}
                  alt={user.name}
                  sx={{ width: 28, height: 28, fontSize: '0.65rem' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={600} noWrap sx={{ fontSize: '0.75rem' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                    {postCount} post · {totalVotes} vote
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

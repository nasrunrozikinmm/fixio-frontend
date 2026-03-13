'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useGetPostsQuery } from '@/store/api/postApi';
import type { User } from '@/types';

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * RightSidebar — Quora-style right sidebar with trending topics & top contributors.
 *
 * Displays:
 * - Trending posts (by vote count, last 50)
 * - Top contributors derived from popular posts
 * - Footer links
 */
export default function RightSidebar() {
  const { data: topPostsData, isLoading } = useGetPostsQuery({
    sort: 'vote_count desc',
    status: 'approved',
    limit: 50,
  });

  // Derive trending — top 5 posts by votes
  const trendingPosts = useMemo(() => {
    if (!topPostsData?.data) return [];
    return topPostsData.data.slice(0, 5);
  }, [topPostsData]);

  // Derive top 5 contributors
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
    <Box
      sx={{
        position: 'sticky',
        top: 60,
        maxHeight: 'calc(100vh - 68px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 0 },
      }}
    >
      {/* ── Trending Posts ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
          mb: 2,
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

      <Divider sx={{ my: 1 }} />

      {/* ── Top Kontributor ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
          mt: 1,
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

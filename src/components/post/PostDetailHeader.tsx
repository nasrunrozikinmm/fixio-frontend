'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { SectorBadge, RegionBadge, StatusBadge } from '@/components/post';
import { formatLocalDate } from '@/lib/formatDate';
import type { Post } from '@/types';

interface PostDetailHeaderProps {
  post: Post;
}

/**
 * PostDetailHeader — Badge sektor/wilayah, judul H1, meta (author + tanggal + status).
 *
 * Sesuai brief-pixel spec detail post:
 * - [Badge Sektor] [Badge Wilayah]
 * - Judul Post (H1)
 * - 👤 Username · 2 Maret 2026 · [Status]
 */
export default function PostDetailHeader({ post }: Readonly<PostDetailHeaderProps>) {
  return (
    <Box>
      {/* ── Badges ── */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {post.sector && <SectorBadge sector={post.sector} size="medium" />}
        {post.region && <RegionBadge region={post.region} size="medium" />}
      </Stack>

      {/* ── Title ── */}
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          lineHeight: 1.3,
          mb: 2,
          color: 'text.primary',
        }}
      >
        {post.title}
      </Typography>

      {/* ── Author meta ── */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        {post.user && (
          <>
            <Avatar
              src={post.user.avatar_url}
              alt={post.user.name}
              sx={{ width: 28, height: 28, fontSize: '0.75rem' }}
            >
              {post.user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={600}>
              {post.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ·
            </Typography>
          </>
        )}
        <Typography variant="body2" color="text.secondary">
          {formatLocalDate(post.created_at)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ·
        </Typography>
        <StatusBadge status={post.status} />
      </Stack>
    </Box>
  );
}

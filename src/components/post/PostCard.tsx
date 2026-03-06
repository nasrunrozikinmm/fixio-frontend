'use client';

import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { Post } from '@/types';
import { formatRelativeDate } from '@/lib/formatDate';
import StatusBadge from './StatusBadge';
import SectorBadge from './SectorBadge';
import RegionBadge from './RegionBadge';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostCardProps {
  /** Data post — harus ada relasi user, sector, region di-populate */
  post: Post;
  /**
   * Jika true, StatusBadge ditampilkan.
   * Gunakan true hanya di profil sendiri (creator melihat post-nya).
   */
  showStatus?: boolean;
  /**
   * Variant layout:
   * - "feed" (default): card penuh dengan preview kritik — untuk Home / Explore.
   * - "compact": tanpa preview kritik — untuk Profile PostListItem / Moderation.
   */
  variant?: 'feed' | 'compact';
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostCard — Kartu post reusable.
 *
 * Dipakai di:
 * - Home feed (variant="feed")
 * - Explore results (variant="feed")
 * - User profile PostListItem (variant="compact", showStatus=true)
 * - Moderation queue (variant="compact")
 *
 * Sesuai brief-shaper spec:
 * - Badge sektor (warna) + wilayah (outline) + status (conditional)
 * - Judul bold 18px, max 2 baris ellipsis
 * - Preview kritik 2 baris, warna secondary, truncated
 * - Meta row: vote count, comment count, author, waktu relatif
 * - Hover: shadow elevation naik
 */
export default function PostCard({
  post,
  showStatus = false,
  variant = 'feed',
}: Readonly<PostCardProps>) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <Card
      sx={{
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardActionArea onClick={handleClick} component="article">
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          {/* ── Row 1: Badges ── */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 1.5 }}
          >
            {post.sector && <SectorBadge sector={post.sector} />}
            {post.region && <RegionBadge region={post.region} />}

            {/* Spacer */}
            {showStatus && <Box sx={{ flexGrow: 1 }} />}

            {/* Status badge — hanya tampil jika showStatus=true */}
            {showStatus && <StatusBadge status={post.status} />}
          </Stack>

          {/* ── Row 2: Title ── */}
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: variant === 'feed' ? 1 : 1.5,
            }}
          >
            {post.title}
          </Typography>

          {/* ── Row 3: Preview kritik (hanya variant "feed") ── */}
          {variant === 'feed' && post.criticism && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 2,
              }}
            >
              {post.criticism}
            </Typography>
          )}

          {/* ── Row 4: Meta ── */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ color: 'text.secondary' }}
          >
            {/* Vote count */}
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <ArrowDropUpIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600}>
                {post.vote_count}
              </Typography>
            </Stack>

            {/* Comment count */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600}>
                {post.comment_count ?? 0}
              </Typography>
            </Stack>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Author info */}
            {post.user && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Avatar
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  sx={{ width: 24, height: 24, fontSize: '0.7rem' }}
                >
                  {post.user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" noWrap sx={{ maxWidth: { xs: 80, sm: 120 } }}>
                  {post.user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ·
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: { xs: 80, sm: 120 } }}>
                  {formatRelativeDate(post.created_at)}
                </Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { SectorBadge, StatusBadge } from '@/components/post';
import { stripHtml } from '@/components/editor';
import { formatLocalDate } from '@/lib/formatDate';
import type { Post } from '@/types';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostListItemProps {
  post: Post;
  /** Whether to show status-specific UI (reject reason, pending info) */
  showStatus?: boolean;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostListItem — Compact post item for profile page.
 *
 * Spec (brief-pixel):
 * - [Badge Sektor] [Status Badge]
 * - Judul Post (clickable)
 * - Preview kritik singkat
 * - △ 124 · 💬 18 · 2 Maret 2026
 * - Pemisah: border-bottom 1px (bukan card shadow)
 * - Rejected: background #FFF5F5, alasan reject + "Edit & Submit Ulang"
 * - Pending: "Menunggu review moderator"
 */
export default function PostListItem({
  post,
  showStatus = false,
}: Readonly<PostListItemProps>) {
  const router = useRouter();

  const isRejected = post.status === 'rejected';
  const isPending = post.status === 'pending_review';

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        bgcolor: isRejected ? 'error.light' : 'transparent',
        py: 2,
        px: { xs: 0, sm: 1 },
      }}
    >
      <ButtonBase
        onClick={() => router.push(`/post/${post.id}`)}
        sx={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
          p: 0.5,
        }}
      >
        {/* Badges */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
          {post.sector && <SectorBadge sector={post.sector} />}
          {showStatus && <StatusBadge status={post.status} />}
        </Stack>

        {/* Title row with optional thumbnail */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {post.title}
            </Typography>

            {/* Preview kritik */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
              }}
            >
              {stripHtml(post.criticism)}
            </Typography>
          </Box>

          {/* Thumbnail */}
          {post.images?.length > 0 && (
            <Box
              sx={{
                flexShrink: 0,
                width: 56,
                height: 56,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={post.images[0]}
                alt=""
                loading="lazy"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          )}
        </Stack>

        {/* Meta row */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary' }}>
          {post.status === 'approved' && (
            <>
              <Stack direction="row" spacing={0.25} alignItems="center">
                <ArrowDropUpIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" fontWeight={600}>
                  {post.vote_count}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />
                <Typography variant="caption" fontWeight={600}>
                  {post.comment_count ?? 0}
                </Typography>
              </Stack>
            </>
          )}
          <Typography variant="caption">
            {formatLocalDate(post.created_at)}
          </Typography>
        </Stack>
      </ButtonBase>

      {/* Pending info */}
      {isPending && showStatus && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 0.75, display: 'block', pl: 0.5 }}>
          Menunggu review moderator
        </Typography>
      )}

      {/* Rejected info + CTA */}
      {isRejected && showStatus && (
        <Box sx={{ mt: 1, pl: 0.5 }}>
          {post.review_note && (
            <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 0.75 }}>
              Alasan: {post.review_note}
            </Typography>
          )}
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<EditIcon sx={{ fontSize: 14 }} />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/post/${post.id}/edit`);
            }}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            Edit &amp; Submit Ulang
          </Button>
        </Box>
      )}
    </Box>
  );
}

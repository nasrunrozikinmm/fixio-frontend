'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { Post } from '@/types';
import { formatLocalDate } from '@/lib/formatDate';

interface ReviewItemProps {
  post: Post;
  onApprove: (post: Post) => void;
  onReject: (post: Post) => void;
  loading?: boolean;
}

/**
 * ReviewItem — Card tunggal untuk satu post di moderation queue.
 * Tampilkan judul, sektor/wilayah, tanggal, + tombol approve/reject.
 */
export default function ReviewItem({
  post,
  onApprove,
  onReject,
  loading = false,
}: ReviewItemProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        borderRadius: 2,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          {/* Left: post info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {post.title}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              {post.sector && (
                <Chip
                  label={post.sector.name}
                  size="small"
                  sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 500, fontSize: '0.75rem' }}
                />
              )}
              {post.region && (
                <Chip
                  label={post.region.name}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              oleh {post.user?.name ?? 'Unknown'} · {formatLocalDate(post.created_at)}
            </Typography>

            {/* Brief criticism preview */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.criticism}
            </Typography>
          </Box>

          {/* Right: actions */}
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Tooltip title="Lihat detail">
              <IconButton
                size="small"
                href={`/post/${post.id}`}
                target="_blank"
                sx={{ color: 'text.secondary' }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Approve">
              <IconButton
                size="small"
                color="success"
                onClick={() => onApprove(post)}
                disabled={loading}
              >
                <CheckCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton
                size="small"
                color="error"
                onClick={() => onReject(post)}
                disabled={loading}
              >
                <CancelOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ───────────────────────────────────────────────

export function ReviewItemSkeleton() {
  return (
    <Card variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Stack>
            <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="90%" height={16} sx={{ mt: 1 }} />
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

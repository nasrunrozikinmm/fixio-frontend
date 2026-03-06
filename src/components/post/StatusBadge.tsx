'use client';

import Chip from '@mui/material/Chip';
import type { PostStatus } from '@/types';

/**
 * Mapping status → label & color untuk Badge.
 * Reusable: PostCard, PostListItem, DetailPost, Profile tab, Moderation history.
 */
const STATUS_CONFIG: Record<PostStatus, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
  draft: { label: 'Draft', color: 'default' },
  pending_review: { label: 'Menunggu Review', color: 'warning' },
  approved: { label: 'Disetujui', color: 'success' },
  rejected: { label: 'Ditolak', color: 'error' },
};

interface StatusBadgeProps {
  /** Status post */
  status: PostStatus;
  /** Ukuran chip — default "small" */
  size?: 'small' | 'medium';
}

/**
 * StatusBadge — Chip warna sesuai status post.
 *
 * Konteks pemakaian:
 * - PostCard: hanya terlihat oleh creator di post miliknya (caller yang kontrol visibility).
 * - Profile page: di PostListItem tab pending/rejected.
 * - Moderation history table.
 */
export default function StatusBadge({ status, size = 'small' }: Readonly<StatusBadgeProps>) {
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="filled"
      sx={{
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    />
  );
}

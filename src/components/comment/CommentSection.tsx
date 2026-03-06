'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import { useGetCommentsQuery } from '@/store/api/commentApi';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { useState, useCallback } from 'react';

// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

function CommentSkeleton() {
  return (
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ borderLeft: '2px solid', borderLeftColor: 'divider', pl: 2, py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={120} height={18} />
          </Stack>
          <Skeleton variant="text" width="90%" height={18} />
          <Skeleton variant="text" width="60%" height={18} />
        </Box>
      ))}
    </Stack>
  );
}

// ────────────────────────────────────────────
// Comment list (extracted to avoid nested ternary — SonarQube)
// ────────────────────────────────────────────

interface CommentListProps {
  postId: string;
  page: number;
}

function CommentList({ postId, page }: Readonly<CommentListProps>) {
  const { data, isLoading, isError, error } = useGetCommentsQuery({
    postId,
    page,
    limit: 20,
  });

  if (isLoading) return <CommentSkeleton />;

  if (isError) {
    const msg =
      error && 'data' in error
        ? (error.data as { message?: string })?.message ?? 'Gagal memuat komentar.'
        : 'Gagal memuat komentar.';
    return <Alert severity="error">{msg}</Alert>;
  }

  if (!data || data.data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        Belum ada komentar. Jadilah yang pertama berkomentar!
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {data.data.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </Stack>
  );
}

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface CommentSectionProps {
  postId: string;
  commentCount: number;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * CommentSection — Diskusi section: heading, form, paginated comment list.
 *
 * Spec (brief-pixel):
 * - "── Diskusi (18 komentar) ──"
 * - Comment Form (auth required)
 * - Comment Items with 1-level nesting
 * - Pagination for large comment threads
 */
export default function CommentSection({
  postId,
  commentCount,
}: Readonly<CommentSectionProps>) {
  const [page, setPage] = useState(1);

  const { data } = useGetCommentsQuery({ postId, page, limit: 20 });

  const totalPages = data?.pagination.total_pages ?? 1;

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    },
    [],
  );

  return (
    <Box>
      {/* ── Section heading ── */}
      <Typography variant="h2" sx={{ mb: 2.5 }}>
        Diskusi ({commentCount} komentar)
      </Typography>

      {/* ── Comment form (top-level) ── */}
      <Box sx={{ mb: 3 }}>
        <CommentForm postId={postId} />
      </Box>

      {/* ── Comment list ── */}
      <CommentList postId={postId} page={page} />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}

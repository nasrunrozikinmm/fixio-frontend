'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Pagination,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ReviewItem, { ReviewItemSkeleton } from './ReviewItem';
import RejectDialog from './RejectDialog';
import {
  useGetModerationQueueQuery,
  useApprovePostMutation,
  useRejectPostMutation,
} from '@/store/api/moderationApi';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import type { Post } from '@/types';

/**
 * ModerationQueue — Halaman antrian moderasi.
 * List ReviewItem + filter sektor + approve/reject inline.
 */
export default function ModerationQueue() {
  const [page, setPage] = useState(1);
  const [sectorFilter, setSectorFilter] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<Post | null>(null);

  // API hooks
  const { data, isLoading, isFetching } = useGetModerationQueueQuery({ page, limit: 20 });
  const { data: sectors } = useGetSectorsQuery();
  const [approvePost, { isLoading: approving }] = useApprovePostMutation();
  const [rejectPost, { isLoading: rejecting }] = useRejectPostMutation();

  const posts = data?.data ?? [];
  const pagination = data?.pagination;

  // Filter by sector (client-side since backend queue doesn't support filter param)
  const filteredPosts = sectorFilter
    ? posts.filter((p) => p.sector_id === sectorFilter)
    : posts;

  const handleApprove = useCallback(
    async (post: Post) => {
      try {
        await approvePost({ id: post.id }).unwrap();
        setSnackbar({
          open: true,
          message: `"${post.title}" berhasil diapprove`,
          severity: 'success',
        });
      } catch {
        setSnackbar({
          open: true,
          message: 'Gagal approve post. Silakan coba lagi.',
          severity: 'error',
        });
      }
    },
    [approvePost],
  );

  const handleRejectConfirm = useCallback(
    async (reviewNote: string) => {
      if (!rejectTarget) return;
      try {
        await rejectPost({ id: rejectTarget.id, review_note: reviewNote }).unwrap();
        setSnackbar({
          open: true,
          message: `"${rejectTarget.title}" berhasil ditolak`,
          severity: 'success',
        });
        setRejectTarget(null);
      } catch {
        setSnackbar({
          open: true,
          message: 'Gagal menolak post. Silakan coba lagi.',
          severity: 'error',
        });
      }
    },
    [rejectPost, rejectTarget],
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <ReviewItemSkeleton key={i} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header + filter */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Antrian Review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pagination?.total ?? 0} post menunggu review
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter Sektor</InputLabel>
          <Select
            value={sectorFilter}
            label="Filter Sektor"
            onChange={(e) => {
              setSectorFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Semua Sektor</MenuItem>
            {sectors?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Active filter chip */}
      {sectorFilter && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Sektor: ${sectors?.find((s) => s.id === sectorFilter)?.name}`}
            onDelete={() => setSectorFilter('')}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      {/* Empty state */}
      {filteredPosts.length === 0 && !isFetching && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {sectorFilter
            ? 'Tidak ada post menunggu review di sektor ini.'
            : 'Semua post sudah direview. 🎉'}
        </Alert>
      )}

      {/* Queue list */}
      {filteredPosts.map((post) => (
        <ReviewItem
          key={post.id}
          post={post}
          onApprove={handleApprove}
          onReject={(p) => setRejectTarget(p)}
          loading={approving || rejecting}
        />
      ))}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Stack alignItems="center" sx={{ mt: 3 }}>
          <Pagination
            count={pagination.total_pages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Stack>
      )}

      {/* Reject dialog */}
      <RejectDialog
        open={!!rejectTarget}
        postTitle={rejectTarget?.title ?? ''}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        loading={rejecting}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

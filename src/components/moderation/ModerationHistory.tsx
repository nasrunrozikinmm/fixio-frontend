'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Pagination,
  Stack,
  Skeleton,
  Alert,
} from '@mui/material';
import { useGetModerationHistoryQuery } from '@/store/api/moderationApi';
import { formatLocalDate } from '@/lib/formatDate';

const STATUS_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  pending_review: { label: 'Pending', color: 'warning' },
  draft: { label: 'Draft', color: 'default' },
};

/**
 * ModerationHistory — Table riwayat moderasi (approved + rejected posts).
 */
export default function ModerationHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetModerationHistoryQuery({ page, limit: 20 });

  const posts = data?.data ?? [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Judul', 'Sektor', 'Status', 'Reviewer Note', 'Tanggal'].map((h) => (
                  <TableCell key={h}>
                    <Skeleton width={80} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Riwayat Moderasi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {pagination?.total ?? 0} post sudah direview
      </Typography>

      {posts.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Belum ada riwayat moderasi.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, overflowX: 'auto' }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sektor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Catatan Review</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tanggal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => {
                const config = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.draft;
                return (
                  <TableRow
                    key={post.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => window.open(`/post/${post.id}`, '_blank')}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {post.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.sector?.name ?? '-'}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={config.label}
                        color={config.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {post.review_note || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatLocalDate(post.updated_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
    </Box>
  );
}

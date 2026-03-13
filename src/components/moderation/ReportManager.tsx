'use client';

import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { useGetReportsQuery, useReviewReportMutation } from '@/store/api/reportApi';
import { formatLocalDate } from '@/lib/formatDate';
import type { Report, ReportStatus } from '@/types';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const STATUS_COLORS: Record<ReportStatus, 'warning' | 'success' | 'default'> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'default',
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  dismissed: 'Dismissed',
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Pelecehan',
  misinformation: 'Misinformasi',
  hate_speech: 'Ujaran Kebencian',
  other: 'Lainnya',
};

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ReportManager — DataGrid-based panel for moderators/admins to manage reports.
 * Features: tab filter (All/Pending/Reviewed/Dismissed), review dialog.
 */
export default function ReportManager() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [reviewTarget, setReviewTarget] = useState<Report | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'reviewed' | 'dismissed'>('reviewed');
  const [reviewNote, setReviewNote] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useGetReportsQuery({
    status: statusFilter || undefined,
    page: page + 1,
    limit: 20,
  });
  const [reviewReport, { isLoading: isReviewing }] = useReviewReportMutation();

  const reports = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Handlers (defined before columns so useMemo deps resolve) ──
  const handleOpenReview = useCallback((report: Report) => {
    setReviewTarget(report);
    setReviewStatus('reviewed');
    setReviewNote('');
  }, []);

  // ── Columns ──
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'reporter',
        headerName: 'Pelapor',
        flex: 1,
        minWidth: 130,
        renderCell: (params: GridRenderCellParams<Report>) => (
          <Typography variant="body2" noWrap>
            {params.row.reporter?.name ?? 'Unknown'}
          </Typography>
        ),
      },
      {
        field: 'target_type',
        headerName: 'Tipe',
        width: 90,
        renderCell: (params: GridRenderCellParams<Report>) => (
          <Chip
            label={params.row.target_type === 'post' ? 'Post' : 'Komentar'}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'reason',
        headerName: 'Alasan',
        width: 140,
        renderCell: (params: GridRenderCellParams<Report>) => (
          <Typography variant="body2" noWrap>
            {REASON_LABELS[params.row.reason] ?? params.row.reason}
          </Typography>
        ),
      },
      {
        field: 'description',
        headerName: 'Deskripsi',
        flex: 1.5,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<Report>) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {params.row.description || '—'}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 110,
        renderCell: (params: GridRenderCellParams<Report>) => (
          <Chip
            label={STATUS_LABELS[params.row.status] ?? params.row.status}
            size="small"
            color={STATUS_COLORS[params.row.status] ?? 'default'}
          />
        ),
      },
      {
        field: 'created_at',
        headerName: 'Tanggal',
        width: 140,
        renderCell: (params: GridRenderCellParams<Report>) => (
          <Typography variant="caption" color="text.secondary">
            {formatLocalDate(params.row.created_at)}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Report>) =>
          params.row.status === 'pending' ? (
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpenReview(params.row)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Review
            </Button>
          ) : null,
      },
    ],
    [handleOpenReview],
  );

  // ── Handlers ──
  const handleTabChange = useCallback((_: React.SyntheticEvent, value: string) => {
    setStatusFilter(value);
    setPage(0);
  }, []);

  const handleCloseReview = useCallback(() => {
    if (!isReviewing) setReviewTarget(null);
  }, [isReviewing]);

  const handleSubmitReview = useCallback(async () => {
    if (!reviewTarget) return;
    try {
      await reviewReport({
        reportId: reviewTarget.id,
        status: reviewStatus,
        review_note: reviewNote.trim() || undefined,
      }).unwrap();
      setReviewTarget(null);
      setSnackbar({ open: true, severity: 'success', message: 'Laporan berhasil di-review.' });
    } catch {
      setSnackbar({ open: true, severity: 'error', message: 'Gagal me-review laporan.' });
    }
  }, [reviewTarget, reviewStatus, reviewNote, reviewReport]);

  // ── Loading state ──
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Laporan Konten
      </Typography>

      {/* Filter Tabs */}
      <Tabs
        value={statusFilter}
        onChange={handleTabChange}
        sx={{ mb: 2, minHeight: 36 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Pending" value="pending" sx={{ textTransform: 'none', minHeight: 36, py: 0 }} />
        <Tab label="Semua" value="" sx={{ textTransform: 'none', minHeight: 36, py: 0 }} />
        <Tab label="Reviewed" value="reviewed" sx={{ textTransform: 'none', minHeight: 36, py: 0 }} />
        <Tab label="Dismissed" value="dismissed" sx={{ textTransform: 'none', minHeight: 36, py: 0 }} />
      </Tabs>

      {/* DataGrid */}
      <DataGrid
        rows={reports}
        columns={columns}
        rowCount={pagination?.total ?? 0}
        paginationMode="server"
        paginationModel={{ page, pageSize: 20 }}
        onPaginationModelChange={(model) => setPage(model.page)}
        pageSizeOptions={[20]}
        disableRowSelectionOnClick
        autoHeight
        getRowId={(row) => row.id}
        sx={{
          border: 0,
          '& .MuiDataGrid-cell': { py: 1 },
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
        }}
        slots={{
          noRowsOverlay: () => (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', py: 4 }}>
              <Typography color="text.secondary">Tidak ada laporan.</Typography>
            </Stack>
          ),
        }}
      />

      {/* Review Dialog */}
      <Dialog open={Boolean(reviewTarget)} onClose={handleCloseReview} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Review Laporan</DialogTitle>
        <DialogContent>
          {reviewTarget && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Pelapor
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {reviewTarget.reporter?.name ?? 'Unknown'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Alasan
                </Typography>
                <Typography variant="body2">
                  {REASON_LABELS[reviewTarget.reason] ?? reviewTarget.reason}
                </Typography>
              </Box>
              {reviewTarget.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Deskripsi
                  </Typography>
                  <Typography variant="body2">{reviewTarget.description}</Typography>
                </Box>
              )}
              <FormControl fullWidth size="small">
                <InputLabel>Keputusan</InputLabel>
                <Select
                  value={reviewStatus}
                  label="Keputusan"
                  onChange={(e) => setReviewStatus(e.target.value as 'reviewed' | 'dismissed')}
                >
                  <MenuItem value="reviewed">Ditindaklanjuti</MenuItem>
                  <MenuItem value="dismissed">Ditolak</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Catatan review (opsional)"
                multiline
                rows={2}
                fullWidth
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseReview} disabled={isReviewing}>
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={isReviewing}
            sx={{ textTransform: 'none' }}
          >
            {isReviewing ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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

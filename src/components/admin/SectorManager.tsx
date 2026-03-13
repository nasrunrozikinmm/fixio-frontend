'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  useGetSectorsQuery,
  useCreateSectorMutation,
  useUpdateSectorMutation,
  useDeleteSectorMutation,
} from '@/store/api/sectorApi';
import type { Sector } from '@/types';

/**
 * SectorManager — CRUD sektor via DataGrid + modal + confirm delete.
 */
export default function SectorManager() {
  // Form dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSector, setEditSector] = useState<Sector | null>(null);
  const [sectorName, setSectorName] = useState('');
  const [formError, setFormError] = useState('');

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Sector | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // API hooks
  const { data: sectors, isLoading } = useGetSectorsQuery();
  const [createSector, { isLoading: creating }] = useCreateSectorMutation();
  const [updateSector, { isLoading: updating }] = useUpdateSectorMutation();
  const [deleteSector, { isLoading: deleting }] = useDeleteSectorMutation();

  const isMutating = creating || updating || deleting;

  // Rows with index
  const rows = useMemo(
    () => (sectors ?? []).map((s, idx) => ({ ...s, rowNo: idx + 1 })),
    [sectors],
  );

  const openCreate = () => {
    setEditSector(null);
    setSectorName('');
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (sector: Sector) => {
    setEditSector(sector);
    setSectorName(sector.name);
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = useCallback(async () => {
    const name = sectorName.trim();
    if (!name) {
      setFormError('Nama sektor wajib diisi');
      return;
    }

    try {
      if (editSector) {
        await updateSector({ id: editSector.id, name }).unwrap();
        setSnackbar({ open: true, message: 'Sektor berhasil diupdate', severity: 'success' });
      } else {
        await createSector({ name }).unwrap();
        setSnackbar({ open: true, message: 'Sektor berhasil dibuat', severity: 'success' });
      }
      setDialogOpen(false);
    } catch {
      setSnackbar({ open: true, message: 'Operasi gagal. Silakan coba lagi.', severity: 'error' });
    }
  }, [sectorName, editSector, createSector, updateSector]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteSector(deleteTarget.id).unwrap();
      setSnackbar({ open: true, message: 'Sektor berhasil dihapus', severity: 'success' });
      setDeleteTarget(null);
    } catch {
      setSnackbar({ open: true, message: 'Gagal menghapus sektor.', severity: 'error' });
    }
  }, [deleteTarget, deleteSector]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'rowNo',
        headerName: 'No',
        width: 60,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
      },
      {
        field: 'name',
        headerName: 'Nama',
        flex: 1,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2" fontWeight={500} sx={{ lineHeight: '52px' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'slug',
        headerName: 'Slug',
        flex: 1,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams) => (
          <Chip label={params.value} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
        ),
      },
      {
        field: 'actions',
        headerName: 'Aksi',
        width: 100,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
          <>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(params.row as Sector)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hapus">
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row as Sector)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Kelola Sektor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sectors?.length ?? 0} sektor terdaftar
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="small">
          Tambah Sektor
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        disableRowSelectionOnClick
        autoHeight
        rowHeight={52}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
          '& .MuiDataGrid-cell[data-field="rowNo"], & .MuiDataGrid-columnHeader[data-field="rowNo"]': {
            position: 'sticky',
            left: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
          },
          '& .MuiDataGrid-cell[data-field="actions"], & .MuiDataGrid-columnHeader[data-field="actions"]': {
            position: 'sticky',
            right: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
          },
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={isMutating ? undefined : () => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editSector ? 'Edit Sektor' : 'Tambah Sektor'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nama Sektor"
            fullWidth
            value={sectorName}
            onChange={(e) => {
              setSectorName(e.target.value);
              if (formError) setFormError('');
            }}
            error={!!formError}
            helperText={formError}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={isMutating} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isMutating || !sectorName.trim()}>
            {isMutating ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={deleting ? undefined : () => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Hapus Sektor?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Sektor <strong>{deleteTarget?.name}</strong> akan dihapus.
          </Typography>
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            Post terkait sektor ini tidak akan terhapus.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} color="inherit">
            Batal
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

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

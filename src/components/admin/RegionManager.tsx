'use client';

import { useState, useCallback } from 'react';
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
  IconButton,
  Tooltip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  useGetRegionsQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} from '@/store/api/regionApi';
import type { Region, RegionType } from '@/types';

const REGION_TYPES: { value: RegionType; label: string }[] = [
  { value: 'nasional', label: 'Nasional' },
  { value: 'provinsi', label: 'Provinsi' },
  { value: 'kota', label: 'Kota/Kabupaten' },
];

const TYPE_COLORS: Record<string, 'primary' | 'success' | 'secondary' | 'default'> = {
  nasional: 'primary',
  provinsi: 'success',
  kota: 'secondary',
};

/**
 * RegionManager — CRUD wilayah via modal + parent dropdown + confirm delete.
 */
export default function RegionManager() {
  // Form dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRegion, setEditRegion] = useState<Region | null>(null);
  const [regionName, setRegionName] = useState('');
  const [regionType, setRegionType] = useState<RegionType>('nasional');
  const [parentId, setParentId] = useState('');
  const [formError, setFormError] = useState('');

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Region | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // API hooks
  const { data: regions, isLoading } = useGetRegionsQuery();
  const [createRegion, { isLoading: creating }] = useCreateRegionMutation();
  const [updateRegion, { isLoading: updating }] = useUpdateRegionMutation();
  const [deleteRegion, { isLoading: deleting }] = useDeleteRegionMutation();

  const isMutating = creating || updating || deleting;

  // Compute parent options based on regionType
  const parentOptions = (regions ?? []).filter((r) => {
    if (regionType === 'provinsi') return r.type === 'nasional';
    if (regionType === 'kota') return r.type === 'provinsi';
    return false;
  });

  const openCreate = () => {
    setEditRegion(null);
    setRegionName('');
    setRegionType('nasional');
    setParentId('');
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (region: Region) => {
    setEditRegion(region);
    setRegionName(region.name);
    setRegionType(region.type);
    setParentId(region.parent_id ?? '');
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = useCallback(async () => {
    const name = regionName.trim();
    if (!name) {
      setFormError('Nama wilayah wajib diisi');
      return;
    }

    try {
      if (editRegion) {
        await updateRegion({ id: editRegion.id, name, type: regionType }).unwrap();
        setSnackbar({ open: true, message: 'Wilayah berhasil diupdate', severity: 'success' });
      } else {
        await createRegion({
          name,
          type: regionType,
          ...(parentId ? { parent_id: parentId } : {}),
        }).unwrap();
        setSnackbar({ open: true, message: 'Wilayah berhasil dibuat', severity: 'success' });
      }
      setDialogOpen(false);
    } catch {
      setSnackbar({ open: true, message: 'Operasi gagal. Silakan coba lagi.', severity: 'error' });
    }
  }, [regionName, regionType, parentId, editRegion, createRegion, updateRegion]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteRegion(deleteTarget.id).unwrap();
      setSnackbar({ open: true, message: 'Wilayah berhasil dihapus', severity: 'success' });
      setDeleteTarget(null);
    } catch {
      setSnackbar({ open: true, message: 'Gagal menghapus wilayah.', severity: 'error' });
    }
  }, [deleteTarget, deleteRegion]);

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Kelola Wilayah
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {regions?.length ?? 0} wilayah terdaftar
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          size="small"
        >
          Tambah Wilayah
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2, overflowX: 'auto' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Nama</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tipe</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {regions?.map((region) => {
              const parent = regions.find((r) => r.id === region.parent_id);
              return (
                <TableRow key={region.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {region.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={region.type}
                      color={TYPE_COLORS[region.type] ?? 'default'}
                      size="small"
                      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {parent?.name ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(region)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(region)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={isMutating ? undefined : () => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editRegion ? 'Edit Wilayah' : 'Tambah Wilayah'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nama Wilayah"
            fullWidth
            value={regionName}
            onChange={(e) => {
              setRegionName(e.target.value);
              if (formError) setFormError('');
            }}
            error={!!formError}
            helperText={formError}
            sx={{ mt: 1, mb: 2 }}
            autoFocus
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipe</InputLabel>
            <Select
              value={regionType}
              label="Tipe"
              onChange={(e) => {
                setRegionType(e.target.value as RegionType);
                setParentId('');
              }}
            >
              {REGION_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Parent dropdown — only shown for provinsi/kota */}
          {regionType !== 'nasional' && (
            <FormControl fullWidth>
              <InputLabel>
                Parent ({regionType === 'provinsi' ? 'Nasional' : 'Provinsi'})
              </InputLabel>
              <Select
                value={parentId}
                label={`Parent (${regionType === 'provinsi' ? 'Nasional' : 'Provinsi'})`}
                onChange={(e) => setParentId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Tidak ada</em>
                </MenuItem>
                {parentOptions.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={isMutating}
            color="inherit"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isMutating || !regionName.trim()}
          >
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
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Hapus Wilayah?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Wilayah <strong>{deleteTarget?.name}</strong> ({deleteTarget?.type}) akan dihapus.
          </Typography>
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            Post terkait wilayah ini tidak akan terhapus.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            color="inherit"
          >
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
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

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useGetAdminUsersQuery, useChangeUserRoleMutation } from '@/store/api/adminApi';
import ChangeRoleDialog from './ChangeRoleDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { formatLocalDate } from '@/lib/formatDate';
import type { User, UserRole } from '@/types';

const ROLE_COLORS: Record<string, 'primary' | 'success' | 'error' | 'default'> = {
  administrator: 'error',
  moderator: 'success',
  creator: 'default',
};

/**
 * UserTable — DataGrid manajemen user dengan search, filter role, dan role change dialog.
 */
export default function UserTable() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Dialog state
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // API hooks
  const { data, isLoading } = useGetAdminUsersQuery({ page: page + 1, limit: 20 });
  const [changeRole, { isLoading: changing }] = useChangeUserRoleMutation();

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  // Client-side filter (search + role)
  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          !debouncedSearch ||
          u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
      }),
    [users, debouncedSearch, roleFilter],
  );

  // Add row index for No column
  const rows = useMemo(
    () => filteredUsers.map((u, idx) => ({ ...u, rowNo: page * 20 + idx + 1 })),
    [filteredUsers, page],
  );

  const handleChangeRole = useCallback(
    async (userId: string, role: UserRole) => {
      try {
        await changeRole({ userId, role }).unwrap();
        setSnackbar({ open: true, message: 'Role berhasil diubah', severity: 'success' });
        setEditTarget(null);
      } catch {
        setSnackbar({ open: true, message: 'Gagal mengubah role. Silakan coba lagi.', severity: 'error' });
      }
    },
    [changeRole],
  );

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
        headerName: 'User',
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
            <Avatar src={params.row.avatar_url} alt={params.value} sx={{ width: 32, height: 32 }} />
            <Typography variant="body2" fontWeight={500}>
              {params.value}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: '52px' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'role',
        headerName: 'Role',
        width: 140,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value}
            color={ROLE_COLORS[params.value as string] ?? 'default'}
            size="small"
            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
          />
        ),
      },
      {
        field: 'created_at',
        headerName: 'Bergabung',
        width: 150,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: '52px' }}>
            {formatLocalDate(params.value)}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Aksi',
        width: 80,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip title="Ubah role">
            <IconButton size="small" onClick={() => setEditTarget(params.row as User)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Kelola User
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {pagination?.total ?? 0} user terdaftar
      </Typography>

      {/* Search + Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter Role</InputLabel>
          <Select
            value={roleFilter}
            label="Filter Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">Semua Role</MenuItem>
            <MenuItem value="creator">Creator</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="administrator">Administrator</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={pagination?.total ?? 0}
        paginationMode="server"
        paginationModel={{ page, pageSize: 20 }}
        onPaginationModelChange={(m) => setPage(m.page)}
        pageSizeOptions={[20]}
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

      {/* Change role dialog */}
      <ChangeRoleDialog
        open={!!editTarget}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onConfirm={handleChangeRole}
        loading={changing}
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

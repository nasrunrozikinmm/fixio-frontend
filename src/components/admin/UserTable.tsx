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
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Pagination,
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
 * UserTable — Table manajemen user dengan search, filter role, dan role change dialog.
 */
export default function UserTable() {
  const [page, setPage] = useState(1);
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
  const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 20 });
  const [changeRole, { isLoading: changing }] = useChangeUserRoleMutation();

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  // Client-side filter (search + role)
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !debouncedSearch ||
      u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleChangeRole = useCallback(
    async (userId: string, role: UserRole) => {
      try {
        await changeRole({ userId, role }).unwrap();
        setSnackbar({
          open: true,
          message: 'Role berhasil diubah',
          severity: 'success',
        });
        setEditTarget(null);
      } catch {
        setSnackbar({
          open: true,
          message: 'Gagal mengubah role. Silakan coba lagi.',
          severity: 'error',
        });
      }
    },
    [changeRole],
  );

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {['User', 'Email', 'Role', 'Bergabung', 'Aksi'].map((h) => (
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

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2, overflowX: 'auto' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bergabung</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      src={user.avatar_url}
                      alt={user.name}
                      sx={{ width: 36, height: 36 }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {user.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={ROLE_COLORS[user.role] ?? 'default'}
                    size="small"
                    sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatLocalDate(user.created_at)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ubah role">
                    <IconButton
                      size="small"
                      onClick={() => setEditTarget(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

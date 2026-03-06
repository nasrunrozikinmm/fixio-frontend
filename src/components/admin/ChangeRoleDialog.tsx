'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import type { User, UserRole } from '@/types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'creator', label: 'Creator' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'administrator', label: 'Administrator' },
];

interface ChangeRoleDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (userId: string, role: UserRole) => void;
  loading?: boolean;
}

/**
 * ChangeRoleDialog — Modal konfirmasi untuk mengubah role user.
 */
export default function ChangeRoleDialog({
  open,
  user,
  onClose,
  onConfirm,
  loading = false,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('creator');

  // Sync selectedRole when user changes
  const handleOpen = () => {
    if (user) setSelectedRole(user.role);
  };

  const handleConfirm = () => {
    if (user && selectedRole !== user.role) {
      onConfirm(user.id, selectedRole);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ onEnter: handleOpen }}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Ubah Role User</DialogTitle>

      <DialogContent>
        {user && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              User: <strong>{user.name}</strong> ({user.email})
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Role saat ini:{' '}
              <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong>
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role Baru</InputLabel>
              <Select
                value={selectedRole}
                label="Role Baru"
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedRole === user.role && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                Role tidak berubah.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Batal
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || !user || selectedRole === user?.role}
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { useDeletePostMutation } from '@/store/api/postApi';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import ReportDialog from '@/components/moderation/ReportDialog';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostMoreMenuProps {
  postId: string;
  postTitle: string;
  /** If true, shows owner actions (Edit/Delete). If false, shows "Laporkan". */
  isOwner?: boolean;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostMoreMenu — Kebab (MoreVert) menu for post owner actions.
 *
 * Shows Edit and Delete options. Only rendered when the current
 * user owns the post (ownership check is the parent's responsibility).
 */
export default function PostMoreMenu({ postId, postTitle, isOwner = false }: Readonly<PostMoreMenuProps>) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  // Menu state (React 19 compliant — state-based anchorEl)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Report dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Feedback snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleMenuClose = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
    router.push(`/post/${postId}/edit`);
  }, [router, postId]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
    setDeleteDialogOpen(true);
  }, []);

  const handleReportClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setReportDialogOpen(true);
  }, [isAuthenticated, openLoginModal]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deletePost(postId).unwrap();
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        severity: 'success',
        message: 'Post berhasil dihapus.',
      });
    } catch {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Gagal menghapus post. Coba lagi.',
      });
    }
  }, [deletePost, postId]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <>
      {/* Kebab button */}
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        aria-label="Opsi post"
        sx={{ color: 'text.secondary', p: 0.5 }}
      >
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => handleMenuClose()}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: { minWidth: 160, borderRadius: 2 },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {isOwner && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {isOwner && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Hapus</ListItemText>
          </MenuItem>
        )}
        {!isOwner && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <FlagOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Laporkan</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onClick={(e) => e.stopPropagation()}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Hapus Post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Post &ldquo;{postTitle}&rdquo; akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Report dialog (non-owner only) */}
      {!isOwner && (
        <ReportDialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          targetType="post"
          targetId={postId}
        />
      )}
    </>
  );
}

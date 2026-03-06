'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Chip,
  Typography,
  Alert,
} from '@mui/material';

// Quick-reject reason chips
const QUICK_REASONS = [
  'Tidak mengandung kritik + solusi',
  'Konten duplikat',
  'Mengandung ujaran kebencian',
  'Bukan topik kebijakan publik',
  'Informasi tidak akurat',
];

interface RejectDialogProps {
  open: boolean;
  postTitle: string;
  onClose: () => void;
  onConfirm: (reviewNote: string) => void;
  loading?: boolean;
}

/**
 * RejectDialog — Modal untuk menolak post dengan alasan wajib.
 * Quick reason chips mengisi textarea.
 * Submit disabled jika kosong.
 */
export default function RejectDialog({
  open,
  postTitle,
  onClose,
  onConfirm,
  loading = false,
}: RejectDialogProps) {
  const [reviewNote, setReviewNote] = useState('');
  const [error, setError] = useState('');

  const handleChipClick = (reason: string) => {
    setReviewNote((prev) => {
      const trimmed = prev.trim();
      if (trimmed) return `${trimmed}. ${reason}`;
      return reason;
    });
    setError('');
  };

  const handleSubmit = () => {
    const trimmed = reviewNote.trim();
    if (!trimmed) {
      setError('Alasan penolakan wajib diisi');
      return;
    }
    if (trimmed.length > 500) {
      setError('Maksimal 500 karakter');
      return;
    }
    onConfirm(trimmed);
  };

  const handleClose = () => {
    if (!loading) {
      setReviewNote('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
        Tolak Post
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Post: <strong>{postTitle}</strong>
        </Typography>

        {/* Quick reason chips */}
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Alasan cepat (klik untuk mengisi):
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2, mt: 0.5 }}>
          {QUICK_REASONS.map((reason) => (
            <Chip
              key={reason}
              label={reason}
              size="small"
              variant="outlined"
              onClick={() => handleChipClick(reason)}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'error.50', borderColor: 'error.main' },
              }}
            />
          ))}
        </Stack>

        <TextField
          label="Alasan penolakan"
          multiline
          rows={4}
          fullWidth
          value={reviewNote}
          onChange={(e) => {
            setReviewNote(e.target.value);
            if (error) setError('');
          }}
          error={!!error}
          helperText={error || `${reviewNote.length}/500`}
          placeholder="Tuliskan alasan mengapa post ini ditolak..."
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading || !reviewNote.trim()}
        >
          {loading ? 'Menolak...' : 'Tolak Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { useCreateReportMutation } from '@/store/api/reportApi';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Pelecehan / Bullying' },
  { value: 'misinformation', label: 'Informasi Menyesatkan' },
  { value: 'hate_speech', label: 'Ujaran Kebencian' },
  { value: 'other', label: 'Lainnya' },
] as const;

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment';
  targetId: string;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ReportDialog — Modal for users to report/flag a post or comment.
 */
export default function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
}: Readonly<ReportDialogProps>) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createReport, { isLoading }] = useCreateReportMutation();

  const handleSubmit = useCallback(async () => {
    if (!reason) {
      setError('Pilih alasan laporan');
      return;
    }
    setError(null);
    try {
      await createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        description: description.trim() || undefined,
      }).unwrap();
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setDescription('');
      }, 1500);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { message?: string } }).data?.message ?? 'Gagal mengirim laporan')
          : 'Gagal mengirim laporan';
      setError(message);
    }
  }, [reason, description, targetType, targetId, createReport, onClose]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
      setReason('');
      setDescription('');
      setError(null);
      setSuccess(false);
    }
  }, [isLoading, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Laporkan {targetType === 'post' ? 'Post' : 'Komentar'}
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            Laporan berhasil dikirim. Terima kasih!
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl component="fieldset" sx={{ mt: 1, width: '100%' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 1 }}>
                Pilih alasan laporan:
              </FormLabel>
              <RadioGroup
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REASONS.map((r) => (
                  <FormControlLabel
                    key={r.value}
                    value={r.value}
                    control={<Radio size="small" />}
                    label={r.label}
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <TextField
              label="Deskripsi tambahan (opsional)"
              multiline
              rows={3}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mt: 2 }}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          </>
        )}
      </DialogContent>
      {!success && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={isLoading || !reason}
          >
            {isLoading ? 'Mengirim...' : 'Laporkan'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

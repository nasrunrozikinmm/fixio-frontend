'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { SectorBadge, RegionBadge } from '@/components/post';
import { useCreatePostMutation } from '@/store/api/postApi';
import type { PostFormData } from '@/schemas/postSchema';
import type { Sector, Region } from '@/types';

// ────────────────────────────────────────────
// Content section preview (reused from PostDetailContent style)
// ────────────────────────────────────────────

interface SectionBoxProps {
  icon: string;
  label: string;
  headerBg: string;
  children: React.ReactNode;
}

function SectionBox({ icon, label, headerBg, children }: Readonly<SectionBoxProps>) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          bgcolor: headerBg,
          color: '#FFFFFF',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography component="span" sx={{ fontSize: '1rem' }}>
          {icon}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostPreviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: PostFormData;
  sector: Sector | null;
  region: Region | null;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostPreviewModal — Dialog preview format final + submit.
 *
 * Spec (brief-pixel):
 * - Tampilkan post dalam format final (badge, judul, kritik, solusi)
 * - "Edit Lagi" kembali ke form tanpa kehilangan input
 * - "Submit" panggil API POST /api/posts
 * - Submit success → redirect ke detail post
 */
export default function PostPreviewModal({
  open,
  onClose,
  formData,
  sector,
  region,
}: Readonly<PostPreviewModalProps>) {
  const router = useRouter();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setApiError(null);
    try {
      const post = await createPost({
        title: formData.title,
        sector_id: formData.sector_id,
        region_id: formData.region_id,
        criticism: formData.criticism,
        solution: formData.solution,
        impact_estimate: formData.impact_estimate || undefined,
        references: formData.references || undefined,
        status: 'pending_review',
      }).unwrap();

      onClose();
      router.push(`/post/${post.id}`);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message
          : null;
      setApiError(msg ?? 'Gagal mengirim post. Silakan coba lagi.');
    }
  }, [createPost, formData, onClose, router]);

  const handleClose = useCallback(() => {
    setApiError(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: { borderRadius: 3 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
        Preview Aspirasi
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Badges */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {sector && <SectorBadge sector={sector} />}
            {region && <RegionBadge region={region} />}
          </Stack>

          {/* Title */}
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            {formData.title}
          </Typography>

          <Divider />

          {/* Kritik */}
          <SectionBox icon="📌" label="Kritik" headerBg="#1B3A5C">
            {formData.criticism}
          </SectionBox>

          {/* Solusi */}
          <SectionBox icon="💡" label="Solusi" headerBg="#2E7D4F">
            {formData.solution}
          </SectionBox>

          {/* Estimasi Dampak */}
          {formData.impact_estimate?.trim() && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Typography component="span" sx={{ fontSize: '1rem' }}>📊</Typography>
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Estimasi Dampak
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formData.impact_estimate}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Referensi */}
          {formData.references?.trim() && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Typography component="span" sx={{ fontSize: '1rem' }}>🔗</Typography>
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Referensi
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {formData.references}
                </Typography>
              </Box>
            </Box>
          )}

          {/* API error */}
          {apiError && (
            <Alert severity="error">{apiError}</Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleClose}
          disabled={isLoading}
          sx={{ textTransform: 'none' }}
        >
          Edit Lagi
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

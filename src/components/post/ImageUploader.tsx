'use client';

import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';
import { useUploadImagesMutation } from '@/store/api/postApi';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface ImageUploaderProps {
  /** Current uploaded image URLs */
  value: string[];
  /** Called when images change (add/remove) */
  onChange: (urls: string[]) => void;
  /** Error message from form validation */
  error?: string;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ImageUploader — Drag & drop image upload with preview thumbnails.
 *
 * Features:
 * - Drag & drop or click to select (react-dropzone)
 * - Upload to MinIO via POST /api/uploads/images
 * - Preview thumbnails with remove button
 * - Max 5 images, 5MB each
 * - JPEG, PNG, WebP, GIF accepted
 */
export default function ImageUploader({
  value,
  onChange,
  error,
}: Readonly<ImageUploaderProps>) {
  const [uploadImages, { isLoading }] = useUploadImagesMutation();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const remainingSlots = MAX_FILES - value.length;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploadError(null);

    // Limit to remaining slots
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);
    if (filesToUpload.length === 0) {
      setUploadError(`Maksimal ${MAX_FILES} gambar`);
      return;
    }

    const formData = new FormData();
    for (const file of filesToUpload) {
      formData.append('images', file);
    }

    try {
      const result = await uploadImages(formData).unwrap();
      onChange([...value, ...result.urls]);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message
          : null;
      setUploadError(msg ?? 'Gagal mengupload gambar. Silakan coba lagi.');
    }
  }, [value, onChange, remainingSlots, uploadImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: remainingSlots,
    disabled: isLoading || remainingSlots <= 0,
    onDropRejected: (rejections) => {
      const firstError = rejections[0]?.errors[0];
      if (firstError?.code === 'file-too-large') {
        setUploadError('File terlalu besar. Maksimal 5MB per gambar.');
      } else if (firstError?.code === 'file-invalid-type') {
        setUploadError('Format tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.');
      } else {
        setUploadError('File tidak valid.');
      }
    },
  });

  const handleRemove = useCallback((indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
  }, [value, onChange]);

  return (
    <Box>
      {/* Dropzone area */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: error
            ? 'error.main'
            : isDragActive
              ? 'primary.main'
              : 'divider',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          cursor: remainingSlots > 0 && !isLoading ? 'pointer' : 'default',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': remainingSlots > 0 ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : {},
          opacity: remainingSlots <= 0 ? 0.5 : 1,
        }}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 1 }}>
            <CircularProgress size={24} />
            <Typography variant="caption" color="text.secondary">
              Mengupload...
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={0.5} sx={{ py: 0.5 }}>
            <AddPhotoAlternateIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {isDragActive
                ? 'Drop gambar di sini...'
                : remainingSlots > 0
                  ? `Klik atau drag gambar (maks. ${MAX_FILES}, sisa ${remainingSlots})`
                  : `Batas ${MAX_FILES} gambar tercapai`}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              JPEG, PNG, WebP, GIF — maks. 5MB per file
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Error messages */}
      {(uploadError ?? error) && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => setUploadError(null)}>
          {uploadError ?? error}
        </Alert>
      )}

      {/* Preview thumbnails */}
      {value.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1.5,
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
          }}
        >
          {value.map((url, index) => (
            <Box
              key={url}
              sx={{
                position: 'relative',
                flexShrink: 0,
                width: 80,
                height: 80,
                borderRadius: 1.5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`Upload ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemove(index)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'common.white',
                  p: 0.25,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

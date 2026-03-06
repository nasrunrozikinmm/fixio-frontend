'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import { useCreateCommentMutation } from '@/store/api/commentApi';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  placeholder?: string;
  /** Compact mode for inline reply forms */
  compact?: boolean;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * CommentForm — Form input komentar / reply.
 *
 * Spec (brief-pixel):
 * - Auth required: jika belum login, buka login modal saat klik field
 * - Kirim button disabled saat content kosong atau loading
 * - Error alert tampil jika API gagal
 */
export default function CommentForm({
  postId,
  parentId = null,
  onSuccess,
  placeholder = 'Tulis komentar...',
  compact = false,
}: Readonly<CommentFormProps>) {
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const [content, setContent] = useState('');
  const [createComment, { isLoading, error }] = useCreateCommentMutation();

  const handleFocus = useCallback(() => {
    if (!isAuthenticated) {
      openLoginModal();
    }
  }, [isAuthenticated, openLoginModal]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isAuthenticated) {
        openLoginModal();
        return;
      }

      const trimmed = content.trim();
      if (!trimmed) return;

      try {
        await createComment({
          postId,
          content: trimmed,
          parent_id: parentId,
        }).unwrap();

        setContent('');
        onSuccess?.();
      } catch {
        // Error is handled via `error` state from the mutation
      }
    },
    [isAuthenticated, openLoginModal, content, createComment, postId, parentId, onSuccess],
  );

  function getErrorMessage() {
    if (error && 'data' in error) {
      return (error.data as { message?: string })?.message ?? 'Gagal mengirim komentar.';
    }
    if (error) return 'Gagal mengirim komentar.';
    return null;
  }

  const apiErrorMsg = getErrorMessage();

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        multiline
        minRows={compact ? 1 : 2}
        maxRows={6}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={handleFocus}
        size={compact ? 'small' : 'medium'}
        slotProps={{
          htmlInput: { maxLength: 2000 },
        }}
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
          },
        }}
      />

      {apiErrorMsg && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {apiErrorMsg}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          size={compact ? 'small' : 'medium'}
          disabled={!content.trim() || isLoading}
          endIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SendIcon sx={{ fontSize: 16 }} />
            )
          }
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Kirim
        </Button>
      </Box>
    </Box>
  );
}

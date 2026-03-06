'use client';

import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useVotePostMutation, useRemoveVoteMutation } from '@/store/api/voteApi';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import type { VoteType } from '@/types';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface VoteButtonProps {
  postId: string;
  voteCount: number;
  userVote: VoteType | null;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * VoteButton — Upvote / Downvote dengan optimistic update.
 *
 * Behaviour (brief-pixel spec):
 * - Klik same type → hapus vote (toggle)
 * - Klik different type → switch vote
 * - Optimistic: update UI instan, rollback jika API error
 * - Upvote aktif: hijau (secondary.main)
 * - Downvote aktif: merah (error.main)
 * - Auth required: buka login modal jika belum login
 */
export default function VoteButton({
  postId,
  voteCount,
  userVote,
}: Readonly<VoteButtonProps>) {
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const [votePost] = useVotePostMutation();
  const [removeVote] = useRemoveVoteMutation();

  // ── Optimistic local state ──
  const [optimisticVote, setOptimisticVote] = useState<VoteType | null>(userVote);
  const [optimisticCount, setOptimisticCount] = useState(voteCount);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync with server data when props change
  if (userVote !== optimisticVote && !errorMsg) {
    setOptimisticVote(userVote);
    setOptimisticCount(voteCount);
  }

  const handleVote = useCallback(
    async (type: VoteType) => {
      if (!isAuthenticated) {
        openLoginModal();
        return;
      }

      // Save previous state for rollback
      const prevVote = optimisticVote;
      const prevCount = optimisticCount;

      // ── Determine action & optimistic state ──
      if (optimisticVote === type) {
        // Toggle off — remove vote
        setOptimisticVote(null);
        setOptimisticCount(
          prevCount + (type === 'up' ? -1 : 1),
        );

        try {
          await removeVote(postId).unwrap();
        } catch {
          // Rollback
          setOptimisticVote(prevVote);
          setOptimisticCount(prevCount);
          setErrorMsg('Gagal menghapus vote. Coba lagi.');
        }
      } else {
        // New vote or switch
        setOptimisticVote(type);

        let delta = type === 'up' ? 1 : -1;
        if (prevVote === 'up') delta -= 1;       // was up, switching to down: -2 total
        else if (prevVote === 'down') delta += 1; // was down, switching to up: +2 total
        setOptimisticCount(prevCount + delta);

        try {
          await votePost({ postId, type }).unwrap();
        } catch {
          // Rollback
          setOptimisticVote(prevVote);
          setOptimisticCount(prevCount);
          setErrorMsg('Gagal melakukan vote. Coba lagi.');
        }
      }
    },
    [isAuthenticated, openLoginModal, optimisticVote, optimisticCount, postId, votePost, removeVote],
  );

  const handleCloseError = useCallback(() => {
    setErrorMsg(null);
  }, []);

  const isUpActive = optimisticVote === 'up';
  const isDownActive = optimisticVote === 'down';

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Upvote */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowDropUpIcon />}
          onClick={() => handleVote('up')}
          sx={{
            minWidth: 0,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: isUpActive ? 'secondary.main' : 'divider',
            color: isUpActive ? 'secondary.main' : 'text.secondary',
            bgcolor: isUpActive ? 'secondary.light' : 'transparent',
            '&:hover': {
              borderColor: 'secondary.main',
              bgcolor: 'secondary.light',
            },
          }}
        >
          Upvote
        </Button>

        {/* Count */}
        <Typography
          variant="body1"
          fontWeight={700}
          sx={{ minWidth: 32, textAlign: 'center' }}
        >
          {optimisticCount}
        </Typography>

        {/* Downvote */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowDropDownIcon />}
          onClick={() => handleVote('down')}
          sx={{
            minWidth: 0,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: isDownActive ? 'error.main' : 'divider',
            color: isDownActive ? 'error.main' : 'text.secondary',
            bgcolor: isDownActive ? 'error.light' : 'transparent',
            '&:hover': {
              borderColor: 'error.main',
              bgcolor: 'error.light',
            },
          }}
        >
          Downvote
        </Button>
      </Stack>

      {/* Error snackbar */}
      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
}

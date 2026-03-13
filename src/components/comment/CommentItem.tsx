'use client';

import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { formatRelativeDate } from '@/lib/formatDate';
import { useDeleteCommentMutation, useToggleCommentVoteMutation } from '@/store/api/commentApi';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import type { Comment } from '@/types';
import CommentForm from './CommentForm';
import ReportDialog from '@/components/moderation/ReportDialog';


// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  postId: string;
  /** Whether this is a reply (nested level 1). Replies cannot have further replies. */
  isReply?: boolean;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * CommentItem — Single comment with optional inline reply form.
 *
 * Spec (brief-pixel):
 * - Comment: border-left 2px solid #E5E7EB, padding-left 16px
 * - Reply: indented 40px, border-left 2px solid secondary.main (hijau)
 * - Klik "Balas" → inline reply form muncul di bawah komentar
 * - Reply hanya 1 level (reply tidak punya "Balas" button)
 */
export default function CommentItem({
  comment,
  postId,
  isReply = false,
}: Readonly<CommentItemProps>) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localVoted, setLocalVoted] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(comment.vote_count ?? 0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [deleteComment] = useDeleteCommentMutation();
  const [toggleVote] = useToggleCommentVoteMutation();

  // Sync vote count when parent re-renders with fresh data
  useEffect(() => {
    setLocalVoteCount(comment.vote_count ?? 0);
  }, [comment.vote_count]);

  const handleToggleReply = useCallback(() => {
    setShowReplyForm((prev) => !prev);
  }, []);

  const handleReplySuccess = useCallback(() => {
    setShowReplyForm(false);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      await deleteComment({ commentId: comment.id, postId }).unwrap();
    } catch {
      setErrorMsg('Gagal menghapus komentar. Coba lagi.');
    }
  }, [deleteComment, comment.id, postId]);

  const handleCloseError = useCallback(() => {
    setErrorMsg(null);
  }, []);

  const handleVote = useCallback(async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    // Optimistic update
    const prevVoted = localVoted;
    const prevCount = localVoteCount;
    setLocalVoted(!prevVoted);
    setLocalVoteCount(prevVoted ? prevCount - 1 : prevCount + 1);
    try {
      const result = await toggleVote({ commentId: comment.id, postId }).unwrap();
      setLocalVoted(result.voted);
      setLocalVoteCount(result.vote_count);
    } catch {
      // Rollback
      setLocalVoted(prevVoted);
      setLocalVoteCount(prevCount);
      setErrorMsg('Gagal vote komentar. Coba lagi.');
    }
  }, [isAuthenticated, openLoginModal, localVoted, localVoteCount, toggleVote, comment.id, postId]);

  // Owner, moderator, or admin can delete
  const canDelete =
    user &&
    (user.id === comment.user_id ||
      user.role === 'moderator' ||
      user.role === 'administrator');

  // Non-owners can report
  const canReport = isAuthenticated && user && user.id !== comment.user_id;

  const handleReportClick = useCallback(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setReportDialogOpen(true);
  }, [isAuthenticated, openLoginModal]);

  return (
    <Box>
      {/* ── Comment body ── */}
      <Box
        sx={{
          borderLeft: '2px solid',
          borderLeftColor: isReply ? 'secondary.main' : 'divider',
          pl: 2,
          py: 1,
        }}
      >
        {/* Meta: avatar + name + time */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
          {comment.user && (
            <Avatar
              src={comment.user.avatar_url}
              alt={comment.user.name}
              sx={{ width: 28, height: 28, fontSize: '0.7rem' }}
            >
              {comment.user.name?.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
            {comment.user?.name ?? 'Anonim'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            · {formatRelativeDate(comment.created_at)}
          </Typography>
        </Stack>

        {/* Content */}
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, mb: 1 }}
        >
          {comment.content}
        </Typography>

        {/* Actions: upvote + reply button (only for top-level comments) + delete */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            size="small"
            startIcon={
              localVoted ? (
                <ThumbUpIcon sx={{ fontSize: 14 }} />
              ) : (
                <ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
              )
            }
            onClick={handleVote}
            sx={{
              textTransform: 'none',
              color: localVoted ? 'primary.main' : 'text.secondary',
              fontSize: '0.75rem',
              minHeight: 0,
              py: 0.25,
              '&:hover': { color: 'primary.main' },
            }}
          >
            {localVoteCount > 0 ? localVoteCount : 'Suka'}
          </Button>

          {!isReply && (
            <Button
              size="small"
              startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
              onClick={handleToggleReply}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                fontSize: '0.75rem',
                minHeight: 0,
                py: 0.25,
                '&:hover': { color: 'secondary.main' },
              }}
            >
              {showReplyForm ? 'Batal' : 'Balas'}
            </Button>
          )}

          {canDelete && (
            <IconButton
              size="small"
              onClick={handleDelete}
              aria-label="Hapus komentar"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main' },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}

          {canReport && (
            <IconButton
              size="small"
              onClick={handleReportClick}
              aria-label="Laporkan komentar"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'warning.main' },
              }}
            >
              <FlagOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* ── Inline reply form ── */}
      {showReplyForm && (
        <Box sx={{ ml: 5, mt: 1 }}>
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={handleReplySuccess}
            placeholder="Tulis balasan..."
            compact
          />
        </Box>
      )}

      {/* ── Nested replies ── */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <Box sx={{ ml: 5, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              isReply
            />
          ))}
        </Box>
      )}

      {/* Report dialog */}
      {canReport && (
        <ReportDialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          targetType="comment"
          targetId={comment.id}
        />
      )}

      {/* Error snackbar */}
      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { Post, VoteType } from '@/types';
import { formatRelativeDate } from '@/lib/formatDate';
import { useVotePostMutation, useRemoveVoteMutation, useGetUserVoteQuery } from '@/store/api/voteApi';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import StatusBadge from './StatusBadge';
import SectorBadge from './SectorBadge';
import RegionBadge from './RegionBadge';
import BookmarkButton from './BookmarkButton';
import ShareMenu from './ShareMenu';
import PostMoreMenu from './PostMoreMenu';
import ImageGallery from './ImageGallery';
import { stripHtml } from '@/components/editor';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  showStatus?: boolean;
  variant?: 'feed' | 'compact';
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostCard — Quora-style flat card.
 *
 * Layout:
 * - Row 1: Author (avatar + name + bio + date + FollowButton)
 * - Row 2: Badges (sector, region, status)
 * - Row 3: Title (clickable)
 * - Row 4: Content preview (3-4 lines, clickable) — feed variant only
 * - Row 5: Action bar (vote arrows + count + comment + bookmark + share)
 */
export default function PostCard({
  post,
  showStatus = false,
  variant = 'feed',
}: Readonly<PostCardProps>) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { openLoginModal } = useLoginModal();

  // ── Vote state ──
  const { data: userVoteData } = useGetUserVoteQuery(post.id, { skip: !isAuthenticated });
  const [votePost] = useVotePostMutation();
  const [removeVote] = useRemoveVoteMutation();

  const [optimisticVote, setOptimisticVote] = useState<VoteType | null>(null);
  const [optimisticCount, setOptimisticCount] = useState(post.vote_count);
  const [voteError, setVoteError] = useState<string | null>(null);

  // Sync with server — safe in useEffect to avoid render-phase setState
  const serverVote = userVoteData?.type ?? null;
  useEffect(() => {
    if (!voteError) {
      setOptimisticVote(serverVote);
      setOptimisticCount(post.vote_count);
    }
  }, [serverVote, post.vote_count, voteError]);

  const handleVote = useCallback(async (type: VoteType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { openLoginModal(); return; }

    const prevVote = optimisticVote;
    const prevCount = optimisticCount;

    if (optimisticVote === type) {
      // Toggle off
      setOptimisticVote(null);
      setOptimisticCount(prevCount + (type === 'up' ? -1 : 1));
      try { await removeVote(post.id).unwrap(); }
      catch { setOptimisticVote(prevVote); setOptimisticCount(prevCount); setVoteError('Gagal menghapus vote.'); }
    } else {
      // New or switch
      setOptimisticVote(type);
      let delta = type === 'up' ? 1 : -1;
      if (prevVote === 'up') delta -= 1;
      else if (prevVote === 'down') delta += 1;
      setOptimisticCount(prevCount + delta);
      try { await votePost({ postId: post.id, type }).unwrap(); }
      catch { setOptimisticVote(prevVote); setOptimisticCount(prevCount); setVoteError('Gagal melakukan vote.'); }
    }
  }, [isAuthenticated, openLoginModal, optimisticVote, optimisticCount, post.id, votePost, removeVote]);

  const isUpActive = optimisticVote === 'up';
  const isDownActive = optimisticVote === 'down';

  const handleNavigate = () => {
    router.push(`/post/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.user) {
      router.push(`/user/${post.user.id}`);
    }
  };

  const postUrl = typeof globalThis.location !== 'undefined'
    ? `${globalThis.location.origin}/post/${post.id}`
    : `/post/${post.id}`;

  return (
    <>
    <Card
      component="article"
      sx={{
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        {/* ── Row 1: Author ── */}
        {post.user && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.25 }}
          >
            <Avatar
              src={post.user.avatar_url}
              alt={post.user.name}
              onClick={handleAuthorClick}
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                cursor: 'pointer',
                '&:hover': { opacity: 0.85 },
              }}
            >
              {post.user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  onClick={handleAuthorClick}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    maxWidth: { xs: 120, sm: 200 },
                  }}
                >
                  {post.user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">·</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {formatRelativeDate(post.created_at)}
                </Typography>
              </Stack>
              {post.user.bio && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: 'block', fontSize: '0.7rem', lineHeight: 1.3, maxWidth: { xs: 200, sm: 320 } }}
                >
                  {post.user.bio}
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        {/* ── Row 2: Badges ── */}
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 1 }}
        >
          {post.sector && <SectorBadge sector={post.sector} />}
          {post.region && <RegionBadge region={post.region} />}
          {showStatus && <Box sx={{ flexGrow: 1 }} />}
          {showStatus && <StatusBadge status={post.status} />}
        </Stack>

        {/* ── Row 3: Title (clickable) ── */}
        <Typography
          variant="h3"
          component="h2"
          onClick={handleNavigate}
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            cursor: 'pointer',
            mb: variant === 'feed' ? 0.75 : 1,
            '&:hover': { color: 'info.main' },
          }}
        >
          {post.title}
        </Typography>

        {/* ── Row 3b: Image Gallery ── */}
        {post.images?.length > 0 && (
          <Box sx={{ mb: variant === 'feed' ? 1 : 0.75 }}>
            <ImageGallery images={post.images} variant="card" />
          </Box>
        )}

        {/* ── Row 4: Preview (feed only) ── */}
        {variant === 'feed' && post.criticism && (
          <Typography
            variant="body2"
            color="text.secondary"
            onClick={handleNavigate}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
              mb: 1.5,
              fontSize: '0.8125rem',
              lineHeight: 1.55,
            }}
          >
            {stripHtml(post.criticism)}
          </Typography>
        )}

        {/* ── Row 5: Action Bar ── */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0}
          sx={{
            mx: -0.5,
            color: 'text.secondary',
          }}
        >
          {/* Compact vote (up arrow + count + down arrow) */}
          <Stack direction="row" alignItems="center" spacing={0}>
            <IconButton
              size="small"
              onClick={(e) => handleVote('up', e)}
              sx={{
                color: isUpActive ? 'secondary.main' : 'text.secondary',
                p: 0.5,
                '&:hover': { color: 'secondary.main' },
              }}
              aria-label="Upvote"
            >
              <ArrowDropUpIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                minWidth: 20,
                textAlign: 'center',
                fontSize: '0.75rem',
                color: isUpActive ? 'secondary.main' : isDownActive ? 'error.main' : 'text.secondary',
              }}
            >
              {optimisticCount}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => handleVote('down', e)}
              sx={{
                color: isDownActive ? 'error.main' : 'text.secondary',
                p: 0.5,
                '&:hover': { color: 'error.main' },
              }}
              aria-label="Downvote"
            >
              <ArrowDropDownIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Stack>

          {/* Divider dot */}
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'divider', mx: 1 }} />

          {/* Comment count */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            onClick={handleNavigate}
            sx={{ cursor: 'pointer', px: 0.75, py: 0.25, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
              {post.comment_count ?? 0}
            </Typography>
          </Stack>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Bookmark */}
          <Box onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <BookmarkButton postId={post.id} />
          </Box>

          {/* Share */}
          <ShareMenu url={postUrl} title={post.title} />

          {/* More menu (owner: edit/delete, non-owner: report) */}
          <PostMoreMenu
            postId={post.id}
            postTitle={post.title}
            isOwner={!!user && post.user_id === user.id}
          />
        </Stack>
      </CardContent>
    </Card>

    {/* Vote error snackbar */}
    <Snackbar
      open={Boolean(voteError)}
      autoHideDuration={3000}
      onClose={() => setVoteError(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={() => setVoteError(null)} severity="error" variant="filled" sx={{ width: '100%' }}>
        {voteError}
      </Alert>
    </Snackbar>
    </>
  );
}

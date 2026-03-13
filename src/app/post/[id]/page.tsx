'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { useGetPostQuery } from '@/store/api/postApi';
import { useGetUserVoteQuery } from '@/store/api/voteApi';
import { useAuth } from '@/hooks/useAuth';
import {
  PostDetailHeader,
  PostDetailContent,
  ShareMenu,
  VoteButton,
} from '@/components/post';
import { CommentSection } from '@/components/comment';
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout';
import PostDetailSidebar from '@/components/layout/PostDetailSidebar';


// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Skeleton variant="text" width={120} height={24} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={80} height={28} />
        <Skeleton variant="rounded" width={100} height={28} />
      </Stack>
      <Skeleton variant="text" width="80%" height={40} />
      <Stack direction="row" spacing={1} alignItems="center">
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="text" width={180} height={20} />
      </Stack>
      <Skeleton variant="rounded" width="100%" height={200} />
      <Skeleton variant="rounded" width="100%" height={200} />
    </Box>
  );
}

// ────────────────────────────────────────────
// Error state
// ────────────────────────────────────────────

function ErrorState({ message }: Readonly<{ message: string }>) {
  const router = useRouter();

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" gutterBottom>
        Post tidak ditemukan
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      <Button variant="contained" onClick={() => router.push('/')}>
        Kembali ke Beranda
      </Button>
    </Box>
  );
}

// ────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const { data: post, isLoading, isError, error } = useGetPostQuery(id);
  const { data: userVoteData } = useGetUserVoteQuery(id, {
    skip: !isAuthenticated,
  });

  const errorMessage =
    isError && error && 'status' in error
      ? 'Post tidak ditemukan atau telah dihapus.'
      : 'Terjadi kesalahan saat memuat post.';

  return (
    <ThreeColumnLayout
      rightSidebar={
        post?.user ? (
          <PostDetailSidebar author={post.user} postId={id} />
        ) : undefined
      }
    >
      <Box>
        {/* ── Back link ── */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            mb: 3,
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary',
            },
          }}
        >
          Kembali ke Feed
        </Button>

        {/* ── Loading skeleton ── */}
        {isLoading && <DetailSkeleton />}

        {/* ── Error state ── */}
        {isError && <ErrorState message={errorMessage} />}

        {/* ── Post content ── */}
        {post && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header: badges, title, author meta */}
            <PostDetailHeader post={post} />

            <Divider />

            {/* Kritik + Solusi + Impact + References */}
            <PostDetailContent post={post} />

            <Divider />

            {/* Voting bar + share */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <VoteButton
                postId={post.id}
                voteCount={post.vote_count}
                userVote={userVoteData?.type ?? null}
              />

              {/* Comment count */}
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1, color: 'text.secondary' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" fontWeight={600}>
                  {post.comment_count ?? 0}
                </Typography>
              </Stack>

              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />

              {/* Share */}
              <ShareMenu title={post.title} variant="outlined" />

              {/* Edit button (owner only) */}
              {user && post.user_id === user.id && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                  onClick={() => router.push(`/post/${post.id}/edit`)}
                  sx={{ textTransform: 'none', fontSize: '0.8125rem', ml: 0.5 }}
                >
                  Edit
                </Button>
              )}
            </Stack>

            <Divider />

            {/* Comment section */}
            <CommentSection
              postId={post.id}
              commentCount={post.comment_count ?? 0}
            />
          </Box>
        )}
      </Box>
    </ThreeColumnLayout>
  );
}

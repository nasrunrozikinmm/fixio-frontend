'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { useGetRelatedPostsQuery } from '@/store/api/postApi';
import { PostCard } from '@/components/post';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface RelatedPostsProps {
  postId: string;
  limit?: number;
}

// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

function RelatedSkeleton() {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: 3 }, (_, i) => (
        <Box key={i} sx={{ p: 1.5 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="90%" height={16} sx={{ mt: 0.5 }} />
          <Skeleton variant="text" width="40%" height={14} sx={{ mt: 0.5 }} />
        </Box>
      ))}
    </Stack>
  );
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * RelatedPosts — Displays a list of related posts (same sector).
 *
 * Uses compact PostCard variant for a tight layout.
 * Renders nothing if no related posts are found.
 */
export default function RelatedPosts({ postId, limit = 5 }: Readonly<RelatedPostsProps>) {
  const { data: posts, isLoading } = useGetRelatedPostsQuery({ id: postId, limit });

  // Don't render section if no results
  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  return (
    <Box>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          fontSize: '1rem',
          mb: 2,
          color: 'text.primary',
        }}
      >
        Post Terkait
      </Typography>

      {isLoading && <RelatedSkeleton />}

      {posts && posts.length > 0 && (
        <Stack spacing={0} divider={<Divider />} gap={1}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))}
        </Stack>
      )}
    </Box>
  );
}

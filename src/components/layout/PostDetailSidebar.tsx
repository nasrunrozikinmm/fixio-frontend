'use client';

import Box from '@mui/material/Box';
import AuthorCard from '@/components/layout/AuthorCard';
import SidebarAd from '@/components/layout/SidebarAd';
import RelatedPosts from '@/components/post/RelatedPosts';
import type { User } from '@/types';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostDetailSidebarProps {
  author: User;
  postId: string;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostDetailSidebar — Composed right sidebar for post detail page.
 *
 * Layout order:
 * 1. AuthorCard
 * 2. SidebarAd (compact)
 * 3. RelatedPosts
 */
export default function PostDetailSidebar({ author, postId }: Readonly<PostDetailSidebarProps>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AuthorCard author={author} />
      <SidebarAd variant="compact" />
      <RelatedPosts postId={postId} limit={5} />
    </Box>
  );
}

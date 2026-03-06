'use client';

import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import { PostCard, PostCardSkeleton } from '@/components/post';
import { useGetPostsQuery, SORT_OPTIONS } from '@/store/api/postApi';
import type { SortKey } from '@/store/api/postApi';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const TABS: { label: string; sortKey: SortKey }[] = [
  { label: 'Terbaru', sortKey: 'latest' },
  { label: 'Populer', sortKey: 'popular' },
];

const PAGE_SIZE = 10;

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostFeedProps {
  /** Optional sector_id filter from sidebar */
  sectorId?: string;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostFeed — Tabbed post list with "Terbaru" / "Populer" sort + pagination.
 *
 * Sesuai brief-pixel.md:
 * - 2 tabs: "Terbaru" (sort=created_at desc) | "Populer" (sort=vote_count desc)
 * - Skeleton while loading (not a spinner)
 * - Numbered pagination (MUI Pagination)
 * - Accepts external sectorId filter prop from SectorFilterSidebar
 */
export default function PostFeed({ sectorId }: Readonly<PostFeedProps>) {
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(1);

  // Reset page when sector filter changes (React recommended pattern:
  // adjusting state during render, not in useEffect)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevSectorId, setPrevSectorId] = useState(sectorId);
  if (prevSectorId !== sectorId) {
    setPrevSectorId(sectorId);
    setPage(1);
  }

  const currentSortKey = TABS[tabIndex].sortKey;

  // Build query params — memoized to avoid unnecessary re-renders
  const queryParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    sort: SORT_OPTIONS[currentSortKey],
    ...(sectorId ? { sector_id: sectorId } : {}),
  }), [page, currentSortKey, sectorId]);

  const { data, isLoading, isFetching, isError } = useGetPostsQuery(queryParams);

  const posts = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setPage(1); // Reset to first page when switching tabs
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    // Scroll to top of feed
    const feedEl = document.getElementById('post-feed');
    if (feedEl) {
      feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <Box id="post-feed">
      {/* ── Sort Tabs ── */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{
          mb: 2.5,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.sortKey}
            label={tab.label}
            sx={{ minWidth: 'auto', px: 2 }}
          />
        ))}
      </Tabs>

      {/* ── Post List ── */}
      <FeedContent
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        posts={posts}
      />

      {/* ── Pagination ── */}
      {totalPages > 1 && !isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            disabled={isFetching}
          />
        </Box>
      )}
    </Box>
  );
}

// ────────────────────────────────────────────
// Sub-component — extracted to avoid nested ternaries (SonarQube S3358)
// ────────────────────────────────────────────

import type { Post } from '@/types';

interface FeedContentProps {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  posts: Post[];
}

function FeedContent({ isLoading, isError, isFetching, posts }: Readonly<FeedContentProps>) {
  if (isLoading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={`skeleton-${i.toString()}`} variant="feed" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Gagal memuat post. Silakan coba lagi nanti.
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          Belum ada post yang tersedia.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Jadilah yang pertama menyampaikan kritik &amp; solusi!
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={!isFetching} timeout={300}>
      <Stack spacing={2} sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant="feed" />
        ))}
      </Stack>
    </Fade>
  );
}

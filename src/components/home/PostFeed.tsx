'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import { PostCard, PostCardSkeleton } from '@/components/post';
import { useGetPostsQuery, useGetFollowingFeedQuery, SORT_OPTIONS } from '@/store/api/postApi';
import type { SortKey } from '@/store/api/postApi';
import { useAuth } from '@/hooks/useAuth';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

type TabType = 'latest' | 'popular' | 'following';

interface TabDef {
  label: string;
  type: TabType;
  sortKey?: SortKey;
  authRequired?: boolean;
}

const TABS: TabDef[] = [
  { label: 'Terbaru', type: 'latest', sortKey: 'latest' },
  { label: 'Populer', type: 'popular', sortKey: 'popular' },
  { label: 'Mengikuti', type: 'following', authRequired: true },
];

const PAGE_SIZE = 10;

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface PostFeedProps {
  sectorId?: string;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * PostFeed — Tabbed post list with infinite scroll (Quora-style).
 *
 * - 3 tabs: "Terbaru" | "Populer" | "Mengikuti"
 * - IntersectionObserver-based infinite scroll
 * - Skeleton on initial load, spinner on load-more
 */
export default function PostFeed({ sectorId }: Readonly<PostFeedProps>) {
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(1);

  // Accumulated posts for infinite scroll
  const [accumulatedPosts, setAccumulatedPosts] = useState<import('@/types').Post[]>([]);

  // Reset when sector or tab changes
  const [prevSectorId, setPrevSectorId] = useState(sectorId);
  const [prevTabIndex, setPrevTabIndex] = useState(tabIndex);
  if (prevSectorId !== sectorId) {
    setPrevSectorId(sectorId);
    setPage(1);
    setAccumulatedPosts([]);
  }
  if (prevTabIndex !== tabIndex) {
    setPrevTabIndex(tabIndex);
    setPage(1);
    setAccumulatedPosts([]);
  }

  const visibleTabs = useMemo(
    () => TABS.filter((t) => !t.authRequired || !!user),
    [user],
  );

  const currentTab = visibleTabs[tabIndex] ?? visibleTabs[0];
  const isFollowingTab = currentTab.type === 'following';

  const queryParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    sort: currentTab.sortKey ? SORT_OPTIONS[currentTab.sortKey] : undefined,
    ...(sectorId ? { sector_id: sectorId } : {}),
  }), [page, currentTab.sortKey, sectorId]);

  const regularQuery = useGetPostsQuery(queryParams, { skip: isFollowingTab });
  const followingQuery = useGetFollowingFeedQuery(
    { page, limit: PAGE_SIZE },
    { skip: !isFollowingTab },
  );

  const activeQuery = isFollowingTab ? followingQuery : regularQuery;
  const newPosts = activeQuery.data?.data ?? [];
  const pagination = activeQuery.data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;
  const hasMore = page < totalPages;

  // Accumulate posts when new data arrives
  const [lastMergedPage, setLastMergedPage] = useState(0);
  useEffect(() => {
    if (newPosts.length > 0 && page !== lastMergedPage && !activeQuery.isFetching) {
      setAccumulatedPosts((prev) => {
        if (page === 1) return newPosts;
        // Deduplicate by id
        const existingIds = new Set(prev.map((p) => p.id));
        const unique = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...unique];
      });
      setLastMergedPage(page);
    }
  }, [newPosts, page, lastMergedPage, activeQuery.isFetching]);

  // IntersectionObserver sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !activeQuery.isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, activeQuery.isFetching]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  }, []);

  // Use accumulated or first-page data
  const displayPosts = accumulatedPosts.length > 0 ? accumulatedPosts : newPosts;

  return (
    <Box id="post-feed">
      {/* ── Tabs ── */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          '& .MuiTabs-indicator': {
            height: 2,
            borderRadius: '2px 2px 0 0',
          },
        }}
      >
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.type}
            label={tab.label}
            sx={{ minWidth: 'auto', px: 2, fontSize: '0.8125rem', textTransform: 'none' }}
          />
        ))}
      </Tabs>

      {/* ── Content ── */}
      <FeedContent
        isLoading={activeQuery.isLoading && page === 1}
        isError={activeQuery.isError}
        isFetching={activeQuery.isFetching && page === 1}
        posts={displayPosts}
        isFollowingTab={isFollowingTab}
      />

      {/* ── Load more indicator ── */}
      {activeQuery.isFetching && page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} sx={{ color: 'text.secondary' }} />
        </Box>
      )}

      {/* ── End of feed ── */}
      {!hasMore && displayPosts.length > 0 && !activeQuery.isLoading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 3 }}>
          Tidak ada post lagi.
        </Typography>
      )}

      {/* ── Infinite scroll sentinel ── */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </Box>
  );
}

// ────────────────────────────────────────────
// Sub-component
// ────────────────────────────────────────────

import type { Post } from '@/types';

interface FeedContentProps {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  posts: Post[];
  isFollowingTab?: boolean;
}

function FeedContent({ isLoading, isError, isFetching, posts, isFollowingTab }: Readonly<FeedContentProps>) {
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
        <Typography variant="body2" color="text.secondary">
          {isFollowingTab
            ? 'Belum ada post dari orang yang Anda ikuti.'
            : 'Belum ada post yang tersedia.'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {isFollowingTab
            ? 'Ikuti pengguna lain untuk melihat post mereka di sini.'
            : 'Jadilah yang pertama menyampaikan kritik & solusi!'}
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={!isFetching} timeout={300}>
      <Stack spacing={1.5} sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant="feed" />
        ))}
      </Stack>
    </Fade>
  );
}

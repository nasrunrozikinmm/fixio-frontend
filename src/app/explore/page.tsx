'use client';

import { Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { PostCard, PostCardSkeleton } from '@/components/post';
import { ExploreFilters, ActiveFilterChips } from '@/components/explore';
import type { ExploreFilterValues } from '@/components/explore/ExploreFilters';
import { useGetPostsQuery, SORT_OPTIONS } from '@/store/api/postApi';
import type { SortKey } from '@/store/api/postApi';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import { useGetRegionsQuery } from '@/store/api/regionApi';
import { useDebounce } from '@/hooks/useDebounce';
import type { Post } from '@/types';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

const isValidSortKey = (v: string | null): v is SortKey =>
  v === 'latest' || v === 'popular' || v === 'most_discussed';

// ────────────────────────────────────────────
// Page
// ────────────────────────────────────────────

/**
 * Explore page — search + filter + grid post cards.
 *
 * Sesuai brief-pixel.md:
 * - Search bar full-width, debounce 300ms
 * - Filter dropdowns: Sektor, Wilayah, Urutan
 * - Active filter chips (removable)
 * - 2 kolom desktop, 1 kolom mobile
 * - URL query params sync (shareable URL)
 * - Pagination with max 5 page numbers
 * - Empty state: illustration + text
 */
/**
 * ExplorePage — Suspense wrapper (required by Next.js for useSearchParams).
 */
export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoadingFallback />}>
      <ExploreContent />
    </Suspense>
  );
}

/**
 * Lightweight loading skeleton shown while Suspense resolves useSearchParams.
 */
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

function ExploreLoadingFallback() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Skeleton variant="text" width={220} height={36} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={160} height={40} />
        <Skeleton variant="rounded" width={160} height={40} />
        <Skeleton variant="rounded" width={150} height={40} />
      </Stack>
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={`fallback-${i.toString()}`} size={{ xs: 12, md: 6 }}>
            <PostCardSkeleton variant="feed" />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// ────────────────────────────────────────────
// Main content (uses useSearchParams)
// ────────────────────────────────────────────

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Read initial values from URL ──
  const initialSearch = searchParams.get('q') ?? '';
  const initialSectorId = searchParams.get('sector') ?? '';
  const initialRegionId = searchParams.get('region') ?? '';
  const initialSort: SortKey = isValidSortKey(searchParams.get('sort'))
    ? (searchParams.get('sort') as SortKey)
    : 'latest';
  const initialPage = Number(searchParams.get('page')) || 1;

  // ── Local state ──
  const [search, setSearch] = useState(initialSearch);
  const [sectorId, setSectorId] = useState(initialSectorId);
  const [regionId, setRegionId] = useState(initialRegionId);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [page, setPage] = useState(initialPage);

  // Debounced search
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // ── URL sync helper ──
  const updateUrl = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) sp.set(key, val);
    });
    const qs = sp.toString();
    const path = qs ? '/explore?' + qs : '/explore';
    router.replace(path, { scroll: false });
  }, [router]);

  // Sync URL whenever filters change (via debouncedSearch)
  useEffect(() => {
    updateUrl({
      q: debouncedSearch,
      sector: sectorId,
      region: regionId,
      sort: sortKey === 'latest' ? '' : sortKey,
      page: page > 1 ? String(page) : '',
    });
  }, [debouncedSearch, sectorId, regionId, sortKey, page, updateUrl]);

  // ── Build API query ──
  const queryParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    sort: SORT_OPTIONS[sortKey],
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(sectorId ? { sector_id: sectorId } : {}),
    ...(regionId ? { region_id: regionId } : {}),
  }), [page, sortKey, debouncedSearch, sectorId, regionId]);

  const { data, isLoading, isFetching, isError } = useGetPostsQuery(queryParams);

  const posts = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  // ── Active filter chip lookups ──
  const { data: sectors } = useGetSectorsQuery();
  const { data: regions } = useGetRegionsQuery();
  const activeSector = sectors?.find((s) => s.id === sectorId);
  const activeRegion = regions?.find((r) => r.id === regionId);

  // ── Filter values object for ExploreFilters ──
  const filterValues: ExploreFilterValues = {
    search,
    sectorId,
    regionId,
    sortKey,
  };

  // ── Reset page helper (called when any filter changes) ──
  const resetPage = () => setPage(1);

  // ── Filter change handlers ──
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    resetPage();
  }, []);

  const handleSectorChange = useCallback((id: string) => {
    setSectorId(id);
    resetPage();
  }, []);

  const handleRegionChange = useCallback((id: string) => {
    setRegionId(id);
    resetPage();
  }, []);

  const handleSortChange = useCallback((key: SortKey) => {
    setSortKey(key);
    resetPage();
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Chip clear handlers ──
  const clearSearch = useCallback(() => { setSearch(''); resetPage(); }, []);
  const clearSector = useCallback(() => { setSectorId(''); resetPage(); }, []);
  const clearRegion = useCallback(() => { setRegionId(''); resetPage(); }, []);
  const clearSort = useCallback(() => { setSortKey('latest'); resetPage(); }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      {/* ── Header ── */}
      <Typography
        variant="h1"
        component="h1"
        sx={{ mb: 3, fontSize: { xs: '1.5rem', md: '1.75rem' } }}
      >
        Explore Aspirasi
      </Typography>

      {/* ── Filters ── */}
      <ExploreFilters
        values={filterValues}
        onSearchChange={handleSearchChange}
        onSectorChange={handleSectorChange}
        onRegionChange={handleRegionChange}
        onSortChange={handleSortChange}
      />

      {/* ── Active filter chips ── */}
      <Box sx={{ mt: 2 }}>
        <ActiveFilterChips
          search={debouncedSearch}
          sector={activeSector}
          region={activeRegion}
          sortKey={sortKey}
          onClearSearch={clearSearch}
          onClearSector={clearSector}
          onClearRegion={clearRegion}
          onClearSort={clearSort}
        />
      </Box>

      {/* ── Results ── */}
      <Box sx={{ mt: 3 }}>
        <ExploreResults
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          posts={posts}
        />
      </Box>

      {/* ── Pagination ── */}
      {totalPages > 1 && !isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
            disabled={isFetching}
          />
        </Box>
      )}
    </Container>
  );
}

// ────────────────────────────────────────────
// Sub-component: results — extracted to avoid nested ternaries (SonarQube S3358)
// ────────────────────────────────────────────

interface ExploreResultsProps {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  posts: Post[];
}

function ExploreResults({ isLoading, isError, isFetching, posts }: Readonly<ExploreResultsProps>) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={`skeleton-${i.toString()}`} size={{ xs: 12, md: 6 }}>
            <PostCardSkeleton variant="feed" />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Gagal memuat post. Silakan coba lagi nanti.
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h3" component="p" sx={{ mb: 1 }}>
          Tidak ada aspirasi ditemukan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Coba ubah kata kunci atau filter pencarian Anda.
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={!isFetching} timeout={300}>
      <Grid container spacing={2} sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {posts.map((post) => (
          <Grid key={post.id} size={{ xs: 12, md: 6 }}>
            <PostCard post={post} variant="feed" />
          </Grid>
        ))}
      </Grid>
    </Fade>
  );
}

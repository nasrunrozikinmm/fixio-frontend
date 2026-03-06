'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import FilterListIcon from '@mui/icons-material/FilterList';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import { useGetPostsQuery } from '@/store/api/postApi';
import type { Sector, User } from '@/types';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface SectorFilterSidebarProps {
  /** Currently selected sector ID (single-select for feed filter) */
  selectedSectorId: string | undefined;
  /** Called when a sector is toggled */
  onSectorChange: (sectorId: string | undefined) => void;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * SectorFilterSidebar — Sidebar filter panel for Home page.
 *
 * Displays a list of sectors as checkboxes (single-select radio behavior).
 * Also includes a "Top Kontributor" section derived from popular posts.
 *
 * Sesuai brief-pixel.md:
 * - Filter Sektor: checkbox list per sektor, click → filter feed
 * - Top Kontributor: List 5 user + jumlah post
 * - Reusable: bisa dipakai di Explore sidebar juga
 */
export default function SectorFilterSidebar({
  selectedSectorId,
  onSectorChange,
}: Readonly<SectorFilterSidebarProps>) {
  const { data: sectors, isLoading } = useGetSectorsQuery();

  // Fetch top posts (by vote count) to derive top contributors
  const { data: topPostsData, isLoading: topPostsLoading } = useGetPostsQuery({
    sort: 'vote_count desc',
    status: 'approved',
    limit: 50,
  });

  // Memoize sorted sectors by name
  const sortedSectors = useMemo(() => {
    if (!sectors) return [];
    return [...sectors].sort((a: Sector, b: Sector) => a.name.localeCompare(b.name));
  }, [sectors]);

  // Derive top 5 contributors (unique users with most posts in top-voted set)
  const topContributors = useMemo(() => {
    if (!topPostsData?.data) return [];
    const userMap = new Map<string, { user: User; postCount: number; totalVotes: number }>();

    for (const post of topPostsData.data) {
      if (!post.user) continue;
      const existing = userMap.get(post.user.id);
      if (existing) {
        existing.postCount += 1;
        existing.totalVotes += post.vote_count;
      } else {
        userMap.set(post.user.id, {
          user: post.user,
          postCount: 1,
          totalVotes: post.vote_count,
        });
      }
    }

    return Array.from(userMap.values())
      .sort((a, b) => b.totalVotes - a.totalVotes || b.postCount - a.postCount)
      .slice(0, 5);
  }, [topPostsData]);

  const handleToggle = (sectorId: string) => {
    if (selectedSectorId === sectorId) {
      // Deselect → show all
      onSectorChange(undefined);
    } else {
      onSectorChange(sectorId);
    }
  };

  const handleClearFilter = () => {
    onSectorChange(undefined);
  };

  return (
    <Box>
      {/* ── Sector Filter ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2.5,
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <FilterListIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="body1" fontWeight={600}>
            Filter Sektor
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={`sector-skeleton-${i.toString()}`}
                variant="rounded"
                height={28}
                sx={{ borderRadius: 0.5 }}
              />
            ))}
          </Stack>
        ) : (
          <>
            <FormGroup>
              {sortedSectors.map((sector: Sector) => (
                <FormControlLabel
                  key={sector.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedSectorId === sector.id}
                      onChange={() => handleToggle(sector.id)}
                      sx={{ py: 0.5 }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {sector.name}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0, mb: 0.25 }}
                />
              ))}
            </FormGroup>

            {selectedSectorId && (
              <Button
                size="small"
                onClick={handleClearFilter}
                sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem' }}
              >
                Hapus Filter
              </Button>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* ── Top Kontributor ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          p: 2.5,
          mt: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <EmojiEventsIcon sx={{ fontSize: 20, color: 'warning.main' }} />
          <Typography variant="body1" fontWeight={600}>
            Top Kontributor
          </Typography>
        </Stack>

        {topPostsLoading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack
                key={`contrib-skeleton-${i.toString()}`}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Skeleton variant="circular" width={28} height={28} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={14} />
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : topContributors.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Belum ada kontributor.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {topContributors.map(({ user, postCount, totalVotes }) => (
              <Stack
                key={user.id}
                component={Link}
                href={`/user/${user.id}`}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 1,
                  px: 0.5,
                  py: 0.25,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Avatar
                  src={user.avatar_url}
                  alt={user.name}
                  sx={{ width: 28, height: 28, fontSize: '0.7rem' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                  >
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {postCount} post · {totalVotes} vote
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

'use client';

import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import type { Sector, Region } from '@/types';
import type { SortKey } from '@/store/api/postApi';

// ────────────────────────────────────────────
// Sort display labels
// ────────────────────────────────────────────

const SORT_DISPLAY: Record<SortKey, string> = {
  latest: 'Terbaru',
  popular: 'Populer',
  most_discussed: 'Paling Dibahas',
};

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface ActiveFilterChipsProps {
  search: string;
  sector: Sector | undefined;
  region: Region | undefined;
  sortKey: SortKey;
  onClearSearch: () => void;
  onClearSector: () => void;
  onClearRegion: () => void;
  onClearSort: () => void;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ActiveFilterChips — Removable chips showing currently active filters.
 *
 * Sesuai brief-pixel.md: Chip array with onDelete, warna sesuai sektor.
 * Only renders chips for non-default filter values.
 */
export default function ActiveFilterChips({
  search,
  sector,
  region,
  sortKey,
  onClearSearch,
  onClearSector,
  onClearRegion,
  onClearSort,
}: Readonly<ActiveFilterChipsProps>) {
  const hasAny = search || sector || region || sortKey !== 'latest';

  if (!hasAny) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {search && (
        <Chip
          label={`Pencarian: "${search}"`}
          size="small"
          onDelete={onClearSearch}
          color="primary"
          variant="outlined"
        />
      )}

      {sector && (
        <Chip
          label={`Sektor: ${sector.name}`}
          size="small"
          onDelete={onClearSector}
          color="secondary"
          variant="outlined"
        />
      )}

      {region && (
        <Chip
          label={`Wilayah: ${region.name}`}
          size="small"
          onDelete={onClearRegion}
          variant="outlined"
        />
      )}

      {sortKey !== 'latest' && (
        <Chip
          label={`Urutan: ${SORT_DISPLAY[sortKey]}`}
          size="small"
          onDelete={onClearSort}
          variant="outlined"
        />
      )}
    </Stack>
  );
}

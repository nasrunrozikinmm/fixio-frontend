'use client';

import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import { useGetRegionsQuery } from '@/store/api/regionApi';
import type { Sector, Region } from '@/types';
import type { SortKey } from '@/store/api/postApi';
import type { SelectChangeEvent } from '@mui/material/Select';

// ────────────────────────────────────────────
// Sort options label map
// ────────────────────────────────────────────

const SORT_LABELS: { value: SortKey; label: string }[] = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'popular', label: 'Populer' },
  { value: 'most_discussed', label: 'Paling Dibahas' },
];

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

export interface ExploreFilterValues {
  search: string;
  sectorId: string;      // '' = semua
  regionId: string;      // '' = semua
  sortKey: SortKey;
}

interface ExploreFiltersProps {
  values: ExploreFilterValues;
  onSearchChange: (value: string) => void;
  onSectorChange: (sectorId: string) => void;
  onRegionChange: (regionId: string) => void;
  onSortChange: (sortKey: SortKey) => void;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ExploreFilters — Search bar + inline filter dropdowns for Explore page.
 *
 * Sesuai brief-pixel.md:
 * - Search bar full-width, 48px height, debounce handled by parent
 * - Filter dropdowns inline horizontal: Sektor, Wilayah, Urutan
 */
export default function ExploreFilters({
  values,
  onSearchChange,
  onSectorChange,
  onRegionChange,
  onSortChange,
}: Readonly<ExploreFiltersProps>) {
  const { data: sectors } = useGetSectorsQuery();
  const { data: regions } = useGetRegionsQuery();

  const sortedSectors = useMemo(() => {
    if (!sectors) return [];
    return [...sectors].sort((a: Sector, b: Sector) => a.name.localeCompare(b.name));
  }, [sectors]);

  const sortedRegions = useMemo(() => {
    if (!regions) return [];
    return [...regions].sort((a: Region, b: Region) => a.name.localeCompare(b.name));
  }, [regions]);

  const handleSectorSelect = (e: SelectChangeEvent) => {
    onSectorChange(e.target.value);
  };

  const handleRegionSelect = (e: SelectChangeEvent) => {
    onRegionChange(e.target.value);
  };

  const handleSortSelect = (e: SelectChangeEvent) => {
    onSortChange(e.target.value as SortKey);
  };

  return (
    <Stack spacing={2}>
      {/* ── Search bar ── */}
      <TextField
        placeholder="Cari aspirasi..."
        value={values.search}
        onChange={(e) => onSearchChange(e.target.value)}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: { height: 48 },
          },
        }}
      />

      {/* ── Filter dropdowns row ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        {/* Sektor */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="explore-sector-label">Sektor</InputLabel>
          <Select
            labelId="explore-sector-label"
            value={values.sectorId}
            label="Sektor"
            onChange={handleSectorSelect}
          >
            <MenuItem value="">Semua Sektor</MenuItem>
            {sortedSectors.map((s: Sector) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Wilayah */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="explore-region-label">Wilayah</InputLabel>
          <Select
            labelId="explore-region-label"
            value={values.regionId}
            label="Wilayah"
            onChange={handleRegionSelect}
          >
            <MenuItem value="">Semua Wilayah</MenuItem>
            {sortedRegions.map((r: Region) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Urutan */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="explore-sort-label">Urutan</InputLabel>
          <Select
            labelId="explore-sort-label"
            value={values.sortKey}
            label="Urutan"
            onChange={handleSortSelect}
          >
            {SORT_LABELS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}

'use client';

import Chip from '@mui/material/Chip';
import type { Sector } from '@/types';

/**
 * Palet warna subtle per sektor — rotasi berdasarkan index karakter pertama slug.
 * Sesuai brief-shaper: "Chip/pill berwarna (tiap sektor warna berbeda tapi subtle)".
 *
 * Reusable: PostCard, DetailPost, Explore filter chips, Moderation queue.
 */
const SECTOR_PALETTE: Array<{ bg: string; text: string }> = [
  { bg: '#DBEAFE', text: '#1E40AF' }, // biru
  { bg: '#D1FAE5', text: '#065F46' }, // hijau
  { bg: '#FEF3C7', text: '#92400E' }, // kuning
  { bg: '#FCE7F3', text: '#9D174D' }, // pink
  { bg: '#EDE9FE', text: '#5B21B6' }, // ungu
  { bg: '#FFEDD5', text: '#9A3412' }, // oren
  { bg: '#E0F2FE', text: '#0369A1' }, // cyan
  { bg: '#F3E8FF', text: '#7C3AED' }, // lavender
];

function getSectorColor(sectorId: string) {
  // Deterministic: hash codePoint pertama dari ID supaya konsisten
  let hash = 0;
  for (let i = 0; i < sectorId.length; i++) {
    hash = (hash + (sectorId.codePointAt(i) ?? 0)) % SECTOR_PALETTE.length;
  }
  return SECTOR_PALETTE[hash];
}

interface SectorBadgeProps {
  /** Objek Sector — minimal { id, name } */
  sector: Pick<Sector, 'id' | 'name'>;
  /** Ukuran chip */
  size?: 'small' | 'medium';
  /** Callback saat chip diklik (mis. filter di Explore) */
  onClick?: () => void;
}

/**
 * SectorBadge — Chip warna sesuai sektor.
 *
 * Konteks pemakaian:
 * - PostCard: badge sektor di atas judul.
 * - DetailPost: di header post.
 * - Explore: active filter chips (dengan onClick + onDelete).
 */
export default function SectorBadge({ sector, size = 'small', onClick }: Readonly<SectorBadgeProps>) {
  const color = getSectorColor(sector.id);

  return (
    <Chip
      label={sector.name}
      size={size}
      clickable={Boolean(onClick)}
      onClick={onClick}
      sx={{
        bgcolor: color.bg,
        color: color.text,
        fontWeight: 600,
        letterSpacing: 0.2,
        border: 'none',
        '&:hover': onClick
          ? { filter: 'brightness(0.95)' }
          : undefined,
      }}
    />
  );
}

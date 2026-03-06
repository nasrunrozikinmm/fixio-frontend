'use client';

import Chip from '@mui/material/Chip';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import type { Region } from '@/types';

interface RegionBadgeProps {
  /** Objek Region — minimal { id, name } */
  region: Pick<Region, 'id' | 'name'>;
  /** Ukuran chip */
  size?: 'small' | 'medium';
  /** Callback saat chip diklik (mis. filter di Explore) */
  onClick?: () => void;
}

/**
 * RegionBadge — Chip outline netral untuk wilayah.
 * Sesuai brief-shaper: "Chip/pill outline, warna netral."
 *
 * Konteks pemakaian:
 * - PostCard: badge wilayah di samping badge sektor.
 * - DetailPost: di header post.
 * - Explore: active filter chips.
 * - Moderation queue: reviewer melihat wilayah target.
 */
export default function RegionBadge({ region, size = 'small', onClick }: Readonly<RegionBadgeProps>) {
  return (
    <Chip
      icon={<PlaceOutlinedIcon sx={{ fontSize: 14 }} />}
      label={region.name}
      size={size}
      variant="outlined"
      clickable={Boolean(onClick)}
      onClick={onClick}
      sx={{
        color: 'text.secondary',
        borderColor: 'divider',
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: 'text.secondary',
        },
        '&:hover': onClick
          ? { borderColor: 'text.secondary' }
          : undefined,
      }}
    />
  );
}

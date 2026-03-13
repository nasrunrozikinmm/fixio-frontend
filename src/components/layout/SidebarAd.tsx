'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface SidebarAdProps {
  /** Compact variant hides CTA button and uses smaller padding */
  variant?: 'default' | 'compact';
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * SidebarAd — Placeholder ad card for the right sidebar.
 *
 * MVP placeholder — replace with real ad integration later.
 * Uses "Sponsored" label for transparency.
 */
export default function SidebarAd({ variant = 'default' }: Readonly<SidebarAdProps>) {
  const isCompact = variant === 'compact';

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        p: isCompact ? 1.5 : 2,
        overflow: 'hidden',
      }}
    >
      {/* Sponsored label */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontWeight: 600,
          mb: 1,
          display: 'block',
        }}
      >
        Sponsored
      </Typography>

      {/* Image placeholder */}
      <Box
        sx={{
          width: '100%',
          height: isCompact ? 80 : 120,
          bgcolor: 'action.hover',
          borderRadius: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: isCompact ? 1 : 1.5,
        }}
      >
        <CampaignOutlinedIcon sx={{ fontSize: isCompact ? 28 : 36, color: 'text.disabled' }} />
      </Box>

      {/* Headline */}
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          fontSize: isCompact ? '0.75rem' : '0.8125rem',
          lineHeight: 1.4,
          mb: isCompact ? 0.5 : 1,
        }}
      >
        Ruang iklan tersedia
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.7rem', lineHeight: 1.4, display: 'block' }}
      >
        Tempatkan iklan Anda di sini untuk menjangkau audiens yang peduli kebijakan publik.
      </Typography>

      {/* CTA (default only) */}
      {!isCompact && (
        <Button
          size="small"
          variant="outlined"
          fullWidth
          sx={{
            mt: 1.5,
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
          href="mailto:ads@fixio.id"
        >
          Hubungi Kami
        </Button>
      )}
    </Box>
  );
}

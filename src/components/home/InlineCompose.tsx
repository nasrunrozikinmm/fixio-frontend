'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';

// ────────────────────────────────────────────
// Quick-action config
// ────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Kritik', icon: <ReportProblemOutlinedIcon sx={{ fontSize: 18 }} />, color: 'error.main' },
  { label: 'Solusi', icon: <LightbulbOutlinedIcon sx={{ fontSize: 18 }} />, color: 'success.main' },
  { label: 'Foto', icon: <ImageOutlinedIcon sx={{ fontSize: 18 }} />, color: 'info.main' },
] as const;

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * InlineCompose — Quora-style compose bar at the top of the feed.
 *
 * - Shows user avatar + placeholder text + pencil icon
 * - Quick-action buttons: Kritik, Solusi, Foto
 * - Click → navigate to /post/new (if authenticated)
 * - Click when unauthenticated → open login modal
 */
export default function InlineCompose() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    router.push('/post/new');
  }, [isAuthenticated, openLoginModal, router]);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'divider',
      }}
    >
      {/* ── Main compose bar ── */}
      <ButtonBase
        onClick={handleClick}
        aria-label="Buat aspirasi baru"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          width: '100%',
          px: 2,
          py: 1.5,
          textAlign: 'left',
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Avatar
          src={user?.avatar_url}
          alt={user?.name ?? 'User'}
          sx={{ width: 36, height: 36, fontSize: '0.875rem' }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </Avatar>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            flex: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          Apa yang ingin Anda sampaikan?
        </Typography>

        <CreateOutlinedIcon
          sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }}
        />
      </ButtonBase>

      {/* ── Quick actions row ── */}
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.75,
        }}
      >
        {QUICK_ACTIONS.map(({ label, icon, color }) => (
          <Button
            key={label}
            size="small"
            startIcon={icon}
            onClick={handleClick}
            sx={{
              textTransform: 'none',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
              borderRadius: 5,
              px: 1.5,
              '&:hover': { bgcolor: 'action.hover', color },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}

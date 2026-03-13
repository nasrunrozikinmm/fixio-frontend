'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from '@/lib/ThemeRegistry';

/**
 * ThemeToggle — Light/Dark mode switch.
 * Reads and toggles theme mode via ThemeModeContext.
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
      <IconButton
        onClick={toggleTheme}
        size="small"
        aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        sx={{ color: 'text.secondary' }}
      >
        {isDark ? (
          <LightModeOutlinedIcon sx={{ fontSize: 22 }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ fontSize: 22 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}

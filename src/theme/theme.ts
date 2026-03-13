'use client';

import { createTheme, type PaletteMode, type Theme } from '@mui/material/styles';

// ────────────────────────────────────────────
// Shared design tokens
// ────────────────────────────────────────────

const SHARED_PALETTE = {
  primary: {
    main: '#1B3A5C',
    light: '#2D5F8A',
    dark: '#0F2640',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#2E7D4F',
    light: '#E8F5E9',
    dark: '#1B5E35',
    contrastText: '#FFFFFF',
  },
  error: { main: '#EF4444', light: '#FEE2E2' },
  warning: { main: '#F59E0B', light: '#FFF9C4' },
  success: { main: '#10B981', light: '#D1FAE5' },
  info: { main: '#2E69FF', light: '#DBEAFE' },
} as const;

const TYPOGRAPHY = {
  fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontSize: '1.625rem', fontWeight: 700, lineHeight: 1.3 },
  h2: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h3: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.4 },
  body1: { fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.7 },
  body2: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },
  button: { fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none' as const },
} as const;

// ────────────────────────────────────────────
// Mode-specific palettes
// ────────────────────────────────────────────

const LIGHT_PALETTE = {
  ...SHARED_PALETTE,
  mode: 'light' as const,
  background: { default: '#F1F2F2', paper: '#FFFFFF' },
  text: { primary: '#282828', secondary: '#636466' },
  divider: '#DEE0E1',
};

const DARK_PALETTE = {
  ...SHARED_PALETTE,
  mode: 'dark' as const,
  primary: { main: '#5B8ABF', light: '#7EADD4', dark: '#3A6A9B', contrastText: '#FFFFFF' },
  secondary: { main: '#4CAF7D', light: '#1B3326', dark: '#2E8B57', contrastText: '#FFFFFF' },
  error: { main: '#F87171', light: '#3B1C1C' },
  warning: { main: '#FBBF24', light: '#3B3010' },
  success: { main: '#34D399', light: '#1A3329' },
  info: { main: '#60A5FA', light: '#1C2D4A' },
  background: { default: '#1A1A1B', paper: '#272729' },
  text: { primary: '#D7DADC', secondary: '#818384' },
  divider: '#343536',
};

// ────────────────────────────────────────────
// Component overrides (theme-aware via callback)
// ────────────────────────────────────────────

function getComponentOverrides(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 20, padding: '6px 16px', fontWeight: 600 },
        containedSecondary: {
          '&:hover': { backgroundColor: isDark ? '#2E8B57' : '#1B5E35' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: 8,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: isDark ? '#2D2D2F' : '#FAFAFA',
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation0: { boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 500, fontSize: '0.75rem' },
        sizeSmall: { height: 22 },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 12 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 20 } },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 600, fontSize: '0.8125rem' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
  };
}

// ────────────────────────────────────────────
// Shadows (Quora-style: mostly none, sparse elevations)
// ────────────────────────────────────────────

const SHADOWS: Theme['shadows'] = [
  'none',
  'none',
  'none',
  '0 1px 3px rgba(0,0,0,0.08)',
  '0 2px 6px rgba(0,0,0,0.08)',
  '0 4px 12px rgba(0,0,0,0.1)',
  '0 4px 12px rgba(0,0,0,0.1)',
  '0 6px 16px rgba(0,0,0,0.1)',
  '0 8px 20px rgba(0,0,0,0.1)',
  'none', 'none', 'none', 'none',
  'none', 'none', 'none', 'none',
  'none', 'none', 'none', 'none',
  'none', 'none', 'none', 'none',
];

// ────────────────────────────────────────────
// Theme factory
// ────────────────────────────────────────────

export function getTheme(mode: PaletteMode): Theme {
  return createTheme({
    palette: mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE,
    typography: TYPOGRAPHY,
    shape: { borderRadius: 8 },
    shadows: SHADOWS,
    components: getComponentOverrides(mode),
  });
}

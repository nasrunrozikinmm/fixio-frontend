'use client';

import { createTheme } from '@mui/material/styles';

// Fixio Design System — dari brief-shaper.md
const theme = createTheme({
  palette: {
    primary: {
      main: '#1B3A5C',    // Navy — trust
      light: '#2D5F8A',
      dark: '#0F2640',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2E7D4F',    // Hijau — solusi/positif
      light: '#E8F5E9',
      dark: '#1B5E35',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',    // Rejected, downvote active, danger
      light: '#FEE2E2',
    },
    warning: {
      main: '#F59E0B',    // Pending
      light: '#FFF9C4',
    },
    success: {
      main: '#10B981',    // Approved
      light: '#D1FAE5',
    },
    info: {
      main: '#3B82F6',    // Info, link
      light: '#DBEAFE',
    },
    background: {
      default: '#FAFBFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6B7280',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.75rem',  // 28px
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '1.375rem', // 22px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',     // 16px
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',  // 12px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      textTransform: 'none', // Tidak capitalize
    },
  },
  shape: {
    borderRadius: 8,         // Default: Card, Input, Button
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',    // shadow-sm (card default)
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 4px 6px rgba(0,0,0,0.07)',    // shadow-md (card hover, dropdown)
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 6px 12px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.08)',
    '0 10px 25px rgba(0,0,0,0.1)',   // shadow-lg (modal)
    '0 12px 28px rgba(0,0,0,0.1)',
    '0 14px 32px rgba(0,0,0,0.1)',
    '0 16px 36px rgba(0,0,0,0.12)',
    '0 18px 40px rgba(0,0,0,0.12)',
    '0 20px 44px rgba(0,0,0,0.12)',
    '0 22px 48px rgba(0,0,0,0.14)',
    '0 24px 52px rgba(0,0,0,0.14)',
    '0 26px 56px rgba(0,0,0,0.14)',
    '0 28px 60px rgba(0,0,0,0.16)',
    '0 30px 64px rgba(0,0,0,0.16)',
    '0 32px 68px rgba(0,0,0,0.16)',
    '0 34px 72px rgba(0,0,0,0.18)',
    '0 36px 76px rgba(0,0,0,0.18)',
    '0 38px 80px rgba(0,0,0,0.18)',
    '0 40px 84px rgba(0,0,0,0.2)',
    '0 42px 88px rgba(0,0,0,0.2)',
    '0 44px 92px rgba(0,0,0,0.2)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 600,
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#1B5E35',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid #E5E7EB',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        sizeSmall: {
          height: 24,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
  },
});

export default theme;

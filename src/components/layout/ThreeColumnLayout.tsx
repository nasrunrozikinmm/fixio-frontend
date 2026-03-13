'use client';

import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { LeftSidebar, SectorFilterSidebar } from '@/components/home';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const LEFT_W = 200;
const RIGHT_W = 280;
const NAVBAR_H = 52;

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface ThreeColumnLayoutProps {
  /** Center column content */
  children: ReactNode;
  /** Right sidebar content — rendered in sticky container */
  rightSidebar?: ReactNode;
  /** Max width of center column (default: 620) */
  centerMaxWidth?: number;
  /** Active sector filter (synced with LeftSidebar) */
  selectedSectorId?: string;
  /** Sector change handler (enables filter chips in LeftSidebar) */
  onSectorChange?: (sectorId: string | undefined) => void;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ThreeColumnLayout — Reusable 3-column page shell.
 *
 * Layout (desktop ≥ 900px / md):
 * - Left:   LeftSidebar (200px, sticky nav + sector chips)
 * - Center: children (flex: 1, max-width configurable)
 * - Right:  rightSidebar (280px, sticky)
 *
 * Mobile (< 900px):
 * - Single column (center only)
 * - FAB opens sector filter drawer
 */
export default function ThreeColumnLayout({
  children,
  rightSidebar,
  centerMaxWidth = 620,
  selectedSectorId,
  onSectorChange,
}: Readonly<ThreeColumnLayoutProps>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  return (
    <>
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 1.5, md: 2 },
          pt: { xs: 1, md: 0 },
          pb: { xs: 6, md: 0 },
          display: 'flex',
          gap: 3,
          /* Desktop: fill viewport below navbar, prevent page-level scroll */
          height: { md: `calc(100vh - ${NAVBAR_H}px)` },
        }}
      >
        {/* ── Left Sidebar (desktop) ── */}
        {!isMobile && (
          <Box
            sx={{
              width: LEFT_W,
              flexShrink: 0,
              overflowY: 'auto',
              py: 2,
              '&::-webkit-scrollbar': { width: 0 },
            }}
          >
            <LeftSidebar
              selectedSectorId={selectedSectorId}
              onSectorChange={onSectorChange}
            />
          </Box>
        )}

        {/* ── Center Content (scrollable) ── */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: centerMaxWidth,
            overflowY: { md: 'auto' },
            py: { xs: 1, md: 2 },
            scrollbarWidth: 'none',          /* Firefox */
            '&::-webkit-scrollbar': { width: 0 }, /* Chrome/Safari */
          }}
        >
          {children}
        </Box>

        {/* ── Right Sidebar (desktop) ── */}
        {!isMobile && rightSidebar && (
          <Box
            sx={{
              width: RIGHT_W,
              flexShrink: 0,
              overflowY: 'auto',
              py: 2,
              scrollbarWidth: 'none',          /* Firefox */
              '&::-webkit-scrollbar': { width: 0 }, /* Chrome/Safari */
            }}
          >
            {rightSidebar}
          </Box>
        )}
      </Box>

      {/* ── Mobile: Filter FAB + Drawer ── */}
      {isMobile && onSectorChange && (
        <>
          <IconButton
            onClick={toggleDrawer}
            aria-label="Filter sektor"
            sx={{
              position: 'fixed',
              bottom: 72,
              right: 16,
              zIndex: (t) => t.zIndex.fab,
              bgcolor: 'primary.main',
              color: '#FFFFFF',
              width: 44,
              height: 44,
              boxShadow: 2,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer}
            slotProps={{
              paper: { sx: { width: RIGHT_W + 16, p: 2, pt: 1 } },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton onClick={toggleDrawer} aria-label="Tutup filter" size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <SectorFilterSidebar
              selectedSectorId={selectedSectorId}
              onSectorChange={onSectorChange}
            />
          </Drawer>
        </>
      )}
    </>
  );
}

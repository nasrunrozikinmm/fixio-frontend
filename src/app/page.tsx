'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { HeroSection, PostFeed, SectorFilterSidebar } from '@/components/home';

/**
 * Home page — Landing page Fixio.
 *
 * Layout (brief-pixel.md):
 * - Hero section (full width, gradient)
 * - 2 kolom: Feed (kiri, flex-grow) + Sidebar (kanan, 280px)
 * - Mobile: Sidebar → Drawer, toggle via floating filter button
 */

const SIDEBAR_WIDTH = 280;

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sector filter state — lifted up so PostFeed & SectorFilterSidebar share it
  const [selectedSectorId, setSelectedSectorId] = useState<string | undefined>(undefined);

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSectorChange = useCallback((sectorId: string | undefined) => {
    setSelectedSectorId(sectorId);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Feed + Sidebar ── */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'flex-start',
          }}
        >
          {/* ── Left: Feed ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <PostFeed sectorId={selectedSectorId} />
          </Box>

          {/* ── Right: Sidebar (desktop only) ── */}
          {!isMobile && (
            <Box
              sx={{
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                position: 'sticky',
                top: 80, // Below Navbar
              }}
            >
              <SectorFilterSidebar
                selectedSectorId={selectedSectorId}
                onSectorChange={handleSectorChange}
              />
            </Box>
          )}
        </Box>
      </Container>

      {/* ── Mobile: Floating filter button + Drawer ── */}
      {isMobile && (
        <>
          <IconButton
            onClick={toggleDrawer}
            aria-label="Filter sektor"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: (t) => t.zIndex.fab,
              bgcolor: 'primary.main',
              color: '#FFFFFF',
              width: 52,
              height: 52,
              boxShadow: 4,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <FilterListIcon />
          </IconButton>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer}
            slotProps={{
              paper: { sx: { width: SIDEBAR_WIDTH + 16, p: 2, pt: 1 } },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton onClick={toggleDrawer} aria-label="Tutup filter" size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            <SectorFilterSidebar
              selectedSectorId={selectedSectorId}
              onSectorChange={handleSectorChange}
            />
          </Drawer>
        </>
      )}
    </>
  );
}

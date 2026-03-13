'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import { PostFeed, InlineCompose } from '@/components/home';
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout';
import TrendingSidebar from '@/components/layout/TrendingSidebar';
import SidebarAd from '@/components/layout/SidebarAd';

/**
 * Home page — Quora-style 3-column layout.
 *
 * Uses ThreeColumnLayout shell.
 * Right sidebar: Trending → SidebarAd → Top Kontributor
 */
export default function Home() {
  const [selectedSectorId, setSelectedSectorId] = useState<string | undefined>(undefined);

  const handleSectorChange = useCallback((sectorId: string | undefined) => {
    setSelectedSectorId(sectorId);
  }, []);

  return (
    <ThreeColumnLayout
      selectedSectorId={selectedSectorId}
      onSectorChange={handleSectorChange}
      rightSidebar={
        <TrendingSidebar>
          <SidebarAd />
        </TrendingSidebar>
      }
    >
      <Box sx={{ mb: 2 }}>
        <InlineCompose />
      </Box>
      <PostFeed sectorId={selectedSectorId} />
    </ThreeColumnLayout>
  );
}

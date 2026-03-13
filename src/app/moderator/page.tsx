'use client';

import { useState } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardSidebar, {
  MODERATOR_MENU,
  DRAWER_WIDTH,
} from '@/components/moderation/DashboardSidebar';
import ModerationQueue from '@/components/moderation/ModerationQueue';
import ModerationHistory from '@/components/moderation/ModerationHistory';
import ReportManager from '@/components/moderation/ReportManager';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * /moderator — Dashboard moderasi.
 * Route guard: hanya moderator + admin.
 * Tabs: Antrian Review | Riwayat
 */
export default function ModeratorPage() {
  const { isModerator, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  // Role guard — redirect non-moderators
  useEffect(() => {
    if (!loading && !isModerator) {
      router.replace('/');
    }
  }, [loading, isModerator, router]);

  return (
    <AuthGuard>
      <Box
        sx={{
          display: 'flex',
          height: { xs: 'auto', md: 'calc(100vh - 52px)' },
          minHeight: { xs: 'calc(100vh - 48px)' },
        }}
      >
        <DashboardSidebar
          title="Moderasi"
          items={MODERATOR_MENU}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            overflowY: { md: 'auto' },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { width: 0 },
          }}
        >
          {/* Mobile menu toggle */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ mb: 2 }}
              aria-label="Menu moderasi"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Tab content */}
          {activeTab === 'main' && <ModerationQueue />}
          {activeTab === 'reports' && <ReportManager />}
          {activeTab === 'history' && <ModerationHistory />}
        </Box>
      </Box>
    </AuthGuard>
  );
}

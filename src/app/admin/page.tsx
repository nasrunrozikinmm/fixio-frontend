'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardSidebar, {
  ADMIN_MENU,
  DRAWER_WIDTH,
} from '@/components/moderation/DashboardSidebar';
import StatsCards from '@/components/admin/StatsCards';
import UserTable from '@/components/admin/UserTable';
import SectorManager from '@/components/admin/SectorManager';
import RegionManager from '@/components/admin/RegionManager';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

/**
 * /admin — Dashboard admin.
 * Route guard: hanya administrator.
 * Tabs: Overview | Users | Sectors | Regions
 */
export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  // Role guard — redirect non-admins
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [loading, isAdmin, router]);

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <DashboardSidebar
          title="Admin"
          items={ADMIN_MENU}
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
          }}
        >
          {/* Mobile menu toggle */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ mb: 2 }}
              aria-label="Menu admin"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Tab content */}
          {activeTab === 'main' && <StatsCards />}
          {activeTab === 'users' && <UserTable />}
          {activeTab === 'sectors' && <SectorManager />}
          {activeTab === 'regions' && <RegionManager />}
        </Box>
      </Box>
    </AuthGuard>
  );
}

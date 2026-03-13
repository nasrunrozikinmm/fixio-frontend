'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import QueueIcon from '@mui/icons-material/AssignmentOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import MapIcon from '@mui/icons-material/MapOutlined';

const DRAWER_WIDTH = 260;

export interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

// ─── Predefined menus ───────────────────────────────────────

export const MODERATOR_MENU: SidebarItem[] = [
  { label: 'Antrian Review', icon: <QueueIcon />, path: '/moderator' },
  { label: 'Riwayat', icon: <HistoryIcon />, path: '/moderator?tab=history' },
];

export const ADMIN_MENU: SidebarItem[] = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/admin' },
  { label: 'Kelola User', icon: <PeopleIcon />, path: '/admin?tab=users' },
  { label: 'Kelola Sektor', icon: <CategoryIcon />, path: '/admin?tab=sectors' },
  { label: 'Kelola Wilayah', icon: <MapIcon />, path: '/admin?tab=regions' },
];

// ─── Component ──────────────────────────────────────────────

interface DashboardSidebarProps {
  title: string;
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function DashboardSidebar({
  title,
  items,
  activeTab,
  onTabChange,
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (item: SidebarItem) => {
    // Extract tab from path query or use path as key
    const url = new URL(item.path, 'http://localhost');
    const tab = url.searchParams.get('tab') || 'main';
    onTabChange(tab);
    router.push(item.path);
    if (isMobile && onMobileClose) onMobileClose();
  };

  const isActive = (item: SidebarItem) => {
    const url = new URL(item.path, 'http://localhost');
    const tab = url.searchParams.get('tab') || 'main';
    return activeTab === tab;
  };

  const drawerContent = (
    <Box>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          {title}
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.label}
            selected={isActive(item)}
            onClick={() => handleClick(item)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.50',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.badge && item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="error" max={99}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          top: { xs: 48, md: 52 },
          height: { xs: 'calc(100% - 48px)', md: 'calc(100% - 52px)' },
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export { DRAWER_WIDTH };

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import QueueIcon from '@mui/icons-material/AssignmentOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import MapIcon from '@mui/icons-material/MapOutlined';
import FlagIcon from '@mui/icons-material/FlagOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from '@/lib/ThemeRegistry';
import { useAuth } from '@/hooks/useAuth';

const DRAWER_WIDTH = 260;

export interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  /** Optional group header shown above this item */
  group?: string;
}

// ─── Predefined menus ───────────────────────────────────────

export const MODERATOR_MENU: SidebarItem[] = [
  { label: 'Antrian Review', icon: <QueueIcon />, path: '/moderator', group: 'MODERASI' },
  { label: 'Laporan', icon: <FlagIcon />, path: '/moderator?tab=reports' },
  { label: 'Riwayat', icon: <HistoryIcon />, path: '/moderator?tab=history' },
];

export const ADMIN_MENU: SidebarItem[] = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/admin', group: 'DASHBOARD' },
  { label: 'Kelola User', icon: <PeopleIcon />, path: '/admin?tab=users', group: 'MANAJEMEN' },
  { label: 'Laporan', icon: <FlagIcon />, path: '/admin?tab=reports' },
  { label: 'Kelola Sektor', icon: <CategoryIcon />, path: '/admin?tab=sectors', group: 'SISTEM' },
  { label: 'Kelola Wilayah', icon: <MapIcon />, path: '/admin?tab=regions' },
];

// ─── Helpers ────────────────────────────────────────────────

function getTabFromPath(path: string): string {
  const url = new URL(path, 'http://localhost');
  return url.searchParams.get('tab') || 'main';
}

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
  const { isDark, toggleTheme } = useThemeMode();
  const { user } = useAuth();

  const handleClick = (item: SidebarItem) => {
    const tab = getTabFromPath(item.path);
    onTabChange(tab);
    router.push(item.path);
    if (isMobile && onMobileClose) onMobileClose();
  };

  const isActive = (item: SidebarItem) => activeTab === getTabFromPath(item.path);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Logo + title ── */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Image
            src="/high-transparent-logo.png"
            alt="Fixio"
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
          />
          <Typography variant="h6" fontWeight={700} color="primary">
            {title}
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* ── Menu items with group headers ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pt: 1 }}>
        <List disablePadding>
          {items.map((item) => (
            <Box key={item.label}>
              {/* Group header */}
              {item.group && (
                <Typography
                  variant="overline"
                  sx={{
                    px: 1.5,
                    pt: 2,
                    pb: 0.5,
                    display: 'block',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'text.disabled',
                  }}
                >
                  {item.group}
                </Typography>
              )}
              <ListItemButton
                selected={isActive(item)}
                onClick={() => handleClick(item)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  {item.badge && item.badge > 0 ? (
                    <Badge badgeContent={item.badge} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </Box>
          ))}
        </List>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* ── Footer: user profile + dark mode toggle ── */}
      <Box sx={{ px: 2, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Avatar
              src={user?.avatar_url}
              alt={user?.name}
              sx={{ width: 34, height: 34, fontSize: '0.85rem' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                sx={{ maxWidth: 120 }}
              >
                {user?.name ?? 'Admin'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {user?.role ?? 'administrator'}
              </Typography>
            </Box>
          </Stack>
          <Tooltip title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
            <IconButton
              size="small"
              onClick={toggleTheme}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              sx={{ color: 'text.secondary' }}
            >
              {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    borderRight: '1px solid',
    borderColor: 'divider',
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ '& .MuiDrawer-paper': drawerPaperSx }}
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
          ...drawerPaperSx,
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

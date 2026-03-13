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
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from '@/lib/ThemeRegistry';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutMutation } from '@/store/api/authApi';

// ─── Dark sidebar palette ───────────────────────────────────

const SIDEBAR_BG = '#0F1923';
const SIDEBAR_BG_HOVER = 'rgba(255,255,255,0.06)';
const SIDEBAR_TEXT = 'rgba(255,255,255,0.85)';
const SIDEBAR_TEXT_MUTED = 'rgba(255,255,255,0.4)';
const SIDEBAR_DIVIDER = 'rgba(255,255,255,0.08)';
const SIDEBAR_ACTIVE_BG = '#2E7D4F';
const SIDEBAR_ACTIVE_HOVER = '#266B43';

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
  const [logout] = useLogoutMutation();

  const handleClick = (item: SidebarItem) => {
    const tab = getTabFromPath(item.path);
    onTabChange(tab);
    router.push(item.path);
    if (isMobile && onMobileClose) onMobileClose();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push('/');
    } catch {
      // error silenced
    }
  };

  const isActive = (item: SidebarItem) => activeTab === getTabFromPath(item.path);

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: SIDEBAR_BG,
        color: SIDEBAR_TEXT,
      }}
    >
      {/* ── Logo + title ── */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Image
              src="/high-transparent-logo.png"
              alt="Fixio"
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}
            >
              Fixio
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: SIDEBAR_TEXT_MUTED, lineHeight: 1 }}>
              {title} Panel
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Divider ── */}
      <Box sx={{ mx: 2, borderBottom: `1px solid ${SIDEBAR_DIVIDER}` }} />

      {/* ── Menu items with group headers ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pt: 1.5 }}>
        <List disablePadding>
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Box key={item.label}>
                {/* Group header */}
                {item.group && (
                  <Typography
                    sx={{
                      px: 1,
                      pt: 2.5,
                      pb: 0.75,
                      display: 'block',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: SIDEBAR_TEXT_MUTED,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.group}
                  </Typography>
                )}
                <ListItemButton
                  selected={active}
                  onClick={() => handleClick(item)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.25,
                    py: 0.85,
                    px: 1.5,
                    color: active ? '#fff' : SIDEBAR_TEXT,
                    bgcolor: active ? SIDEBAR_ACTIVE_BG : 'transparent',
                    '&:hover': {
                      bgcolor: active ? SIDEBAR_ACTIVE_HOVER : SIDEBAR_BG_HOVER,
                    },
                    '&.Mui-selected': {
                      bgcolor: SIDEBAR_ACTIVE_BG,
                      '&:hover': { bgcolor: SIDEBAR_ACTIVE_HOVER },
                    },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 34,
                      color: active ? '#fff' : SIDEBAR_TEXT_MUTED,
                      '& svg': { fontSize: 20 },
                    }}
                  >
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
                    primaryTypographyProps={{
                      fontSize: '0.82rem',
                      fontWeight: active ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* ── Divider ── */}
      <Box sx={{ mx: 2, borderBottom: `1px solid ${SIDEBAR_DIVIDER}` }} />

      {/* ── Footer: user profile + actions ── */}
      <Box sx={{ px: 2, py: 2 }}>
        {/* User info */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <Avatar
            src={user?.avatar_url}
            alt={user?.name}
            sx={{
              width: 36,
              height: 36,
              fontSize: '0.85rem',
              bgcolor: SIDEBAR_ACTIVE_BG,
              color: '#fff',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#fff',
                lineHeight: 1.3,
              }}
              noWrap
            >
              {user?.name ?? 'Admin'}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.68rem',
                color: SIDEBAR_TEXT_MUTED,
                textTransform: 'capitalize',
              }}
            >
              {user?.role ?? 'administrator'}
            </Typography>
          </Box>
        </Stack>

        {/* Action buttons */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
            <IconButton
              size="small"
              onClick={toggleTheme}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              sx={{
                color: SIDEBAR_TEXT_MUTED,
                '&:hover': { color: '#fff', bgcolor: SIDEBAR_BG_HOVER },
              }}
            >
              {isDark ? (
                <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton
              size="small"
              onClick={handleLogout}
              aria-label="Logout"
              sx={{
                color: SIDEBAR_TEXT_MUTED,
                '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.1)' },
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    border: 'none',
    bgcolor: SIDEBAR_BG,
    backgroundImage: 'none',
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

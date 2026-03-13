'use client';

import { usePathname, useRouter } from 'next/navigation';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Badge from '@mui/material/Badge';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';

// ────────────────────────────────────────────
// Route config
// ────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  requiresAuth?: boolean;
}

/**
 * MobileBottomNav — Quora-style bottom navigation bar.
 *
 * Tabs: Home, Explore, +Post, Notifications, Profile
 * Visible only on mobile (xs/sm), hidden on md+.
 */
export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const navItems: NavItem[] = [
    {
      label: 'Beranda',
      path: '/',
      icon: <HomeOutlinedIcon />,
      activeIcon: <HomeIcon />,
    },
    {
      label: 'Explore',
      path: '/explore',
      icon: <ExploreOutlinedIcon />,
      activeIcon: <ExploreIcon />,
    },
    {
      label: 'Post',
      path: '/post/new',
      icon: <AddCircleOutlineIcon sx={{ fontSize: 28 }} />,
      activeIcon: <AddCircleOutlineIcon sx={{ fontSize: 28 }} />,
      requiresAuth: true,
    },
    {
      label: 'Notifikasi',
      path: '/notifications',
      icon: (
        <Badge color="error" variant="dot" invisible={false}
          sx={{ '& .MuiBadge-badge': { top: 2, right: 2, minWidth: 6, height: 6 } }}
        >
          <NotificationsNoneIcon />
        </Badge>
      ),
      activeIcon: (
        <Badge color="error" variant="dot" invisible={false}
          sx={{ '& .MuiBadge-badge': { top: 2, right: 2, minWidth: 6, height: 6 } }}
        >
          <NotificationsIcon />
        </Badge>
      ),
      requiresAuth: true,
    },
    {
      label: 'Profil',
      path: user ? `/user/${user.id}` : '/profile',
      icon: <PersonOutlineIcon />,
      activeIcon: <PersonIcon />,
      requiresAuth: true,
    },
  ];

  // Determine active tab index
  const activeIndex = navItems.findIndex((item) => {
    if (item.path === '/') return pathname === '/';
    return pathname.startsWith(item.path);
  });

  const handleNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    const item = navItems[newValue];
    if (!item) return;

    if (item.requiresAuth && !isAuthenticated) {
      openLoginModal();
      return;
    }

    router.push(item.path);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        display: { xs: 'block', md: 'none' },
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <BottomNavigation
        value={activeIndex >= 0 ? activeIndex : false}
        onChange={handleNavChange}
        showLabels
        sx={{
          height: 56,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            px: 0.5,
            py: 0.75,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.625rem',
            mt: 0.25,
            '&.Mui-selected': {
              fontSize: '0.625rem',
              fontWeight: 600,
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={activeIndex >= 0 && navItems[activeIndex]?.path === item.path ? item.activeIcon : item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

'use client';

import { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import type { Sector } from '@/types';

// ────────────────────────────────────────────
// Nav items
// ────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  authRequired?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Beranda', path: '/', icon: <HomeOutlinedIcon />, activeIcon: <HomeIcon /> },
  { label: 'Mengikuti', path: '/?tab=following', icon: <PeopleAltOutlinedIcon />, activeIcon: <PeopleAltIcon />, authRequired: true },
  { label: 'Explore', path: '/explore', icon: <ExploreOutlinedIcon />, activeIcon: <ExploreIcon /> },
  { label: 'Bookmark', path: '/bookmarks', icon: <BookmarkBorderOutlinedIcon />, activeIcon: <BookmarkIcon />, authRequired: true },
  { label: 'Notifikasi', path: '/notifications', icon: <NotificationsNoneIcon />, activeIcon: <NotificationsIcon />, authRequired: true },
];

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface LeftSidebarProps {
  selectedSectorId?: string;
  onSectorChange?: (sectorId: string | undefined) => void;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * LeftSidebar — Quora-style navigation sidebar.
 *
 * Contains:
 * - Primary nav links (Beranda, Mengikuti, Explore, Bookmark, Notifikasi)
 * - "Buat Post" action
 * - Sector filter chips
 */
export default function LeftSidebar({ selectedSectorId, onSectorChange }: Readonly<LeftSidebarProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { data: sectors, isLoading: sectorsLoading } = useGetSectorsQuery();

  const sortedSectors = useMemo(() => {
    if (!sectors) return [];
    return [...sectors].sort((a: Sector, b: Sector) => a.name.localeCompare(b.name));
  }, [sectors]);

  const visibleNav = useMemo(
    () => NAV_ITEMS.filter((item) => !item.authRequired || isAuthenticated),
    [isAuthenticated],
  );

  const handleNavClick = (item: NavItem) => {
    if (item.authRequired && !isAuthenticated) {
      openLoginModal();
      return;
    }
    router.push(item.path);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path.startsWith('/?')) return false; // tab links handled differently
    return pathname.startsWith(path);
  };

  const handleSectorClick = (sectorId: string) => {
    if (!onSectorChange) return;
    if (selectedSectorId === sectorId) {
      onSectorChange(undefined);
    } else {
      onSectorChange(sectorId);
    }
  };

  return (
    <Box>
      {/* Nav links */}
      <List disablePadding sx={{ mb: 1 }}>
        {visibleNav.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavClick(item)}
              sx={{
                borderRadius: 1,
                mb: 0.25,
                py: 0.75,
                px: 1.5,
                color: active ? 'primary.main' : 'text.primary',
                bgcolor: active ? 'action.selected' : 'transparent',
                fontWeight: active ? 600 : 400,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                {active ? item.activeIcon : item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    variant: 'body2',
                    fontWeight: active ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          );
        })}

        {/* Buat Post action */}
        {isAuthenticated && (
          <ListItemButton
            onClick={() => router.push('/post/new')}
            sx={{
              borderRadius: 1,
              py: 0.75,
              px: 1.5,
              color: 'text.primary',
              '&:hover': { bgcolor: 'rgba(27, 58, 92, 0.04)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <EditNoteIcon />
            </ListItemIcon>
            <ListItemText
              primary="Buat Post"
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItemButton>
        )}
      </List>

      <Divider sx={{ my: 1.5 }} />

      {/* Sector filter */}
      <Box sx={{ px: 1.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Sektor
        </Typography>

        {sectorsLoading ? (
          <Stack spacing={0.75}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`sec-sk-${i.toString()}`} variant="rounded" height={24} width="70%" sx={{ borderRadius: 10 }} />
            ))}
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {sortedSectors.map((sector: Sector) => (
              <Chip
                key={sector.id}
                label={sector.name}
                size="small"
                variant={selectedSectorId === sector.id ? 'filled' : 'outlined'}
                color={selectedSectorId === sector.id ? 'primary' : 'default'}
                onClick={() => handleSectorClick(sector.id)}
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  cursor: 'pointer',
                }}
              />
            ))}
            {selectedSectorId && (
              <Chip
                label="× Hapus"
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onSectorChange?.(undefined)}
                sx={{ fontSize: '0.7rem', height: 24, cursor: 'pointer' }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Footer-like links */}
      <Box sx={{ px: 1.5, mt: 3, mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '0.65rem' }}>
          Tentang · Kebijakan Privasi · Ketentuan · Kontak
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
          © {new Date().getFullYear()} Fixio
        </Typography>
      </Box>
    </Box>
  );
}

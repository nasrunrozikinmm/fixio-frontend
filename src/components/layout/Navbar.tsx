'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Drawer,
  List,
  ListItemButton,
  Skeleton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import { useLogoutMutation } from '@/store/api/authApi';

// ---- Nav links ----
const NAV_LINKS = [
  { label: 'Beranda', path: '/' },
  { label: 'Explore', path: '/explore' },
];

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, loading, isAdmin, isModerator } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [logout] = useLogoutMutation();

  // Avatar dropdown state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleNavigate = (path: string) => {
    router.push(path);
    handleMenuClose();
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    handleMenuClose();
    setDrawerOpen(false);
    try {
      await logout().unwrap();
      router.push('/');
    } catch {
      // error silenced — state sudah di-clear via extraReducers
    }
  };

  // ---- Auth section renderers (avoid nested ternaries) ----
  const renderMobileAuth = () => {
    if (loading) {
      return (
        <Box sx={{ px: 2, py: 2 }}>
          <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
        </Box>
      );
    }
    if (isAuthenticated && user) {
      return (
        <List>
          <ListItemButton onClick={() => handleNavigate(`/user/${user.id}`)}>
            <ListItemIcon><PersonOutlineIcon /></ListItemIcon>
            <ListItemText primary="Profil Saya" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigate('/post/new')}>
            <ListItemIcon><EditNoteIcon /></ListItemIcon>
            <ListItemText primary="Buat Post" />
          </ListItemButton>
          {isModerator && (
            <ListItemButton onClick={() => handleNavigate('/moderator')}>
              <ListItemIcon><ShieldOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Moderasi" />
            </ListItemButton>
          )}
          {isAdmin && (
            <ListItemButton onClick={() => handleNavigate('/admin')}>
              <ListItemIcon><AdminPanelSettingsOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          )}
          <Divider sx={{ my: 1 }} />
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
          </ListItemButton>
        </List>
      );
    }
    return (
      <Box sx={{ px: 2, py: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => { setDrawerOpen(false); openLoginModal(); }}
        >
          Login
        </Button>
      </Box>
    );
  };

  const renderDesktopAuth = () => {
    if (loading) {
      return <Skeleton variant="circular" width={36} height={36} />;
    }
    if (isAuthenticated && user) {
      return (
        <>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            aria-label="Menu profil"
            aria-controls={menuOpen ? 'profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <Avatar
              src={user.avatar_url}
              alt={user.name}
              sx={{ width: 36, height: 36 }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                },
              },
            }}
          >
            <MenuItem onClick={() => handleNavigate(`/user/${user.id}`)}>
              <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Profil Saya</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/post/new')}>
              <ListItemIcon><EditNoteIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Buat Post</ListItemText>
            </MenuItem>

            {(isModerator || isAdmin) && <Divider />}

            {isModerator && (
              <MenuItem onClick={() => handleNavigate('/moderator')}>
                <ListItemIcon><ShieldOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Moderasi</ListItemText>
              </MenuItem>
            )}
            {isAdmin && (
              <MenuItem onClick={() => handleNavigate('/admin')}>
                <ListItemIcon><AdminPanelSettingsOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Admin</ListItemText>
              </MenuItem>
            )}

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </>
      );
    }
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={openLoginModal}
        sx={{ ml: 1 }}
      >
        Login
      </Button>
    );
  };

  // ---- Mobile Drawer Content ----
  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 2 }}>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, color: 'secondary.main', cursor: 'pointer' }}
          onClick={() => handleNavigate('/')}
        >
          🟢 Fixio
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)} aria-label="Tutup menu">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Nav links */}
      <List>
        {NAV_LINKS.map(({ label, path }) => (
          <ListItemButton key={path} onClick={() => handleNavigate(path)}>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* Auth section */}
      {renderMobileAuth()}
    </Box>
  );

  // ---- Render ----
  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 3 },
          }}
        >
          {/* Logo */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'secondary.main',
              cursor: 'pointer',
              mr: 4,
              flexShrink: 0,
            }}
            onClick={() => handleNavigate('/')}
          >
            🟢 Fixio
          </Typography>

          {/* Desktop nav links — hidden on mobile */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {NAV_LINKS.map(({ label, path }) => (
              <Button
                key={path}
                onClick={() => handleNavigate(path)}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop right side — hidden on mobile */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {/* Search icon */}
            <IconButton
              onClick={() => handleNavigate('/explore')}
              sx={{ color: 'text.secondary' }}
              aria-label="Cari"
            >
              <SearchIcon />
            </IconButton>

            {renderDesktopAuth()}
          </Box>

          {/* Mobile: hamburger — hidden on desktop */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: 'text.primary' }}
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

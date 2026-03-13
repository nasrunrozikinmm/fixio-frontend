"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
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
  Badge,
  InputBase,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import ExploreIcon from "@mui/icons-material/Explore";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLoginModal } from "@/lib/LoginModalContext";
import { useLogoutMutation } from "@/store/api/authApi";
import { useGetUnreadCountQuery } from "@/store/api/notificationApi";

// ────────────────────────────────────────────
// Nav icon items (Quora-style icon nav)
// ────────────────────────────────────────────
const NAV_ICONS = [
  {
    label: "Beranda",
    path: "/",
    icon: <HomeOutlinedIcon />,
    activeIcon: <HomeIcon />,
  },
  {
    label: "Explore",
    path: "/explore",
    icon: <ExploreOutlinedIcon />,
    activeIcon: <ExploreIcon />,
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, isAdmin, isModerator } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [logout] = useLogoutMutation();
  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });

  // Search state
  const [searchValue, setSearchValue] = useState("");

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
      router.push("/");
    } catch {
      // error silenced
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      router.push(`/explore?q=${encodeURIComponent(q)}`);
      setSearchValue("");
    }
  };

  // ---- Auth section renderers ----
  const renderMobileAuth = () => {
    if (loading) {
      return (
        <Box sx={{ px: 2, py: 2 }}>
          <Skeleton
            variant="rectangular"
            height={36}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      );
    }
    if (isAuthenticated && user) {
      return (
        <List>
          <ListItemButton onClick={() => handleNavigate(`/user/${user.id}`)}>
            <ListItemIcon>
              <PersonOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="Profil Saya" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigate("/post/new")}>
            <ListItemIcon>
              <EditNoteIcon />
            </ListItemIcon>
            <ListItemText primary="Buat Post" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigate("/bookmarks")}>
            <ListItemIcon>
              <BookmarkBorderOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Bookmark" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigate("/settings")}>
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Pengaturan" />
          </ListItemButton>
          {isModerator && (
            <ListItemButton onClick={() => handleNavigate("/moderator")}>
              <ListItemIcon>
                <ShieldOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Moderasi" />
            </ListItemButton>
          )}
          {isAdmin && (
            <ListItemButton onClick={() => handleNavigate("/admin")}>
              <ListItemIcon>
                <AdminPanelSettingsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          )}
          <Divider sx={{ my: 1 }} />
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: "error.main" }} />
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
          onClick={() => {
            setDrawerOpen(false);
            openLoginModal();
          }}
        >
          Login
        </Button>
      </Box>
    );
  };

  const renderDesktopAuth = () => {
    if (loading) {
      return <Skeleton variant="circular" width={32} height={32} />;
    }
    if (isAuthenticated && user) {
      return (
        <>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            aria-label="Menu profil"
            aria-controls={menuOpen ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
          >
            <Avatar
              src={user.avatar_url}
              alt={user.name}
              sx={{ width: 32, height: 32 }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: 3,
                },
              },
            }}
          >
            <MenuItem onClick={() => handleNavigate(`/user/${user.id}`)}>
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profil Saya</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate("/bookmarks")}>
              <ListItemIcon>
                <BookmarkBorderOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Bookmark</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate("/settings")}>
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Pengaturan</ListItemText>
            </MenuItem>

            {(isModerator || isAdmin) && <Divider />}

            {isModerator && (
              <MenuItem onClick={() => handleNavigate("/moderator")}>
                <ListItemIcon>
                  <ShieldOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Moderasi</ListItemText>
              </MenuItem>
            )}
            {isAdmin && (
              <MenuItem onClick={() => handleNavigate("/admin")}>
                <ListItemIcon>
                  <AdminPanelSettingsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Admin</ListItemText>
              </MenuItem>
            )}

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </>
      );
    }
    return (
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={openLoginModal}
      >
        Login
      </Button>
    );
  };

  // ---- Mobile Drawer Content ----
  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => handleNavigate("/")}
        >
          <Image
            src="/high-color-logo.png"
            alt="Fixio"
            width={80}
            height={28}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>
        <IconButton
          onClick={() => setDrawerOpen(false)}
          aria-label="Tutup menu"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Search in drawer */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "background.default",
            borderRadius: 20,
            px: 1.5,
            py: 0.5,
          }}
        >
          <SearchIcon sx={{ color: "text.secondary", fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Cari aspirasi..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ flex: 1, fontSize: "0.8125rem" }}
          />
        </Box>
      </Box>

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
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
            px: { xs: 1.5, md: 2 },
            minHeight: { xs: 48, md: 52 },
            gap: 1,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              mr: { xs: 1, md: 1.5 },
              flexShrink: 0,
            }}
            onClick={() => handleNavigate("/")}
          >
            <Image
              src="/high-color-logo.png"
              alt="Fixio"
              width={80}
              height={28}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>

          {/* Search bar — Quora prominent center */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              flex: 1,
              maxWidth: 540,
              bgcolor: "background.default",
              borderRadius: 20,
              px: 2,
              py: 0.5,
              mx: { sm: 1, md: 2 },
              transition: "box-shadow 0.15s ease",
              "&:focus-within": {
                boxShadow: (t) => `0 0 0 2px ${t.palette.primary.main}`,
                bgcolor: "background.paper",
              },
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Cari aspirasi..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ flex: 1, fontSize: "0.8125rem" }}
            />
          </Box>

          {/* Desktop right side — icon nav + actions */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.5,
              ml: "auto",
            }}
          >
            {/* Nav icon buttons */}
            {NAV_ICONS.map(({ label, path, icon, activeIcon }) => {
              const isActive = pathname === path;
              return (
                <IconButton
                  key={path}
                  onClick={() => handleNavigate(path)}
                  aria-label={label}
                  sx={{
                    color: isActive ? "primary.main" : "text.secondary",
                    borderBottom: isActive
                      ? "2px solid"
                      : "2px solid transparent",
                    borderColor: isActive ? "primary.main" : "transparent",
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                  }}
                >
                  {isActive ? activeIcon : icon}
                </IconButton>
              );
            })}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            <IconButton
              sx={{
                color:
                  pathname === "/notifications"
                    ? "primary.main"
                    : "text.secondary",
                borderBottom:
                  pathname === "/notifications"
                    ? "2px solid"
                    : "2px solid transparent",
                borderColor:
                  pathname === "/notifications"
                    ? "primary.main"
                    : "transparent",
                borderRadius: 0,
                px: 2,
                py: 1,
              }}
              aria-label="Notifikasi"
              onClick={() => router.push("/notifications")}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    top: 2,
                    right: 2,
                    fontSize: "0.625rem",
                    height: 16,
                    minWidth: 16,
                  },
                }}
              >
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>

            {renderDesktopAuth()}
          </Box>

          {/* Mobile: search icon + hamburger */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              ml: "auto",
              gap: 0.5,
            }}
          >
            {/* Mobile theme toggle */}
            <ThemeToggle />

            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: "text.primary" }}
              aria-label="Menu"
              size="small"
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

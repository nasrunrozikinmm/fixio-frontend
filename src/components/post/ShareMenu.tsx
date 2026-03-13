'use client';

import { useCallback, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface ShareMenuProps {
  /** Full URL to share. Falls back to current page URL. */
  url?: string;
  /** Title text used in share intents */
  title?: string;
  /**
   * Visual variant:
   * - `icon` — plain icon button (for PostCard action bar)
   * - `outlined` — bordered icon button (for post detail page)
   */
  variant?: 'icon' | 'outlined';
  /** Icon font size in px */
  iconSize?: number;
}

// ────────────────────────────────────────────
// Share targets
// ────────────────────────────────────────────

function getShareTargets(url: string, title: string) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return [
    {
      key: 'copy',
      label: 'Salin Link',
      icon: <ContentCopyIcon fontSize="small" />,
      href: null,
    },
    {
      key: 'x',
      label: 'X (Twitter)',
      icon: <XIcon fontSize="small" />,
      href: `https://x.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <FacebookIcon fontSize="small" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon fontSize="small" />,
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: <TelegramIcon fontSize="small" />,
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
    },
  ] as const;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ShareMenu — Dropdown menu with social share targets.
 *
 * - Copy Link (clipboard)
 * - X (Twitter)
 * - Facebook
 * - WhatsApp
 * - Telegram
 *
 * Falls back to native Web Share API on supported mobile browsers
 * when available, showing the dropdown as fallback on desktop.
 */
export default function ShareMenu({
  url,
  title = '',
  variant = 'icon',
  iconSize = 18,
}: Readonly<ShareMenuProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const resolvedUrl = url ?? (typeof globalThis.location !== 'undefined' ? globalThis.location.href : '');
  const menuOpen = Boolean(anchorEl);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      // On mobile, try native share first
      if (typeof globalThis.navigator?.share === 'function') {
        globalThis.navigator
          .share({ title, url: resolvedUrl })
          .catch(() => {
            // User cancelled or API unavailable — fall through to menu
            setAnchorEl(e.currentTarget);
          });
        return;
      }

      setAnchorEl(e.currentTarget);
    },
    [title, resolvedUrl],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await globalThis.navigator.clipboard.writeText(resolvedUrl);
      setSnackbar('Link disalin!');
    } catch {
      setSnackbar('Gagal menyalin link');
    }
    setAnchorEl(null);
  }, [resolvedUrl]);

  const handleExternal = useCallback(
    (href: string) => {
      globalThis.open(href, '_blank', 'noopener,noreferrer');
      setAnchorEl(null);
    },
    [],
  );

  const targets = getShareTargets(resolvedUrl, title);

  const isOutlined = variant === 'outlined';

  return (
    <>
      <Tooltip title="Bagikan">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-label="Bagikan"
          sx={
            isOutlined
              ? {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  px: 1.5,
                  '&:hover': {
                    borderColor: 'text.secondary',
                    bgcolor: 'action.hover',
                  },
                }
              : { color: 'text.secondary' }
          }
        >
          <ShareOutlinedIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 200, borderRadius: 2, mt: 0.5 },
          },
        }}
      >
        {targets.map((target) => (
          <MenuItem
            key={target.key}
            onClick={
              target.key === 'copy'
                ? handleCopy
                : () => handleExternal(target.href!)
            }
            sx={{ py: 1 }}
          >
            <ListItemIcon>{target.icon}</ListItemIcon>
            <ListItemText>{target.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}

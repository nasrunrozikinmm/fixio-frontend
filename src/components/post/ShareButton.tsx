'use client';

import { useCallback, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';

/**
 * ShareButton — Salin URL halaman saat ini ke clipboard.
 * Menampilkan snackbar "Link disalin!" setelah klik.
 *
 * Sesuai brief-pixel: "Share: copy URL ke clipboard, snackbar 'Link disalin!'"
 */
export default function ShareButton() {
  const [open, setOpen] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      await globalThis.navigator.clipboard.writeText(globalThis.location.href);
      setOpen(true);
    } catch {
      // Fallback: do nothing (clipboard API not available)
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <Tooltip title="Bagikan">
        <IconButton
          onClick={handleShare}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            px: 1.5,
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message="Link disalin!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}

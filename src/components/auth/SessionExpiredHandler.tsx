'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { RootState } from '@/store/store';
import { setSessionExpired } from '@/store/slices/authSlice';
import { useLoginModal } from '@/lib/LoginModalContext';

/**
 * Watches `sessionExpired` flag in Redux and bridges it to UI:
 * - Opens login modal so the user can re-authenticate
 * - Shows a snackbar informing them the session has expired
 *
 * Place this once inside the provider tree (e.g. in layout.tsx).
 */
export default function SessionExpiredHandler() {
  const dispatch = useDispatch();
  const sessionExpired = useSelector((state: RootState) => state.auth.sessionExpired);
  const { openLoginModal } = useLoginModal();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (sessionExpired && !hasTriggered.current) {
      hasTriggered.current = true;
      openLoginModal();
    }
  }, [sessionExpired, openLoginModal]);

  const handleClose = () => {
    hasTriggered.current = false;
    dispatch(setSessionExpired(false));
  };

  return (
    <Snackbar
      open={sessionExpired}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="warning" variant="filled" sx={{ width: '100%' }}>
        Sesi Anda telah berakhir. Silakan login kembali.
      </Alert>
    </Snackbar>
  );
}

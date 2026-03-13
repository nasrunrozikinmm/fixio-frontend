'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfileMutation } from '@/store/api/authApi';
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout';
import TrendingSidebar from '@/components/layout/TrendingSidebar';

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const NAME_MAX = 255;
const BIO_MAX = 500;
const LOCATION_MAX = 255;

// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
      <Stack spacing={3}>
        <Skeleton variant="circular" width={72} height={72} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" width={120} height={42} />
      </Stack>
    </Paper>
  );
}

// ────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  // Feedback
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Populate form when user data is available
  useEffect(() => {
    if (user) {
      if (name !== (user.name || '')) setName(user.name || '');
      if (bio !== (user.bio || '')) setBio(user.bio || '');
      if (location !== (user.location || '')) setLocation(user.location || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (name.trim().length === 0) {
      setSnackbar({ open: true, message: 'Nama tidak boleh kosong.', severity: 'error' });
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
      }).unwrap();

      setSnackbar({ open: true, message: 'Profil berhasil diperbarui!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Gagal memperbarui profil. Coba lagi.', severity: 'error' });
    }
  };

  const hasChanges =
    user &&
    (name.trim() !== (user.name || '') ||
      bio.trim() !== (user.bio || '') ||
      location.trim() !== (user.location || ''));

  // ---- Render ----

  if (authLoading) {
    return (
      <ThreeColumnLayout rightSidebar={<TrendingSidebar />}>
        <SettingsSkeleton />
      </ThreeColumnLayout>
    );
  }

  if (!user) return null;

  return (
    <ThreeColumnLayout rightSidebar={<TrendingSidebar />}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/user/${user.id}`)}
        sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
      >
        Kembali ke Profil
      </Button>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        {/* Title */}
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
          Pengaturan Profil
        </Typography>

        {/* Avatar preview (read-only — from OAuth) */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            src={user.avatar_url}
            alt={user.name}
            sx={{ width: 72, height: 72, fontSize: '1.75rem' }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Foto Profil
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Foto diambil dari akun Google Anda
            </Typography>
          </Box>
        </Stack>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {/* Name */}
            <TextField
              label="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: NAME_MAX }}
              helperText={`${name.length}/${NAME_MAX}`}
              error={name.trim().length === 0 && name.length > 0}
            />

            {/* Bio */}
            <TextField
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              inputProps={{ maxLength: BIO_MAX }}
              helperText={`${bio.length}/${BIO_MAX}`}
              placeholder="Ceritakan sedikit tentang diri Anda..."
            />

            {/* Location */}
            <TextField
              label="Lokasi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              inputProps={{ maxLength: LOCATION_MAX }}
              helperText={`${location.length}/${LOCATION_MAX}`}
              placeholder="Contoh: Jakarta, Indonesia"
            />

            {/* Email (read-only) */}
            <TextField
              label="Email"
              value={user.email}
              fullWidth
              disabled
              helperText="Email dari akun Google tidak dapat diubah"
            />

            {/* Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSaving || !hasChanges}
                startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThreeColumnLayout>
  );
}

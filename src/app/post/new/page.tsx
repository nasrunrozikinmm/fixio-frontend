'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AuthGuard from '@/components/auth/AuthGuard';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import { useGetRegionsQuery } from '@/store/api/regionApi';
import { useCreatePostMutation } from '@/store/api/postApi';
import { postSchema, type PostFormData } from '@/schemas/postSchema';
import type { Sector, Region } from '@/types';
import { PostPreviewModal } from '@/components/post';


// ────────────────────────────────────────────
// Char counter helper
// ────────────────────────────────────────────

function charCounter(current: number, max: number) {
  return `${current}/${max}`;
}

// ────────────────────────────────────────────
// Form component
// ────────────────────────────────────────────

function CreatePostForm() {
  const router = useRouter();
  const { data: sectors = [], isLoading: sectorsLoading } = useGetSectorsQuery();
  const { data: regions = [], isLoading: regionsLoading } = useGetRegionsQuery();
  const [createPost, { isLoading: isSavingDraft }] = useCreatePostMutation();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftSnackbar, setDraftSnackbar] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      sector_id: '',
      region_id: '',
      criticism: '',
      solution: '',
      impact_estimate: '',
      references: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- watch() is required for live preview; stale-UI risk accepted
  const sectorId = watch('sector_id');
  const regionId = watch('region_id');

  // Find selected sector/region objects for preview
  const selectedSector = useMemo(
    () => sectors.find((s) => s.id === sectorId) ?? null,
    [sectors, sectorId],
  );
  const selectedRegion = useMemo(
    () => regions.find((r) => r.id === regionId) ?? null,
    [regions, regionId],
  );

  const handlePreview = useCallback(() => {
    // Trigger validation before showing preview
    handleSubmit(() => {
      setPreviewOpen(true);
    })();
  }, [handleSubmit]);

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const handleSaveDraft = useCallback(async () => {
    const values = getValues();
    try {
      const post = await createPost({
        title: values.title || 'Draft tanpa judul',
        criticism: values.criticism || '-',
        solution: values.solution || '-',
        sector_id: values.sector_id || undefined,
        region_id: values.region_id || undefined,
        impact_estimate: values.impact_estimate || undefined,
        references: values.references || undefined,
        status: 'draft',
      }).unwrap();
      setDraftSnackbar({
        open: true,
        severity: 'success',
        message: 'Draft berhasil disimpan!',
      });
      // Redirect to user profile after short delay
      setTimeout(() => router.push(`/user/${post.user_id}`), 1200);
    } catch {
      setDraftSnackbar({
        open: true,
        severity: 'error',
        message: 'Gagal menyimpan draft. Coba lagi.',
      });
    }
  }, [createPost, getValues, router]);

  const handleCloseDraftSnackbar = useCallback(() => {
    setDraftSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ── Info banner ── */}
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ borderRadius: 2 }}
        >
          Post akan di-review moderator sebelum ditampilkan ke publik.
        </Alert>

        {/* ── Judul ── */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Judul"
              placeholder="Judul aspirasi Anda (min. 10 karakter)"
              fullWidth
              error={Boolean(errors.title)}
              helperText={errors.title?.message ?? charCounter(field.value.length, 150)}
              slotProps={{ htmlInput: { maxLength: 150 } }}
            />
          )}
        />

        {/* ── Sektor + Wilayah (side by side) ── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="sector_id"
            control={control}
            render={({ field }) => (
              <Autocomplete<Sector, false>
                options={sectors}
                getOptionLabel={(option) => option.name}
                loading={sectorsLoading}
                value={selectedSector}
                onChange={(_e, newValue) => {
                  field.onChange(newValue?.id ?? '');
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sektor"
                    placeholder="Pilih sektor"
                    error={Boolean(errors.sector_id)}
                    helperText={errors.sector_id?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            name="region_id"
            control={control}
            render={({ field }) => (
              <Autocomplete<Region, false>
                options={regions}
                getOptionLabel={(option) => option.name}
                loading={regionsLoading}
                value={selectedRegion}
                onChange={(_e, newValue) => {
                  field.onChange(newValue?.id ?? '');
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Wilayah"
                    placeholder="Pilih wilayah"
                    error={Boolean(errors.region_id)}
                    helperText={errors.region_id?.message}
                  />
                )}
              />
            )}
          />
        </Stack>

        {/* ── Kritik ── */}
        <Controller
          name="criticism"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Kritik"
              placeholder="Jelaskan permasalahan kebijakan yang ingin Anda kritisi (min. 50 karakter)"
              fullWidth
              multiline
              minRows={4}
              error={Boolean(errors.criticism)}
              helperText={errors.criticism?.message ?? charCounter(field.value.length, 1000)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          )}
        />

        {/* ── Solusi ── */}
        <Controller
          name="solution"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Solusi"
              placeholder="Berikan solusi konkret untuk permasalahan di atas (min. 50 karakter)"
              fullWidth
              multiline
              minRows={4}
              error={Boolean(errors.solution)}
              helperText={errors.solution?.message ?? charCounter(field.value.length, 1000)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          )}
        />

        {/* ── Estimasi Dampak (opsional) ── */}
        <Controller
          name="impact_estimate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Estimasi Dampak (opsional)"
              placeholder="Perkiraan dampak positif dari solusi yang diusulkan"
              fullWidth
              multiline
              minRows={2}
              error={Boolean(errors.impact_estimate)}
              helperText={errors.impact_estimate?.message ?? charCounter(field.value?.length ?? 0, 500)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          )}
        />

        {/* ── Referensi (opsional) ── */}
        <Controller
          name="references"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Referensi (opsional)"
              placeholder="Link sumber data atau artikel pendukung"
              fullWidth
              error={Boolean(errors.references)}
              helperText={errors.references?.message ?? charCounter(field.value?.length ?? 0, 500)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          )}
        />

        {/* ── Action buttons ── */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={
              isSavingDraft ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            disabled={isSavingDraft}
            onClick={handleSaveDraft}
            sx={{ textTransform: 'none' }}
          >
            Simpan Draft
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<VisibilityIcon />}
            onClick={handlePreview}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Preview &amp; Submit
          </Button>
        </Stack>
      </Box>

      {/* ── Preview modal ── */}
      <PostPreviewModal
        open={previewOpen}
        onClose={handleClosePreview}
        formData={getValues()}
        sector={selectedSector}
        region={selectedRegion}
      />

      {/* ── Draft save snackbar ── */}
      <Snackbar
        open={draftSnackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseDraftSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseDraftSnackbar}
          severity={draftSnackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {draftSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

// ────────────────────────────────────────────
// Page
// ────────────────────────────────────────────

export default function CreatePostPage() {
  return (
    <AuthGuard>
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <Typography variant="h1" sx={{ mb: 3 }}>
            Buat Aspirasi Baru
          </Typography>
          <CreatePostForm />
        </Box>
      </Container>
    </AuthGuard>
  );
}

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AuthGuard from '@/components/auth/AuthGuard';
import PostFormFields from '@/components/post/PostFormFields';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import { useGetRegionsQuery } from '@/store/api/regionApi';
import { useCreatePostMutation } from '@/store/api/postApi';
import { postSchema, type PostFormData } from '@/schemas/postSchema';
import { PostPreviewModal } from '@/components/post';
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout';
import WritingGuide from '@/components/layout/WritingGuide';


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
      images: [],
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
        images: values.images?.length ? values.images : undefined,
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
      <PostFormFields
        control={control}
        errors={errors}
        watch={watch}
        sectors={sectors}
        sectorsLoading={sectorsLoading}
        regions={regions}
        regionsLoading={regionsLoading}
      />

      {/* ── Action buttons ── */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
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
      <ThreeColumnLayout centerMaxWidth={720} rightSidebar={<WritingGuide />}>
        <Typography variant="h1" sx={{ mb: 3 }}>
          Buat Aspirasi Baru
        </Typography>
        <CreatePostForm />
      </ThreeColumnLayout>
    </AuthGuard>
  );
}

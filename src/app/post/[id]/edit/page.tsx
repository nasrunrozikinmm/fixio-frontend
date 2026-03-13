'use client';

import { use, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AuthGuard from '@/components/auth/AuthGuard';
import PostFormFields from '@/components/post/PostFormFields';
import { PostPreviewModal } from '@/components/post';
import { useGetPostQuery } from '@/store/api/postApi';
import { useGetSectorsQuery } from '@/store/api/sectorApi';
import { useGetRegionsQuery } from '@/store/api/regionApi';
import { useAuth } from '@/hooks/useAuth';
import { postSchema, type PostFormData } from '@/schemas/postSchema';
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout';
import WritingGuide from '@/components/layout/WritingGuide';

// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

function EditSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Skeleton variant="rounded" width="100%" height={56} />
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rounded" width="50%" height={56} />
        <Skeleton variant="rounded" width="50%" height={56} />
      </Stack>
      <Skeleton variant="rounded" width="100%" height={160} />
      <Skeleton variant="rounded" width="100%" height={160} />
      <Skeleton variant="rounded" width="100%" height={80} />
      <Skeleton variant="rounded" width="100%" height={56} />
    </Box>
  );
}

// ────────────────────────────────────────────
// Edit form (loaded after post data is available)
// ────────────────────────────────────────────

interface EditPostFormProps {
  postId: string;
  defaultValues: PostFormData;
}

function EditPostForm({ postId, defaultValues }: Readonly<EditPostFormProps>) {
  const { data: sectors = [], isLoading: sectorsLoading } = useGetSectorsQuery();
  const { data: regions = [], isLoading: regionsLoading } = useGetRegionsQuery();

  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues,
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- watch() is required for live preview; stale-UI risk accepted
  const sectorId = watch('sector_id');
  const regionId = watch('region_id');

  const selectedSector = useMemo(
    () => sectors.find((s) => s.id === sectorId) ?? null,
    [sectors, sectorId],
  );
  const selectedRegion = useMemo(
    () => regions.find((r) => r.id === regionId) ?? null,
    [regions, regionId],
  );

  const handlePreview = useCallback(() => {
    handleSubmit(() => {
      setPreviewOpen(true);
    })();
  }, [handleSubmit]);

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
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
          variant="contained"
          color="secondary"
          startIcon={<VisibilityIcon />}
          onClick={handlePreview}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Preview &amp; Update
        </Button>
      </Stack>

      {/* ── Preview modal (edit mode) ── */}
      <PostPreviewModal
        open={previewOpen}
        onClose={handleClosePreview}
        formData={getValues()}
        sector={selectedSector}
        region={selectedRegion}
        mode="edit"
        postId={postId}
      />
    </>
  );
}

// ────────────────────────────────────────────
// Page
// ────────────────────────────────────────────

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: post, isLoading, isError } = useGetPostQuery(id);

  // Ownership check
  const isOwner = post && user && post.user_id === user.id;

  return (
    <AuthGuard>
      <ThreeColumnLayout centerMaxWidth={720} rightSidebar={<WritingGuide />}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            mb: 2,
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
          }}
        >
          Kembali
        </Button>

        <Typography variant="h1" sx={{ mb: 3 }}>
          Edit Aspirasi
        </Typography>

        {/* Loading */}
        {isLoading && <EditSkeleton />}

        {/* Error */}
        {isError && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" gutterBottom>
              Post tidak ditemukan
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Post yang ingin Anda edit tidak ditemukan atau telah dihapus.
            </Typography>
            <Button variant="contained" onClick={() => router.push('/')}>
              Kembali ke Beranda
            </Button>
          </Box>
        )}

        {/* Not owner */}
        {post && !isLoading && !isOwner && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" gutterBottom>
              Akses Ditolak
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Anda hanya dapat mengedit post milik Anda sendiri.
            </Typography>
            <Button variant="contained" onClick={() => router.push(`/post/${id}`)}>
              Lihat Post
            </Button>
          </Box>
        )}

        {/* Edit form */}
        {post && isOwner && (
          <EditPostForm
            postId={id}
            defaultValues={{
              title: post.title,
              sector_id: post.sector_id ?? '',
              region_id: post.region_id ?? '',
              criticism: post.criticism,
              solution: post.solution,
              impact_estimate: post.impact_estimate ?? '',
              references: post.references ?? '',
              images: post.images ?? [],
            }}
          />
        )}

        {/* Loading overlay for initial data */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </ThreeColumnLayout>
    </AuthGuard>
  );
}

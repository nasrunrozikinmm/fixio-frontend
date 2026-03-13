'use client';

import { use, useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useGetUserQuery } from '@/store/api/userApi';
import { useGetPostsQuery } from '@/store/api/postApi';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from '@/components/post/ProfileHeader';
import PostListItem from '@/components/post/PostListItem';
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout';
import TrendingSidebar from '@/components/layout/TrendingSidebar';
import SidebarAd from '@/components/layout/SidebarAd';

// ────────────────────────────────────────────
// Tab config
// ────────────────────────────────────────────

interface ProfileTab {
  label: string;
  status: string | undefined; // undefined = semua
}

const ALL_TABS: ProfileTab[] = [
  { label: 'Semua', status: undefined },
  { label: 'Approved', status: 'approved' },
  { label: 'Pending', status: 'pending_review' },
  { label: 'Rejected', status: 'rejected' },
];

const PUBLIC_TABS: ProfileTab[] = [
  { label: 'Post', status: 'approved' },
];

// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Skeleton variant="rounded" width="100%" height={160} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rounded" width={300} height={36} />
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Skeleton variant="rounded" width={70} height={24} />
            <Skeleton variant="rounded" width={70} height={24} />
          </Stack>
          <Skeleton variant="text" width="75%" height={24} />
          <Skeleton variant="text" width="50%" height={18} />
        </Box>
      ))}
    </Box>
  );
}

// ────────────────────────────────────────────
// Post list sub-component (avoids nested ternary)
// ────────────────────────────────────────────

interface PostListContentProps {
  userId: string;
  status: string | undefined;
  page: number;
  isOwner: boolean;
  onPageChange: (page: number) => void;
}

function PostListContent({ userId, status, page, isOwner, onPageChange }: Readonly<PostListContentProps>) {
  const { data, isLoading, isError } = useGetPostsQuery({
    user_id: userId,
    status,
    page,
    limit: 10,
  });

  if (isLoading) {
    return (
      <Stack spacing={0}>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
            <Skeleton variant="text" width="60%" height={22} />
            <Skeleton variant="text" width="40%" height={18} />
          </Box>
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <Typography variant="body2" color="error" sx={{ py: 3, textAlign: 'center' }}>
        Gagal memuat post. Silakan coba lagi.
      </Typography>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Belum ada post.
        </Typography>
      </Box>
    );
  }

  const handlePagination = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  return (
    <>
      {data.data.map((post) => (
        <PostListItem
          key={post.id}
          post={post}
          showStatus={isOwner}
        />
      ))}

      {data.pagination.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={data.pagination.total_pages}
            page={page}
            onChange={handlePagination}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </>
  );
}

// ────────────────────────────────────────────
// Error state
// ────────────────────────────────────────────

function ProfileError() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" gutterBottom>
        User tidak ditemukan
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Profil tidak ditemukan atau telah dihapus.
      </Typography>
      <Button variant="contained" href="/">
        Kembali ke Beranda
      </Button>
    </Box>
  );
}

// ────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = use(params);
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === id;

  const { data: profileUser, isLoading, isError } = useGetUserQuery(id);

  const tabs = isOwner ? ALL_TABS : PUBLIC_TABS;
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(1);

  const currentStatus = tabs[tabIndex]?.status;

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setTabIndex(newValue);
      setPage(1);
    },
    [],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Compute aggregate stats from all posts (approximation from current query)
  // In a real app, the API would provide user stats directly
  const { data: allPosts } = useGetPostsQuery({ user_id: id, limit: 1 });
  const postCount = allPosts?.pagination.total ?? 0;

  // Use rough estimates for votes & comments (would come from user stats endpoint)
  const totalVotes = useMemo(() => {
    return profileUser ? postCount * 3 : 0; // placeholder — replace with real stats API
  }, [profileUser, postCount]);

  return (
    <ThreeColumnLayout
      centerMaxWidth={800}
      rightSidebar={
        <TrendingSidebar>
          <SidebarAd />
        </TrendingSidebar>
      }
    >
      {/* Loading */}
      {isLoading && <ProfileSkeleton />}

      {/* Error */}
      {isError && <ProfileError />}

      {/* Profile */}
      {profileUser && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <ProfileHeader
            user={profileUser}
            postCount={postCount}
            totalVotes={totalVotes}
            commentCount={0}
            isOwner={isOwner}
          />

          {/* Tabs */}
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                bgcolor: 'secondary.main',
              },
              '& .Mui-selected': {
                color: 'secondary.main',
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.label}
                label={tab.label}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            ))}
          </Tabs>

          {/* Post list */}
          <PostListContent
            userId={id}
            status={currentStatus}
            page={page}
            isOwner={isOwner}
            onPageChange={handlePageChange}
          />
        </Box>
      )}
    </ThreeColumnLayout>
  );
}

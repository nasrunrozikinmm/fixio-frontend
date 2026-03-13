"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useAuth } from "@/hooks/useAuth";
import { useGetMyBookmarksQuery } from "@/store/api/bookmarkApi";
import PostCard from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/post";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import TrendingSidebar from "@/components/layout/TrendingSidebar";
import SidebarAd from "@/components/layout/SidebarAd";

const PAGE_SIZE = 10;

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetMyBookmarksQuery(
    { page, limit: PAGE_SIZE },
    { skip: !user },
  );

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, newPage: number) => {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  // Auth gate
  if (!authLoading && !user) {
    return (
      <ThreeColumnLayout>
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Silakan login untuk melihat bookmark Anda.
          </Typography>
        </Box>
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout
      rightSidebar={
        <TrendingSidebar>
          <SidebarAd />
        </TrendingSidebar>
      }
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BookmarkIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Bookmark Saya
        </Typography>
      </Box>

      {/* Loading */}
      {isLoading && (
        <Stack spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={`skeleton-${i.toString()}`} variant="feed" />
          ))}
        </Stack>
      )}

      {/* Error */}
      {isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Gagal memuat bookmark. Silakan coba lagi nanti.
        </Alert>
      )}

      {/* Empty */}
      {!isLoading && !isError && posts.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <BookmarkIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Belum ada post yang di-bookmark
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tekan ikon bookmark pada post untuk menyimpannya di sini.
          </Typography>
        </Box>
      )}

      {/* Post list */}
      {!isLoading && !isError && posts.length > 0 && (
        <Fade in timeout={300}>
          <Stack spacing={2}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} variant="feed" />
            ))}
          </Stack>
        </Fade>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </ThreeColumnLayout>
  );
}

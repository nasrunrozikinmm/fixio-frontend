'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CircularProgress from '@mui/material/CircularProgress';
import { useAddBookmarkMutation, useRemoveBookmarkMutation, useGetBookmarkStatusQuery } from '@/store/api/bookmarkApi';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';

interface BookmarkButtonProps {
  postId: string;
}

export default function BookmarkButton({ postId }: Readonly<BookmarkButtonProps>) {
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { data: isBookmarked, isLoading: statusLoading } = useGetBookmarkStatusQuery(postId, {
    skip: !user,
  });
  const [addBookmark, { isLoading: addLoading }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: removeLoading }] = useRemoveBookmarkMutation();

  const loading = statusLoading || addLoading || removeLoading;

  const handleClick = async () => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (loading) return;
    try {
      if (isBookmarked) {
        await removeBookmark(postId).unwrap();
      } else {
        await addBookmark(postId).unwrap();
      }
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <Tooltip title={isBookmarked ? 'Hapus bookmark' : 'Simpan'}>
      <IconButton
        onClick={handleClick}
        disabled={loading}
        size="small"
        sx={{ color: isBookmarked ? 'primary.main' : 'text.secondary' }}
      >
        {loading ? (
          <CircularProgress size={18} />
        ) : isBookmarked ? (
          <BookmarkIcon fontSize="small" />
        ) : (
          <BookmarkBorderOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

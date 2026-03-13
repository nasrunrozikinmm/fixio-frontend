'use client';

import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/lib/LoginModalContext';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowStatusQuery,
} from '@/store/api/followApi';
import type { User } from '@/types';

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface AuthorCardProps {
  author: User;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * AuthorCard — Compact author info card for post detail sidebar.
 *
 * Shows avatar, name, bio, location, and follow/unfollow button.
 */
export default function AuthorCard({ author }: Readonly<AuthorCardProps>) {
  const { user, isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();

  const isOwn = user?.id === author.id;

  const { data: isFollowing } = useGetFollowStatusQuery(author.id, {
    skip: !isAuthenticated || isOwn,
  });

  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation();

  const handleFollow = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (isFollowing) {
      unfollowUser(author.id);
    } else {
      followUser(author.id);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
      }}
    >
      {/* Author avatar + name */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Avatar
          component={Link}
          href={`/user/${author.id}`}
          src={author.avatar_url}
          alt={author.name}
          sx={{ width: 40, height: 40, textDecoration: 'none' }}
        >
          {author.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component={Link}
            href={`/user/${author.id}`}
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
          >
            {author.name}
          </Typography>
          {author.location && (
            <Stack direction="row" spacing={0.25} alignItems="center">
              <LocationOnOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                {author.location}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>

      {/* Bio */}
      {author.bio && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.5,
          }}
        >
          {author.bio}
        </Typography>
      )}

      {/* Follow button (hide for own profile) */}
      {!isOwn && (
        <Button
          size="small"
          variant={isFollowing ? 'outlined' : 'contained'}
          fullWidth
          startIcon={isFollowing ? <PersonRemoveOutlinedIcon /> : <PersonAddOutlinedIcon />}
          onClick={handleFollow}
          disabled={followLoading || unfollowLoading}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {isFollowing ? 'Berhenti Mengikuti' : 'Ikuti'}
        </Button>
      )}
    </Box>
  );
}

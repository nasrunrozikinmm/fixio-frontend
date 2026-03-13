'use client';

import Button from '@mui/material/Button';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { useFollowUserMutation, useUnfollowUserMutation, useGetFollowStatusQuery } from '@/store/api/followApi';
import { useAuth } from '@/hooks/useAuth';

interface FollowButtonProps {
  targetUserId: string;
  /** Compact variant for inline usage */
  size?: 'small' | 'medium';
}

export default function FollowButton({ targetUserId, size = 'medium' }: Readonly<FollowButtonProps>) {
  const { user } = useAuth();
  const { data: isFollowing, isLoading: statusLoading } = useGetFollowStatusQuery(targetUserId, {
    skip: !user || user.id === targetUserId,
  });
  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation();

  // Don't show if not logged in or viewing own profile
  if (!user || user.id === targetUserId) return null;

  const loading = statusLoading || followLoading || unfollowLoading;

  const handleClick = async () => {
    if (loading) return;
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId).unwrap();
      } else {
        await followUser(targetUserId).unwrap();
      }
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outlined' : 'contained'}
      size={size}
      onClick={handleClick}
      disabled={loading}
      startIcon={
        loading ? (
          <CircularProgress size={16} />
        ) : isFollowing ? (
          <PersonRemoveOutlinedIcon />
        ) : (
          <PersonAddOutlinedIcon />
        )
      }
      sx={{
        textTransform: 'none',
        borderRadius: 5,
        fontWeight: 600,
        minWidth: size === 'small' ? 90 : 120,
      }}
    >
      {isFollowing ? 'Mengikuti' : 'Ikuti'}
    </Button>
  );
}

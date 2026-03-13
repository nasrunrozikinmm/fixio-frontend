'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { formatLocalDate } from '@/lib/formatDate';
import { useGetFollowCountsQuery } from '@/store/api/followApi';
import FollowButton from './FollowButton';
import type { User } from '@/types';

// ────────────────────────────────────────────
// Stat card
// ────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}

function StatCard({ icon, value, label }: Readonly<StatCardProps>) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        textAlign: 'center',
        borderRadius: 2,
        minWidth: 90,
        flex: 1,
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
        {icon}
        <Typography variant="h3" fontWeight={700}>
          {value}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface ProfileHeaderProps {
  user: User;
  postCount: number;
  totalVotes: number;
  commentCount: number;
  /** Show "Edit Profil" button — true only for profile owner */
  isOwner?: boolean;
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * Role label & color map
 */
const ROLE_CONFIG: Record<string, { label: string; color: 'default' | 'success' | 'primary' | 'warning' }> = {
  creator: { label: 'Kreator', color: 'default' },
  moderator: { label: 'Moderator', color: 'warning' },
  administrator: { label: 'Administrator', color: 'primary' },
};

/**
 * ProfileHeader — Avatar, nama, lokasi, bio, role badge, email, member since, stat counters.
 *
 * Spec (brief-pixel):
 * - Avatar 64px, nama lengkap, lokasi, bio
 * - Stat counter boxes: Post, Total ▲, Komentar
 */
export default function ProfileHeader({
  user,
  postCount,
  totalVotes,
  commentCount,
  isOwner = false,
}: Readonly<ProfileHeaderProps>) {
  const router = useRouter();
  const roleConfig = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.creator;
  const { data: followCounts } = useGetFollowCountsQuery(user.id);

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'flex-start' }}>
        {/* Avatar */}
        <Avatar
          src={user.avatar_url}
          alt={user.name}
          sx={{ width: 72, height: 72, fontSize: '1.75rem' }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Name + Role badge */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Chip
              label={roleConfig.label}
              color={roleConfig.color}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          </Stack>

          {/* Email */}
          {user.email && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.25 }}>
              <EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Stack>
          )}

          {/* Location */}
          {user.location && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.25 }}>
              <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.location}
              </Typography>
            </Stack>
          )}

          {/* Member since */}
          {user.created_at && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Bergabung {formatLocalDate(user.created_at)}
              </Typography>
            </Stack>
          )}

          {/* Bio */}
          {user.bio && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              &ldquo;{user.bio}&rdquo;
            </Typography>
          )}

          {/* Action buttons */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {isOwner ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => router.push('/settings')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                Edit Profil
              </Button>
            ) : (
              <FollowButton targetUserId={user.id} size="small" />
            )}
          </Stack>
        </Box>
      </Stack>

      {/* Stat cards */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
        <StatCard
          icon={<PeopleOutlinedIcon sx={{ fontSize: 18, color: 'success.main' }} />}
          value={followCounts?.follower_count ?? 0}
          label="Pengikut"
        />
        <StatCard
          icon={<PeopleOutlinedIcon sx={{ fontSize: 18, color: 'info.main' }} />}
          value={followCounts?.following_count ?? 0}
          label="Mengikuti"
        />
        <StatCard
          icon={<ArticleOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
          value={postCount}
          label="Post"
        />
        <StatCard
          icon={<ThumbUpAltOutlinedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />}
          value={totalVotes}
          label="Total ▲"
        />
        <StatCard
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 18, color: 'info.main' }} />}
          value={commentCount}
          label="Komentar"
        />
      </Stack>
    </Paper>
  );
}

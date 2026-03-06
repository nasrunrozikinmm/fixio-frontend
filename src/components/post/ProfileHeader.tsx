'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
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
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

/**
 * ProfileHeader — Avatar, nama, lokasi, bio, stat counters.
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
}: Readonly<ProfileHeaderProps>) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
        {/* Avatar */}
        <Avatar
          src={user.avatar_url}
          alt={user.name}
          sx={{ width: 64, height: 64, fontSize: '1.5rem' }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.25 }}>
            {user.name}
          </Typography>

          {user.location && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
              <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.location}
              </Typography>
            </Stack>
          )}

          {user.bio && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              &ldquo;{user.bio}&rdquo;
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Stat cards */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
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

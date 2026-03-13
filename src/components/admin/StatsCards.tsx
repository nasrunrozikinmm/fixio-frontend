'use client';

import { Box, Card, CardContent, Typography, Stack, Skeleton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import CheckIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useGetAdminStatsQuery } from '@/store/api/adminApi';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}

function StatCard({ label, value, icon, color, highlight }: StatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        flex: '1 1 200px',
        minWidth: 160,
        borderColor: highlight ? 'warning.main' : 'divider',
        borderWidth: highlight ? 2 : 1,
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color, mt: 0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              {value.toLocaleString('id-ID')}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}14`,
              color,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * StatsCards — Kartu statistik platform overview untuk admin dashboard.
 */
export default function StatsCards() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();

  if (isLoading || !stats) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Overview Platform
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Card
              key={i}
              variant="outlined"
              sx={{ borderRadius: 3, flex: '1 1 200px', minWidth: 160 }}
            >
              <CardContent>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={60} height={45} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  const cards: StatCardProps[] = [
    {
      label: 'Total Users',
      value: stats.total_users,
      icon: <PeopleIcon />,
      color: 'primary.main',
    },
    {
      label: 'Total Posts',
      value: stats.total_posts,
      icon: <ArticleIcon />,
      color: 'secondary.main',
    },
    {
      label: 'Pending Review',
      value: stats.total_pending_review,
      icon: <PendingIcon />,
      color: 'warning.main',
      highlight: stats.total_pending_review > 0,
    },
    {
      label: 'Approved',
      value: stats.total_approved,
      icon: <CheckIcon />,
      color: 'secondary.main',
    },
    {
      label: 'Rejected',
      value: stats.total_rejected,
      icon: <CancelIcon />,
      color: 'error.main',
    },
    {
      label: 'Komentar',
      value: stats.total_comments,
      icon: <CommentIcon />,
      color: 'info.main',
    },
    {
      label: 'Votes',
      value: stats.total_votes,
      icon: <ThumbUpIcon />,
      color: 'secondary.dark',
    },
  ];

  // Compute approval rate
  const totalReviewed = stats.total_approved + stats.total_rejected;
  const approvalRate = totalReviewed > 0
    ? Math.round((stats.total_approved / totalReviewed) * 100)
    : 0;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Overview Platform
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Approval rate: <strong>{approvalRate}%</strong> ({stats.total_approved}/{totalReviewed} reviewed)
        </Typography>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={2}>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </Stack>
    </Box>
  );
}

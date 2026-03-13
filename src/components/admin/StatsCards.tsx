'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { useGetAdminStatsQuery } from '@/store/api/adminApi';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface StatCardData {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: number;
  highlight?: boolean;
}

// ────────────────────────────────────────────
// Stat Card (Flup-style)
// ────────────────────────────────────────────

function StatCard({ label, value, icon, color, bgColor, trend, highlight }: Readonly<StatCardData>) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        flex: '1 1 220px',
        minWidth: 180,
        borderColor: highlight ? 'warning.main' : 'divider',
        borderWidth: highlight ? 2 : 1,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Icon + label row */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: bgColor,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': { fontSize: 18 },
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
            {label}
          </Typography>
        </Stack>

        {/* Value + trend */}
        <Stack direction="row" alignItems="baseline" spacing={1.5}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, lineHeight: 1 }}
          >
            {value.toLocaleString('id-ID')}
          </Typography>
          {trend !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.25}>
              {trend >= 0 ? (
                <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: trend >= 0 ? 'success.main' : 'error.main', fontSize: '0.7rem' }}
              >
                {Math.abs(trend).toFixed(1)}%
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────
// Main
// ────────────────────────────────────────────

/**
 * StatsCards — Kartu statistik platform overview (Flup-style).
 */
export default function StatsCards() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();

  if (isLoading || !stats) {
    return (
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} variant="outlined" sx={{ borderRadius: 3, flex: '1 1 220px', minWidth: 180 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Skeleton variant="rounded" width={32} height={32} />
                <Skeleton variant="text" width={80} height={16} />
              </Stack>
              <Skeleton variant="text" width={100} height={36} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  const totalReviewed = stats.total_approved + stats.total_rejected;
  const approvalRate = totalReviewed > 0
    ? Math.round((stats.total_approved / totalReviewed) * 100)
    : 0;

  const cards: StatCardData[] = [
    {
      label: 'Total Users',
      value: stats.total_users,
      icon: <PeopleOutlinedIcon />,
      color: '#1B3A5C',
      bgColor: '#1B3A5C14',
      trend: 2.5,
    },
    {
      label: 'Total Posts',
      value: stats.total_posts,
      icon: <ArticleOutlinedIcon />,
      color: '#2E7D4F',
      bgColor: '#2E7D4F14',
      trend: 0.5,
    },
    {
      label: 'Pending Review',
      value: stats.total_pending_review,
      icon: <HourglassEmptyOutlinedIcon />,
      color: '#ED6C02',
      bgColor: '#ED6C0214',
      trend: stats.total_pending_review > 5 ? -0.2 : undefined,
      highlight: stats.total_pending_review > 0,
    },
    {
      label: 'Approved',
      value: stats.total_approved,
      icon: <CheckCircleOutlinedIcon />,
      color: '#2E7D4F',
      bgColor: '#2E7D4F14',
    },
    {
      label: 'Rejected',
      value: stats.total_rejected,
      icon: <CancelOutlinedIcon />,
      color: '#D32F2F',
      bgColor: '#D32F2F14',
    },
    {
      label: 'Komentar',
      value: stats.total_comments,
      icon: <ChatBubbleOutlinedIcon />,
      color: '#0288D1',
      bgColor: '#0288D114',
    },
    {
      label: 'Votes',
      value: stats.total_votes,
      icon: <ThumbUpOutlinedIcon />,
      color: '#7B1FA2',
      bgColor: '#7B1FA214',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Approval rate: <strong>{approvalRate}%</strong> ({stats.total_approved}/{totalReviewed})
        </Typography>
      </Stack>

      {/* Cards */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </Stack>
    </Box>
  );
}

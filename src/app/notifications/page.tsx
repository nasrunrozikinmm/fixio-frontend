'use client';

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '@/store/api/notificationApi';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeDate } from '@/lib/formatDate';
import type { Notification } from '@/types';
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout';
import TrendingSidebar from '@/components/layout/TrendingSidebar';

const PAGE_SIZE = 10;

const NOTIF_ICON: Record<string, React.ReactNode> = {
  new_follower: <PersonAddOutlinedIcon sx={{ fontSize: 20, color: 'success.main' }} />,
  post_vote: <ThumbUpAltOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />,
  post_comment: <ChatBubbleOutlineIcon sx={{ fontSize: 20, color: 'info.main' }} />,
};

function NotificationItem({ notif, onMarkRead }: { notif: Notification; onMarkRead: (id: string) => void }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: notif.is_read ? 'transparent' : 'action.hover',
        cursor: notif.is_read ? 'default' : 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={() => !notif.is_read && onMarkRead(notif.id)}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'background.default' }}>
          {NOTIF_ICON[notif.type] ?? <NotificationsNoneIcon sx={{ fontSize: 20 }} />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: notif.is_read ? 400 : 600 }}>
            {notif.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeDate(notif.created_at)}
          </Typography>
        </Box>
        {!notif.is_read && (
          <Chip label="Baru" size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem' }} />
        )}
      </Stack>
    </Paper>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetNotificationsQuery(
    { page, limit: PAGE_SIZE },
    { skip: !user }
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: markAllLoading }] = useMarkAllAsReadMutation();

  if (!user) {
    return (
      <ThreeColumnLayout>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography color="text.secondary">Silakan login untuk melihat notifikasi.</Typography>
        </Box>
      </ThreeColumnLayout>
    );
  }

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <ThreeColumnLayout rightSidebar={<TrendingSidebar />}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Notifikasi
        </Typography>
        {total > 0 && (
          <Button
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={() => markAllAsRead()}
            disabled={markAllLoading}
            sx={{ textTransform: 'none' }}
          >
            Tandai semua dibaca
          </Button>
        )}
      </Stack>

      {isLoading ? (
        <Stack spacing={1}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : notifications.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">Belum ada notifikasi.</Typography>
        </Paper>
      ) : (
        <>
          <Stack spacing={1}>
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onMarkRead={(id) => markAsRead(id)}
              />
            ))}
          </Stack>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </ThreeColumnLayout>
  );
}

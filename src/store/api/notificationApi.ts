import { baseApi } from './baseApi';
import type { ApiResponse, NotificationListResponse } from '@/types';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Get paginated notifications */
    getNotifications: builder.query<NotificationListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) =>
        `/notifications?page=${page}&limit=${limit}`,
      transformResponse: (response: ApiResponse<NotificationListResponse>) =>
        response.data,
      providesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),

    /** Get unread notification count */
    getUnreadCount: builder.query<number, void>({
      query: () => '/notifications/count',
      transformResponse: (response: ApiResponse<{ count: number }>) =>
        response.data.count,
      providesTags: [{ type: 'Notifications', id: 'COUNT' }],
    }),

    /** Mark a single notification as read */
    markAsRead: builder.mutation<void, string>({
      query: (notifId) => ({
        url: `/notifications/${notifId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'COUNT' },
      ],
    }),

    /** Mark all notifications as read */
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;

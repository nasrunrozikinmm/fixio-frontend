import { baseApi } from './baseApi';
import type {
  AdminStats,
  ApiResponse,
  PaginatedResponse,
  User,
} from '@/types';

// ─── Query params ───────────────────────────────────────────

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ChangeRoleParams {
  userId: string;
  role: 'creator' | 'moderator' | 'administrator';
}

// ─── API ────────────────────────────────────────────────────

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Platform statistics */
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      transformResponse: (response: ApiResponse<AdminStats>) => response.data,
      providesTags: [{ type: 'AdminStats', id: 'STATS' }],
    }),

    /** All users with pagination */
    getAdminUsers: builder.query<
      PaginatedResponse<User>['data'],
      GetUsersParams | void
    >({
      query: (params) => ({
        url: '/admin/users',
        params: params ?? undefined,
      }),
      transformResponse: (response: PaginatedResponse<User>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'AdminUsers' as const,
                id,
              })),
              { type: 'AdminUsers', id: 'LIST' },
            ]
          : [{ type: 'AdminUsers', id: 'LIST' }],
    }),

    /** Change user role */
    changeUserRole: builder.mutation<User, ChangeRoleParams>({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'AdminUsers', id: userId },
        { type: 'AdminUsers', id: 'LIST' },
        { type: 'AdminStats', id: 'STATS' },
      ],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useChangeUserRoleMutation,
} = adminApi;

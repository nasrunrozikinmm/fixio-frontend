import { baseApi } from './baseApi';
import type { ApiResponse, Follow, FollowCounts } from '@/types';

export const followApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Follow a user */
    followUser: builder.mutation<Follow, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<Follow>) => response.data,
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Follows', id: userId },
        { type: 'Users', id: userId },
      ],
    }),

    /** Unfollow a user */
    unfollowUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Follows', id: userId },
        { type: 'Users', id: userId },
      ],
    }),

    /** Check if current user follows target user */
    getFollowStatus: builder.query<boolean, string>({
      query: (userId) => `/users/${userId}/follow/status`,
      transformResponse: (response: ApiResponse<{ is_following: boolean }>) =>
        response.data.is_following,
      providesTags: (_result, _error, userId) => [
        { type: 'Follows', id: userId },
      ],
    }),

    /** Get follower and following counts for a user */
    getFollowCounts: builder.query<FollowCounts, string>({
      query: (userId) => `/users/${userId}/followers/count`,
      transformResponse: (response: ApiResponse<FollowCounts>) =>
        response.data,
      providesTags: (_result, _error, userId) => [
        { type: 'Follows', id: userId },
      ],
    }),
  }),
});

export const {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowStatusQuery,
  useGetFollowCountsQuery,
} = followApi;

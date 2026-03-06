import { baseApi } from './baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Post,
} from '@/types';

// ─── Query params ───────────────────────────────────────────

export interface GetModerationParams {
  page?: number;
  limit?: number;
}

// ─── API ────────────────────────────────────────────────────

export const moderationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Moderation queue — pending_review posts */
    getModerationQueue: builder.query<
      PaginatedResponse<Post>['data'],
      GetModerationParams | void
    >({
      query: (params) => ({
        url: '/moderation/queue',
        params: params ?? undefined,
      }),
      transformResponse: (response: PaginatedResponse<Post>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'ModerationQueue' as const,
                id,
              })),
              { type: 'ModerationQueue', id: 'LIST' },
            ]
          : [{ type: 'ModerationQueue', id: 'LIST' }],
    }),

    /** Approve a post */
    approvePost: builder.mutation<
      Post,
      { id: string; review_note?: string }
    >({
      query: ({ id, review_note }) => ({
        url: `/moderation/posts/${id}/approve`,
        method: 'PUT',
        body: { review_note },
      }),
      transformResponse: (response: ApiResponse<Post>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ModerationQueue', id },
        { type: 'ModerationQueue', id: 'LIST' },
        { type: 'ModerationHistory', id: 'LIST' },
        { type: 'Posts', id: 'LIST' },
        { type: 'Post', id },
      ],
    }),

    /** Reject a post (review_note required) */
    rejectPost: builder.mutation<
      Post,
      { id: string; review_note: string }
    >({
      query: ({ id, review_note }) => ({
        url: `/moderation/posts/${id}/reject`,
        method: 'PUT',
        body: { review_note },
      }),
      transformResponse: (response: ApiResponse<Post>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ModerationQueue', id },
        { type: 'ModerationQueue', id: 'LIST' },
        { type: 'ModerationHistory', id: 'LIST' },
        { type: 'Posts', id: 'LIST' },
        { type: 'Post', id },
      ],
    }),

    /** Moderation history — reviewed posts */
    getModerationHistory: builder.query<
      PaginatedResponse<Post>['data'],
      GetModerationParams | void
    >({
      query: (params) => ({
        url: '/moderation/history',
        params: params ?? undefined,
      }),
      transformResponse: (response: PaginatedResponse<Post>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'ModerationHistory' as const,
                id,
              })),
              { type: 'ModerationHistory', id: 'LIST' },
            ]
          : [{ type: 'ModerationHistory', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetModerationQueueQuery,
  useApprovePostMutation,
  useRejectPostMutation,
  useGetModerationHistoryQuery,
} = moderationApi;

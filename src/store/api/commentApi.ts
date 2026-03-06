import { baseApi } from './baseApi';
import type {
  ApiResponse,
  Comment,
  PaginatedData,
  PaginatedResponse,
} from '@/types';

// ─── Query params ───────────────────────────────────────────

export interface GetCommentsParams {
  postId: string;
  page?: number;
  limit?: number;
}

export interface CreateCommentBody {
  content: string;
  parent_id?: string | null;
}

// ─── API ────────────────────────────────────────────────────

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Daftar komentar post (paginated, nested replies) */
    getComments: builder.query<PaginatedData<Comment>, GetCommentsParams>({
      query: ({ postId, ...params }) => ({
        url: `/posts/${postId}/comments`,
        params,
      }),
      transformResponse: (response: PaginatedResponse<Comment>) =>
        response.data,
      providesTags: (result, _error, { postId }) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Comments' as const,
                id,
              })),
              { type: 'Comments', id: postId },
            ]
          : [{ type: 'Comments', id: postId }],
    }),

    /** Tambah komentar / reply */
    createComment: builder.mutation<
      Comment,
      { postId: string } & CreateCommentBody
    >({
      query: ({ postId, ...body }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Comment>) => response.data,
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comments', id: postId },
        { type: 'Post', id: postId },
        { type: 'Posts', id: 'LIST' },
      ],
    }),

    /** Hapus komentar (pemilik, moderator, atau administrator) */
    deleteComment: builder.mutation<void, { commentId: string; postId: string }>(
      {
        query: ({ commentId }) => ({
          url: `/comments/${commentId}`,
          method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, { postId }) => [
          { type: 'Comments', id: postId },
          { type: 'Post', id: postId },
          { type: 'Posts', id: 'LIST' },
        ],
      },
    ),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;

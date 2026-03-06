import { baseApi } from './baseApi';
import type { ApiResponse, Post, Vote } from '@/types';

// ─── API ────────────────────────────────────────────────────

export const voteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Get user's current vote on a post (null if not voted) */
    getUserVote: builder.query<Vote | null, string>({
      query: (postId) => `/posts/${postId}/vote`,
      transformResponse: (response: ApiResponse<Vote | null>) =>
        response.data,
      providesTags: (_result, _error, postId) => [
        { type: 'Votes', id: postId },
      ],
    }),

    /** Upvote atau downvote sebuah post */
    votePost: builder.mutation<Post, { postId: string; type: 'up' | 'down' }>({
      query: ({ postId, type }) => ({
        url: `/posts/${postId}/vote`,
        method: 'POST',
        body: { type },
      }),
      transformResponse: (response: ApiResponse<Post>) => response.data,
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Posts', id: 'LIST' },
        { type: 'Votes', id: postId },
      ],
    }),

    /** Hapus vote dari sebuah post */
    removeVote: builder.mutation<void, string>({
      query: (postId) => ({
        url: `/posts/${postId}/vote`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Posts', id: 'LIST' },
        { type: 'Votes', id: postId },
      ],
    }),
  }),
});

export const {
  useGetUserVoteQuery,
  useVotePostMutation,
  useRemoveVoteMutation,
} = voteApi;

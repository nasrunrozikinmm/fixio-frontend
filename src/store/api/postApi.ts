import { baseApi } from './baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Post,
} from '@/types';

// ─── Query params ───────────────────────────────────────────

/**
 * Sort mapping — frontend label → backend query value.
 * Backend expects `column direction` format, e.g. "created_at desc".
 */
export const SORT_OPTIONS = {
  latest: 'created_at desc',
  popular: 'vote_count desc',
  most_discussed: 'comment_count desc',
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export interface GetPostsParams {
  page?: number;
  limit?: number;
  sort?: string;           // backend format: "column direction"
  sector_id?: string;
  region_id?: string;
  status?: string;
  user_id?: string;
  search?: string;
}

// ─── API ────────────────────────────────────────────────────

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** List posts — feed, explore, profile */
    getPosts: builder.query<PaginatedResponse<Post>['data'], GetPostsParams>({
      query: (params) => ({
        url: '/posts',
        params,
      }),
      transformResponse: (response: PaginatedResponse<Post>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Posts' as const, id })),
              { type: 'Posts', id: 'LIST' },
            ]
          : [{ type: 'Posts', id: 'LIST' }],
    }),

    /** Single post detail */
    getPost: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      transformResponse: (response: ApiResponse<Post>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    /** Create new post */
    createPost: builder.mutation<Post, {
      title: string;
      sector_id?: string;
      region_id?: string;
      criticism: string;
      solution: string;
      impact_estimate?: string;
      references?: string;
      status?: 'draft' | 'pending_review';
    }>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Post>) => response.data,
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),

    /** Update existing post */
    updatePost: builder.mutation<Post, { id: string; body: Partial<{
      title: string;
      sector_id: string;
      region_id: string;
      criticism: string;
      solution: string;
      impact_estimate: string;
      references: string;
    }> }>({
      query: ({ id, body }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Post>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Post', id },
        { type: 'Posts', id: 'LIST' },
      ],
    }),

    /** Delete post */
    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Post', id },
        { type: 'Posts', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;

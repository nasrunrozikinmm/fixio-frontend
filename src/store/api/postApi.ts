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
      images?: string[];
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
      images: string[];
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

    /** Following feed — posts from users the current user follows */
    getFollowingFeed: builder.query<PaginatedResponse<Post>['data'], GetPostsParams>({
      query: (params) => ({
        url: '/posts/following',
        params,
      }),
      transformResponse: (response: PaginatedResponse<Post>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Posts' as const, id })),
              { type: 'Posts', id: 'FOLLOWING' },
            ]
          : [{ type: 'Posts', id: 'FOLLOWING' }],
    }),

    /** Related posts — same sector, fallback to popular */
    getRelatedPosts: builder.query<Post[], { id: string; limit?: number }>({
      query: ({ id, limit = 5 }) => ({
        url: `/posts/${id}/related`,
        params: { limit },
      }),
      transformResponse: (response: ApiResponse<Post[]>) => response.data,
      providesTags: (_result, _error, { id }) => [{ type: 'Posts', id: `RELATED_${id}` }],
    }),

    /** Upload images — returns array of public URLs */
    uploadImages: builder.mutation<{ urls: string[] }, FormData>({
      query: (formData) => ({
        url: '/uploads/images',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: ApiResponse<{ urls: string[] }>) => response.data,
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetFollowingFeedQuery,
  useGetRelatedPostsQuery,
  useUploadImagesMutation,
} = postApi;

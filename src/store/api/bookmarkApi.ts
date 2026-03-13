import { baseApi } from './baseApi';
import type { ApiResponse, Bookmark, BookmarkListResponse } from '@/types';

export const bookmarkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Add bookmark to a post */
    addBookmark: builder.mutation<Bookmark, string>({
      query: (postId) => ({
        url: `/bookmarks/posts/${postId}`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<Bookmark>) => response.data,
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Bookmarks', id: postId },
        { type: 'Bookmarks', id: 'LIST' },
      ],
    }),

    /** Remove bookmark from a post */
    removeBookmark: builder.mutation<void, string>({
      query: (postId) => ({
        url: `/bookmarks/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Bookmarks', id: postId },
        { type: 'Bookmarks', id: 'LIST' },
      ],
    }),

    /** Check if current user has bookmarked a post */
    getBookmarkStatus: builder.query<boolean, string>({
      query: (postId) => `/bookmarks/posts/${postId}/status`,
      transformResponse: (response: ApiResponse<{ is_bookmarked: boolean }>) =>
        response.data.is_bookmarked,
      providesTags: (_result, _error, postId) => [
        { type: 'Bookmarks', id: postId },
      ],
    }),

    /** Get current user's bookmarks */
    getMyBookmarks: builder.query<BookmarkListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) =>
        `/bookmarks?page=${page}&limit=${limit}`,
      transformResponse: (response: ApiResponse<BookmarkListResponse>) =>
        response.data,
      providesTags: [{ type: 'Bookmarks', id: 'LIST' }],
    }),
  }),
});

export const {
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  useGetBookmarkStatusQuery,
  useGetMyBookmarksQuery,
} = bookmarkApi;

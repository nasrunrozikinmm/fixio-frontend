import { baseApi } from './baseApi';
import type { ApiResponse, User } from '@/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Get user profile by ID */
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
  }),
});

export const { useGetUserQuery } = userApi;

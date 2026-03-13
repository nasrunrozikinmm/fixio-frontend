import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  credentials: 'include', // JWT via HTTP-only cookie
});

/**
 * Wraps fetchBaseQuery with a global 401 interceptor.
 * On 401 (except /auth/me which is the initial session check),
 * clears auth state and flags session as expired so the UI can
 * prompt the user to log in again.
 *
 * Actions are dispatched by type string to avoid circular imports
 * (baseApi → authSlice → authApi → baseApi).
 */
const baseQueryWith401Handler: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    // /auth/me is the initial session probe — 401 is expected when not logged in
    if (url !== '/auth/me') {
      api.dispatch({ type: 'auth/clearAuth' });
      api.dispatch({ type: 'auth/setSessionExpired', payload: true });
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWith401Handler,
  tagTypes: [
    'Auth',
    'Posts',
    'Post',
    'Comments',
    'Votes',
    'Users',
    'Sectors',
    'Regions',
    'ModerationQueue',
    'ModerationHistory',
    'AdminStats',
    'AdminUsers',
    'Follows',
    'Bookmarks',
    'Notifications',
    'Reports',
  ],
  endpoints: () => ({}),
});

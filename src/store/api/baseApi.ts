import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    credentials: 'include', // JWT via HTTP-only cookie
  }),
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
  ],
  endpoints: () => ({}),
});

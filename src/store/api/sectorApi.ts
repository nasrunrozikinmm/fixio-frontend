import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, Sector } from '@/types';

export const sectorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** List semua sektor — untuk filter dropdown, autocomplete, badge */
    getSectors: builder.query<Sector[], void>({
      query: () => ({ url: '/sectors', params: { limit: 100 } }),
      transformResponse: (response: PaginatedResponse<Sector>) =>
        response.data.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Sectors' as const, id })),
              { type: 'Sectors', id: 'LIST' },
            ]
          : [{ type: 'Sectors', id: 'LIST' }],
    }),

    /** Create sector (admin only) */
    createSector: builder.mutation<Sector, { name: string }>({
      query: (body) => ({
        url: '/sectors',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Sector>) => response.data,
      invalidatesTags: [{ type: 'Sectors', id: 'LIST' }],
    }),

    /** Update sector (admin only) */
    updateSector: builder.mutation<Sector, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/sectors/${id}`,
        method: 'PUT',
        body: { name },
      }),
      transformResponse: (response: ApiResponse<Sector>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sectors', id },
        { type: 'Sectors', id: 'LIST' },
      ],
    }),

    /** Delete sector (admin only) */
    deleteSector: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sectors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Sectors', id },
        { type: 'Sectors', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSectorsQuery,
  useCreateSectorMutation,
  useUpdateSectorMutation,
  useDeleteSectorMutation,
} = sectorApi;

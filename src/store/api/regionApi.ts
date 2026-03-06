import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, Region, RegionType } from '@/types';

export interface CreateRegionParams {
  name: string;
  type: RegionType;
  parent_id?: string;
}

export interface UpdateRegionParams {
  id: string;
  name: string;
  type: RegionType;
}

export const regionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** List semua region — untuk filter dropdown, autocomplete, badge */
    getRegions: builder.query<Region[], void>({
      query: () => ({ url: '/regions', params: { limit: 100 } }),
      transformResponse: (response: PaginatedResponse<Region>) =>
        response.data.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Regions' as const, id })),
              { type: 'Regions', id: 'LIST' },
            ]
          : [{ type: 'Regions', id: 'LIST' }],
    }),

    /** Create region (admin only) */
    createRegion: builder.mutation<Region, CreateRegionParams>({
      query: (body) => ({
        url: '/regions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Region>) => response.data,
      invalidatesTags: [{ type: 'Regions', id: 'LIST' }],
    }),

    /** Update region (admin only) */
    updateRegion: builder.mutation<Region, UpdateRegionParams>({
      query: ({ id, name, type }) => ({
        url: `/regions/${id}`,
        method: 'PUT',
        body: { name, type },
      }),
      transformResponse: (response: ApiResponse<Region>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Regions', id },
        { type: 'Regions', id: 'LIST' },
      ],
    }),

    /** Delete region (admin only) */
    deleteRegion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/regions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Regions', id },
        { type: 'Regions', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} = regionApi;

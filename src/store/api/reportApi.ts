import { baseApi } from './baseApi';
import type {
  ApiResponse,
  PaginatedData,
  PaginatedResponse,
  Report,
} from '@/types';

// ─── Request DTOs ───────────────────────────────────────────

export interface CreateReportBody {
  target_type: 'post' | 'comment';
  target_id: string;
  reason: string;
  description?: string;
}

export interface ReviewReportBody {
  status: 'reviewed' | 'dismissed';
  review_note?: string;
}

// ─── API ────────────────────────────────────────────────────

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Create a report (authenticated user) */
    createReport: builder.mutation<Report, CreateReportBody>({
      query: (body) => ({
        url: '/reports',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Report>) => response.data,
      invalidatesTags: [{ type: 'Reports', id: 'LIST' }],
    }),

    /** Get all reports (moderator/admin) — optional status filter */
    getReports: builder.query<
      PaginatedData<Report>,
      { status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/reports',
        params,
      }),
      transformResponse: (response: PaginatedResponse<Report>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Reports' as const, id })),
              { type: 'Reports', id: 'LIST' },
            ]
          : [{ type: 'Reports', id: 'LIST' }],
    }),

    /** Get pending reports count (moderator/admin) */
    getPendingReportCount: builder.query<number, void>({
      query: () => '/reports/count',
      transformResponse: (response: ApiResponse<{ pending_count: number }>) =>
        response.data.pending_count,
      providesTags: [{ type: 'Reports', id: 'COUNT' }],
    }),

    /** Review a report (moderator/admin) */
    reviewReport: builder.mutation<Report, { reportId: string } & ReviewReportBody>({
      query: ({ reportId, ...body }) => ({
        url: `/reports/${reportId}/review`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<Report>) => response.data,
      invalidatesTags: [
        { type: 'Reports', id: 'LIST' },
        { type: 'Reports', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useCreateReportMutation,
  useGetReportsQuery,
  useGetPendingReportCountQuery,
  useReviewReportMutation,
} = reportApi;

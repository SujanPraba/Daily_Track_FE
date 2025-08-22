import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { DailyUpdate, CreateDailyUpdateDto, UpdateDailyUpdateDto } from '../../types/dailyUpdate';
import { ApiResponse } from '../../types';

export const dailyUpdatesApi = createApi({
  reducerPath: 'dailyUpdatesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/daily-updates',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['DailyUpdates'],
  endpoints: (builder) => ({
    getDailyUpdates: builder.query<
      ApiResponse<DailyUpdate[]>,
      { userId?: string; projectId?: string; teamId?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['DailyUpdates'],
    }),
    getDailyUpdateById: builder.query<ApiResponse<DailyUpdate>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'DailyUpdates', id }],
    }),
    createDailyUpdate: builder.mutation<ApiResponse<DailyUpdate>, CreateDailyUpdateDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DailyUpdates'],
    }),
    updateDailyUpdate: builder.mutation<
      ApiResponse<DailyUpdate>,
      { id: string } & UpdateDailyUpdateDto
    >({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DailyUpdates', id }, 'DailyUpdates'],
    }),
    deleteDailyUpdate: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DailyUpdates'],
    }),
    submitDailyUpdate: builder.mutation<ApiResponse<DailyUpdate>, string>({
      query: (id) => ({
        url: `/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'DailyUpdates', id }, 'DailyUpdates'],
    }),
    approveDailyUpdate: builder.mutation<ApiResponse<DailyUpdate>, string>({
      query: (id) => ({
        url: `/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'DailyUpdates', id }, 'DailyUpdates'],
    }),
    rejectDailyUpdate: builder.mutation<
      ApiResponse<DailyUpdate>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DailyUpdates', id }, 'DailyUpdates'],
    }),
  }),
});

export const {
  useGetDailyUpdatesQuery,
  useGetDailyUpdateByIdQuery,
  useCreateDailyUpdateMutation,
  useUpdateDailyUpdateMutation,
  useDeleteDailyUpdateMutation,
  useSubmitDailyUpdateMutation,
  useApproveDailyUpdateMutation,
  useRejectDailyUpdateMutation,
} = dailyUpdatesApi;
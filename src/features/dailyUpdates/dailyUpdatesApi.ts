import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { 
  DailyUpdate, 
  CreateDailyUpdateDto, 
  UpdateDailyUpdateDto, 
  DailyUpdateSearchParams,
  DailyUpdateSearchResponse 
} from '../../types/dailyUpdate';

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
    // Search daily updates
    searchDailyUpdates: builder.mutation<DailyUpdateSearchResponse, DailyUpdateSearchParams>({
      query: (params) => ({
        url: '/search',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['DailyUpdates'],
    }),

    // Get daily update by ID
    getDailyUpdateById: builder.query<DailyUpdate, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'DailyUpdates', id }],
    }),

    // Create daily update
    createDailyUpdate: builder.mutation<DailyUpdate, CreateDailyUpdateDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DailyUpdates'],
    }),

    // Update daily update
    updateDailyUpdate: builder.mutation<DailyUpdate, { id: string } & UpdateDailyUpdateDto>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DailyUpdates', id }, 'DailyUpdates'],
    }),

    // Delete daily update
    deleteDailyUpdate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DailyUpdates'],
    }),

    // Get all daily updates for a user
    getUserDailyUpdates: builder.query<DailyUpdate[], string>({
      query: (userId) => `?userId=${userId}`,
      providesTags: ['DailyUpdates'],
    }),
  }),
});

export const {
  useSearchDailyUpdatesMutation,
  useGetDailyUpdateByIdQuery,
  useCreateDailyUpdateMutation,
  useUpdateDailyUpdateMutation,
  useDeleteDailyUpdateMutation,
  useGetUserDailyUpdatesQuery,
} = dailyUpdatesApi;
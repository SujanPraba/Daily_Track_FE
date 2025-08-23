import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { Module, CreateModuleDto, UpdateModuleDto } from '../../types/module';
import { ApiResponse, ProjectsApiResponse } from '../../types';

export const modulesApi = createApi({
  reducerPath: 'modulesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/modules',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Modules'],
  endpoints: (builder) => ({
    getModules: builder.query<ApiResponse<Module[]>, { search?: string }>({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Modules'],
    }),
    searchModules: builder.mutation<ProjectsApiResponse<Module>, {
      searchTerm?: string;
      page?: number;
      limit?: number;
    }>({
      query: (data) => ({
        url: '/search',
        method: 'POST',
        body: data,
      }),
    }),
    getModuleById: builder.query<Module, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Modules', id }],
    }),
    getModulesWithPermissions: builder.query<Module[], void>({
      query: () => '/with-permissions',
      providesTags: ['Modules'],
    }),
    createModule: builder.mutation<ApiResponse<Module>, CreateModuleDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Modules'],
    }),
    updateModule: builder.mutation<ApiResponse<Module>, { id: string } & UpdateModuleDto>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Modules', id }, 'Modules'],
    }),
    deleteModule: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Modules'],
    }),
  }),
});

export const {
  useGetModulesQuery,
  useSearchModulesMutation,
  useGetModuleByIdQuery,
  useGetModulesWithPermissionsQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
} = modulesApi;

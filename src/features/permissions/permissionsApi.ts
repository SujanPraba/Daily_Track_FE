import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { Permission, CreatePermissionDto, UpdatePermissionDto } from '../../types/permission';
import { ApiResponse } from '../../types';

export const permissionsApi = createApi({
  reducerPath: 'permissionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/permissions',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Permissions'],
  endpoints: (builder) => ({
    getPermissions: builder.query<ApiResponse<Permission[]>, { search?: string }>({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Permissions'],
    }),
    getPermissionById: builder.query<ApiResponse<Permission>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Permissions', id }],
    }),
    createPermission: builder.mutation<ApiResponse<Permission>, CreatePermissionDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Permissions'],
    }),
    updatePermission: builder.mutation<
      ApiResponse<Permission>,
      { id: string } & UpdatePermissionDto
    >({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Permissions', id }, 'Permissions'],
    }),
    deletePermission: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetPermissionByIdQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionsApi;
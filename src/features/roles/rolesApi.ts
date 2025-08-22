import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { Role, CreateRoleDto, UpdateRoleDto } from '../../types/role';
import { ApiResponse } from '../../types';

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/roles',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Roles', 'RolePermissions'],
  endpoints: (builder) => ({
    getRoles: builder.query<ApiResponse<Role[]>, { search?: string }>({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Roles'],
    }),
    getRoleById: builder.query<ApiResponse<Role>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
    }),
    createRole: builder.mutation<ApiResponse<Role>, CreateRoleDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, { id: string } & UpdateRoleDto>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Roles', id }, 'Roles'],
    }),
    deleteRole: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
    getRolePermissions: builder.query<ApiResponse<{ permissionIds: string[] }>, string>({
      query: (roleId) => `/${roleId}/permissions`,
      providesTags: (_result, _error, roleId) => [{ type: 'RolePermissions', id: roleId }],
    }),
    updateRolePermissions: builder.mutation<
      ApiResponse<void>,
      { roleId: string; permissionIds: string[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `/${roleId}/permissions`,
        method: 'PUT',
        body: { permissionIds },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'RolePermissions', id: roleId },
        { type: 'Roles', id: roleId },
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} = rolesApi;
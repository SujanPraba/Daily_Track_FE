import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { User, UserWithDetails, CreateUserDto, UpdateUserDto, UserAssignments, UserAllInformation } from '../../types/user';
import { ApiResponse, ProjectsApiResponse } from '../../types';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/users',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<UserWithDetails[]>, { search?: string }>({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['Users'],
    }),
    getUserById: builder.query<ApiResponse<UserWithDetails>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    createUser: builder.mutation<ApiResponse<User>, CreateUserDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<ApiResponse<User>, { id: string } & UpdateUserDto>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }, 'Users'],
    }),
    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    updateUserRoles: builder.mutation<
      ApiResponse<void>,
      { userId: string; roleIds: string[] }
    >({
      query: ({ userId, roleIds }) => ({
        url: `/${userId}/roles`,
        method: 'PUT',
        body: { roleIds },
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Users', id: userId }, 'Users'],
    }),
    updateUserAssignments: builder.mutation<
      ApiResponse<void>,
      { userId: string } & UserAssignments
    >({
      query: ({ userId, ...assignments }) => ({
        url: `/${userId}/assignments`,
        method: 'PUT',
        body: assignments,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Users', id: userId }, 'Users'],
    }),
    getUserRoles: builder.query<ApiResponse<{ roleIds: string[] }>, string>({
      query: (userId) => `/${userId}/roles`,
      providesTags: (_result, _error, userId) => [{ type: 'Users', id: userId }],
    }),
    getUserAssignments: builder.query<ApiResponse<UserAssignments>, string>({
      query: (userId) => `/${userId}/assignments`,
      providesTags: (_result, _error, userId) => [{ type: 'Users', id: userId }],
    }),
    searchUsers: builder.mutation<ProjectsApiResponse, {
      searchTerm?: string;
      page?: number;
      limit?: number;
      department?: string;
      position?: string;
    }>({
      query: (data) => ({
        url: '/search',
        method: 'POST',
        body: data,
      }),
    }),
    getAllUsersInformation: builder.query<UserAllInformation[], void>({
      query: () => '/all-information',
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserRolesMutation,
  useUpdateUserAssignmentsMutation,
  useGetUserRolesQuery,
  useGetUserAssignmentsQuery,
  useSearchUsersMutation,
  useGetAllUsersInformationQuery,
} = usersApi;
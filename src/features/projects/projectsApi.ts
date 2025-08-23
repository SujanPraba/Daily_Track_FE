import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { Project, CreateProjectDto, UpdateProjectDto } from '../../types/project';
import { ApiResponse, PaginatedResponse, QueryParams, ProjectsApiResponse } from '../../types';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/projects',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Projects', 'ProjectMembers'],
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectsApiResponse<Project>, QueryParams>({
      query: (params) => ({
        url: '/search',
        method: 'POST',
        body: {
          searchTerm: params.search || '',
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
          managerId: params.managerId,
        },
      }),
      providesTags: ['Projects'],
    }),
    getProjectById: builder.query<Project, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Projects', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation<Project, { id: string } & UpdateProjectDto>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Projects', id }, 'Projects'],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjectMembers: builder.query<{ userIds: string[] }, string>({
      query: (projectId) => `/${projectId}/members`,
      providesTags: (_result, _error, projectId) => [{ type: 'ProjectMembers', id: projectId }],
    }),
    searchProjects: builder.mutation<ProjectsApiResponse<Project>, {
      searchTerm?: string;
      page?: number;
      limit?: number;
      status?: string;
      managerId?: string;
    }>({
      query: (data) => ({
        url: '/search',
        method: 'POST',
        body: data,
      }),
    }),
    updateProjectMembers: builder.mutation<
      void,
      { projectId: string; userIds: string[] }
    >({
      query: ({ projectId, userIds }) => ({
        url: `/${projectId}/members`,
        method: 'PUT',
        body: { userIds },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'ProjectMembers', id: projectId },
        { type: 'Projects', id: projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useUpdateProjectMembersMutation,
  useSearchProjectsMutation,
} = projectsApi;
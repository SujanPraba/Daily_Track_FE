import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { Project, CreateProjectDto, UpdateProjectDto } from '../../types/project';
import { ApiResponse } from '../../types';

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
    getProjects: builder.query<Project[], { search?: string }>({
      query: (params) => ({
        url: '',
        params,
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
} = projectsApi;
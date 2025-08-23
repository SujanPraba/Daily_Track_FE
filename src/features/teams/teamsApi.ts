import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../types/team';
import { ApiResponse, ProjectsApiResponse, QueryParams } from '../../types';

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/teams',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Teams', 'TeamMembers'],
  endpoints: (builder) => ({
    getTeams: builder.query<ProjectsApiResponse<Team>, QueryParams>({
      query: (params) => ({
        url: '/search',
        method: 'POST',
        body: {
          searchTerm: params.search || '',
          page: params.page || 1,
          limit: params.limit || 10,
          projectId: params.projectId,
          leadId: params.leadId,
        },
      }),
      providesTags: ['Teams'],
    }),
    getTeamById: builder.query<ApiResponse<Team>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Teams', id }],
    }),
    createTeam: builder.mutation<ApiResponse<Team>, CreateTeamDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teams'],
    }),
    updateTeam: builder.mutation<ApiResponse<Team>, { id: string } & UpdateTeamDto>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Teams', id }, 'Teams'],
    }),
    deleteTeam: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teams'],
    }),
    getTeamMembers: builder.query<ApiResponse<{ userIds: string[] }>, string>({
      query: (teamId) => `/${teamId}/members`,
      providesTags: (_result, _error, teamId) => [{ type: 'TeamMembers', id: teamId }],
    }),
    updateTeamMembers: builder.mutation<
      ApiResponse<void>,
      { teamId: string; userIds: string[] }
    >({
      query: ({ teamId, userIds }) => ({
        url: `/${teamId}/members`,
        method: 'PUT',
        body: { userIds },
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'TeamMembers', id: teamId },
        { type: 'Teams', id: teamId },
      ],
    }),
    searchTeams: builder.mutation<ProjectsApiResponse<Team>, {
      searchTerm?: string;
      page?: number;
      limit?: number;
      projectId?: string;
      leadId?: string;
    }>({
      query: (data) => ({
        url: '/search',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useGetTeamMembersQuery,
  useUpdateTeamMembersMutation,
  useSearchTeamsMutation,
} = teamsApi;
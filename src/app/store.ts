import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSlice from '../features/auth/authSlice';
import usersSlice from '../features/users/usersSlice';
import rolesSlice from '../features/roles/rolesSlice';
import permissionsSlice from '../features/permissions/permissionsSlice';
import projectsSlice from '../features/projects/projectsSlice';
import teamsSlice from '../features/teams/teamsSlice';
import dailyUpdatesSlice from '../features/dailyUpdates/dailyUpdatesSlice';
import { authApi } from '../features/auth/authApi';
import { usersApi } from '../features/users/usersApi';
import { rolesApi } from '../features/roles/rolesApi';
import { permissionsApi } from '../features/permissions/permissionsApi';
import { projectsApi } from '../features/projects/projectsApi';
import { teamsApi } from '../features/teams/teamsApi';
import { dailyUpdatesApi } from '../features/dailyUpdates/dailyUpdatesApi';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    roles: rolesSlice,
    permissions: permissionsSlice,
    projects: projectsSlice,
    teams: teamsSlice,
    dailyUpdates: dailyUpdatesSlice,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [teamsApi.reducerPath]: teamsApi.reducer,
    [dailyUpdatesApi.reducerPath]: dailyUpdatesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
      projectsApi.middleware,
      teamsApi.middleware,
      dailyUpdatesApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
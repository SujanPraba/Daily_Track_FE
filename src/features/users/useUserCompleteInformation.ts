import { useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../app/store';
import {
  fetchUserCompleteInformation,
  selectUserCompleteInformation,
  selectUsersLoading,
  selectUsersError,
} from './usersSlice';

export const useUserCompleteInformation = (autoFetch: boolean = true) => {
  const dispatch = useAppDispatch();
  const userCompleteInformation = useSelector(selectUserCompleteInformation);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  const fetchUserInfo = useCallback(() => {
    dispatch(fetchUserCompleteInformation());
  }, [dispatch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchUserInfo();
    }
  }, [autoFetch, fetchUserInfo]);

  return {
    userCompleteInformation,
    loading,
    error,
    fetchUserInfo,
  };
};

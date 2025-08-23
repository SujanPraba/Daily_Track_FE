import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
  fetchAllUsersInformation, 
  selectAllUsersInformation, 
  selectUsersLoading, 
  selectUsersError 
} from './usersSlice';

export const useUsersAllInformation = (autoFetch: boolean = true) => {
  const dispatch = useDispatch();
  const allUsersInformation = useSelector(selectAllUsersInformation);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  const fetchUsers = useCallback(() => {
    dispatch(fetchAllUsersInformation());
  }, [dispatch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && allUsersInformation.length === 0) {
      fetchUsers();
    }
  }, [autoFetch, fetchUsers, allUsersInformation.length]);

  return {
    allUsersInformation,
    loading,
    error,
    fetchUsers,
  };
};

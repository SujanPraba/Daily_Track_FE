import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UserAllInformation } from '../../types/user';

// Async thunk for fetching all users information
export const fetchAllUsersInformation = createAsyncThunk(
  'users/fetchAllUsersInformation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/users/all-information', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users information');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users information');
    }
  }
);

// Async thunk for fetching complete information for a specific user
export const fetchUserCompleteInformation = createAsyncThunk(
  'users/fetchUserCompleteInformation',
  async (_, { rejectWithValue }) => {
    const user = localStorage.getItem('user');
    const userId = JSON.parse(user || '{}').id;
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}/complete-information`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user complete information');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user complete information');
    }
  }
);

interface UsersState {
  selectedUser: User | null;
  allUsersInformation: UserAllInformation[];
  userCompleteInformation: UserAllInformation | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  selectedUser: null,
  allUsersInformation: [],
  userCompleteInformation: null,
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setAllUsersInformation: (state, action: PayloadAction<UserAllInformation[]>) => {
      state.allUsersInformation = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsersInformation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersInformation.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsersInformation = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsersInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserCompleteInformation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCompleteInformation.fulfilled, (state, action) => {
        state.loading = false;
        state.userCompleteInformation = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCompleteInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedUser, setAllUsersInformation, setLoading, setError } = usersSlice.actions;

// Selectors
export const selectAllUsersInformation = (state: { users: UsersState }) => state.users.allUsersInformation;
export const selectUserCompleteInformation = (state: { users: UsersState }) => state.users.userCompleteInformation;
export const selectUsersLoading = (state: { users: UsersState }) => state.users.loading;
export const selectUsersError = (state: { users: UsersState }) => state.users.error;

export default usersSlice.reducer;
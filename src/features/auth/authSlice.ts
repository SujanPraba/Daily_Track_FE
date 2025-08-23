import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthResponse } from '../../types/auth';

// Helper function to get user from localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    console.log('AuthSlice - getUserFromStorage - userStr:', userStr);
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('AuthSlice - getUserFromStorage - parsed user:', user);
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

console.log('AuthSlice - Initial state:', initialState);
console.log('AuthSlice - Token from localStorage:', localStorage.getItem('token'));
console.log('AuthSlice - isAuthenticated:', !!localStorage.getItem('token'));

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      console.log('AuthSlice - Setting credentials:', action.payload);
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', action.payload.access_token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      console.log('AuthSlice - State after setting credentials:', state);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
});

export const { setCredentials, logout, setLoading, setError, updateUser } = authSlice.actions;
export default authSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Permission } from '../../types/permission';

interface PermissionsState {
  selectedPermission: Permission | null;
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  selectedPermission: null,
  loading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setSelectedPermission: (state, action: PayloadAction<Permission | null>) => {
      state.selectedPermission = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSelectedPermission, setLoading, setError } = permissionsSlice.actions;
export default permissionsSlice.reducer;
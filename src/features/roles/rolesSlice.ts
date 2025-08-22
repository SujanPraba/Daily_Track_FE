import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../../types/role';

interface RolesState {
  selectedRole: Role | null;
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  selectedRole: null,
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSelectedRole, setLoading, setError } = rolesSlice.actions;
export default rolesSlice.reducer;
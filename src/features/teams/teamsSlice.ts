import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team } from '../../types/team';

interface TeamsState {
  selectedTeam: Team | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  selectedTeam: null,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setSelectedTeam: (state, action: PayloadAction<Team | null>) => {
      state.selectedTeam = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSelectedTeam, setLoading, setError } = teamsSlice.actions;
export default teamsSlice.reducer;
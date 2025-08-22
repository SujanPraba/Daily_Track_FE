import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DailyUpdate } from '../../types';

interface DailyUpdatesState {
  updates: DailyUpdate[];
  selectedUpdate: DailyUpdate | null;
  loading: boolean;
  error: string | null;
}

const initialState: DailyUpdatesState = {
  updates: [],
  selectedUpdate: null,
  loading: false,
  error: null,
};

const dailyUpdatesSlice = createSlice({
  name: 'dailyUpdates',
  initialState,
  reducers: {
    setUpdates: (state, action: PayloadAction<DailyUpdate[]>) => {
      state.updates = action.payload;
    },
    setSelectedUpdate: (state, action: PayloadAction<DailyUpdate | null>) => {
      state.selectedUpdate = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUpdates, setSelectedUpdate, setLoading, setError } = dailyUpdatesSlice.actions;
export default dailyUpdatesSlice.reducer;
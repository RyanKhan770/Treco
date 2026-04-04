import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trailsAPI } from '../../services/api';

export const fetchTrails = createAsyncThunk(
  'trails/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await trailsAPI.getAll(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load trails');
    }
  }
);

export const fetchTrailById = createAsyncThunk(
  'trails/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await trailsAPI.getOne(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Trail not found');
    }
  }
);

const trailsSlice = createSlice({
  name: 'trails',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
    filter: 'All',
    searchQuery: '',
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSelected: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrails.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTrails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrailById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrailById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchTrailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, setSearchQuery, clearSelected } = trailsSlice.actions;
export default trailsSlice.reducer;

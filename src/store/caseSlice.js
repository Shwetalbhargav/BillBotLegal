import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCases, createCase, updateCase, deleteCase } from '@/services/api';

export const fetchCases = createAsyncThunk('cases/fetch', async () => {
  const { data } = await getCases();
  return data;
});

export const createCase = createAsyncThunk('cases/create', async (caseData) => {
  const { data } = await createCase(caseData);
  return data;
});

export const editCase = createAsyncThunk('cases/update', async ({ id, caseData }) => {
  const { data } = await updateCase(id, caseData);
  return data;
});

export const removeCase = createAsyncThunk('cases/delete', async (id) => {
  await deleteCase(id);
  return id;
});

const caseSlice = createSlice({
  name: 'cases',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCases.pending, (state) => { state.loading = true; })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCase.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(editCase.fulfilled, (state, action) => {
        const idx = state.list.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(removeCase.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c._id !== action.payload);
      });
  },
});

export default caseSlice.reducer;

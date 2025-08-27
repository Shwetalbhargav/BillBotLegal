import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCaseTeam, assignUserToCase, removeUserFromCase } from '@/services/api';

export const fetchTeam = createAsyncThunk('team/fetch', async (caseId) => {
  const { data } = await getCaseTeam(caseId);
  return data;
});

export const assignUser = createAsyncThunk('team/assign', async (assignment) => {
  const { data } = await assignUserToCase(assignment);
  return data;
});

export const removeUser = createAsyncThunk('team/remove', async ({ caseId, userId }) => {
  await removeUserFromCase(caseId, userId);
  return userId;
});

const teamSlice = createSlice({
  name: 'team',
  initialState: { members: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => { state.loading = true; })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(assignUser.fulfilled, (state, action) => {
        state.members.push(action.payload);
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.members = state.members.filter(m => m._id !== action.payload);
      });
  },
});

export default teamSlice.reducer;

// src/store/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getClients,
  createClient as createClientAPI,
  updateClient as updateClientAPI,
  deleteClient as deleteClientAPI,
} from '@/services/api';

// Thunks (renamed to avoid any collision with API function names)
export const fetchClientsThunk = createAsyncThunk('clients/fetch', async () => {
  const { data } = await getClients();
  return data;
});

export const createClientThunk = createAsyncThunk(
  'clients/create',
  async (client) => {
    const { data } = await createClientAPI(client);
    return data;
  }
);

export const updateClientThunk = createAsyncThunk(
  'clients/update',
  async ({ id, client }) => {
    const { data } = await updateClientAPI(id, client);
    return data;
  }
);

export const deleteClientThunk = createAsyncThunk(
  'clients/delete',
  async (id) => {
    await deleteClientAPI(id);
    return id;
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchClientsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchClientsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch clients';
      })
      // create
      .addCase(createClientThunk.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createClientThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to create client';
      })
      // update
      .addCase(updateClientThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateClientThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to update client';
      })
      // delete
      .addCase(deleteClientThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteClientThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to delete client';
      });
  },
});

export default clientSlice.reducer;

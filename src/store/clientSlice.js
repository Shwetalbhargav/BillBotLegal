// src/store/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getClients,
  createClient as createClientAPI,
  updateClient as updateClientAPI,
  deleteClient as deleteClientAPI,
} from '@/services/api';

export const fetchClients = createAsyncThunk('clients/fetch', async () => {
  const { data } = await getClients();
  return data;
});

export const createClient = createAsyncThunk('clients/create', async (client) => {
  const { data } = await createClientAPI(client);
  return data;
});

export const editClient = createAsyncThunk(
  'clients/update',
  async ({ id, client }) => {
    const { data } = await updateClientAPI(id, client);
    return data;
  }
);

export const removeClient = createAsyncThunk('clients/delete', async (id) => {
  await deleteClientAPI(id);
  return id;
});

const clientSlice = createSlice({
  name: 'clients',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(editClient.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(removeClient.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      });
  },
});

export default clientSlice.reducer;

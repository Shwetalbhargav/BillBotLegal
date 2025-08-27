import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmailEntries, createEmailEntry } from '@/services/api';
import { pushEmailToClio } from '@/services/api';


export const fetchEmails = createAsyncThunk('emails/fetch', async () => {
  const { data } = await getEmailEntries();
  return data;
});

export const addEmail = createAsyncThunk('emails/create', async (entry) => {
  const { data } = await createEmailEntry(entry);
  return data;
});

export const pushClio = createAsyncThunk('emails/pushClio', async (id) => {
  const { data } = await pushEmailToClio(id);          // or return await pushEmailToClio(id)
  return data?.entry || data; // unwrap to the entry
});

const emailSlice = createSlice({
  name: 'emails',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmails.pending, (state) => { state.loading = true; })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addEmail.fulfilled, (state, action) => {
        const e = action.payload?.entry || action.payload;
        if (e) state.list.unshift(e);
      })
      .addCase(pushClio.fulfilled, (state, action) => {
        const updated = action.payload;
        const i = state.list.findIndex(x => (x._id||x.id) === (updated?._id||updated?.id));
        if (i >= 0) state.list[i] = { ...state.list[i], ...updated };
      });
  },
});



extraReducers: (builder) => {
  builder
    // ...
    .addCase(addEmail.fulfilled, (state, action) => {
      const e = action.payload?.entry || action.payload; // unwrap create response
      if (e) state.list.unshift(e);
    })
    .addCase(pushClio.fulfilled, (state, action) => {
      const updated = action.payload;
      const i = state.list.findIndex(x => (x._id||x.id) === (updated?._id||updated?.id));
      if (i >= 0) state.list[i] = { ...state.list[i], ...updated };
    });
};


export default emailSlice.reducer;

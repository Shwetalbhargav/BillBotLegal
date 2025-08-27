// src/store/aiSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { generateEmail } from '@/services/api';

export const genEmail = createAsyncThunk('ai/generateEmail', async (prompt) => {
  const { data } = await generateEmail(prompt);
  return data; // { email: "..." }
});

const aiSlice = createSlice({
  name: 'ai',
  initialState: { loading: false, email: '', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(genEmail.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(genEmail.fulfilled, (s, a) => { s.loading = false; s.email = a.payload.email || ''; });
    b.addCase(genEmail.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
  }
});
export default aiSlice.reducer;

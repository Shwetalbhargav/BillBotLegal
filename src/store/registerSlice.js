// src/store/registerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser } from '@/services/api';


export const registerThunk = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
try {
// payload may contain: { name, email, password, role, mobile, address, qualifications }
const { data } = await registerUser(payload);
return data; // { user, token? } depending on backend
} catch (err) {
const message = err?.response?.data?.message || err?.message || 'Registration failed';
return rejectWithValue(message);
}
});

const initialState = { status: 'idle', error: null };


const registerSlice = createSlice({
name: 'register',
initialState,
reducers: { resetRegisterState: () => initialState },
extraReducers: (builder) => {
builder
.addCase(registerThunk.pending, (s) => { s.status = 'loading'; s.error = null; })
.addCase(registerThunk.fulfilled, (s) => { s.status = 'succeeded'; })
.addCase(registerThunk.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || 'Registration failed'; });
},
});


export const { resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;
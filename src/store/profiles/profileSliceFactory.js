/ src/store/profiles/profileSliceFactory.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export function buildProfileSlice(key, api) {
// Thunks
const fetchMine = createAsyncThunk(`${key}/fetchMine`, async (_, { rejectWithValue }) => {
try { const { data } = await api.getMine(); return data.profile || data; }
catch (err) { return rejectWithValue(err.response?.data?.error || 'Failed to load profile'); }
});


const fetchByUser = createAsyncThunk(`${key}/fetchByUser`, async (userId, { rejectWithValue }) => {
try { const { data } = await api.getByUserId(userId); return data.profile || data; }
catch (err) { return rejectWithValue(err.response?.data?.error || 'Failed to load profile'); }
});


const createProfile = createAsyncThunk(`${key}/create`, async (payload, { rejectWithValue }) => {
try { const { data } = await api.create(payload); return data.profile || data; }
catch (err) { return rejectWithValue(err.response?.data?.error || 'Failed to create profile'); }
});

const updateProfile = createAsyncThunk(`${key}/update`, async ({ id, payload }, { rejectWithValue }) => {
try { const { data } = await api.update(id, payload); return data.profile || data; }
catch (err) { return rejectWithValue(err.response?.data?.error || 'Failed to update profile'); }
});


const removeProfile = createAsyncThunk(`${key}/remove`, async (id, { rejectWithValue }) => {
try { await api.remove(id); return id; }
catch (err) { return rejectWithValue(err.response?.data?.error || 'Failed to delete profile'); }
});


const slice = createSlice({
name: key,
initialState: { entity: null, loading: false, error: null },
reducers: { clear: (s) => { s.entity = null; s.error = null; } },
extraReducers: (builder) => {
[fetchMine, fetchByUser, createProfile, updateProfile, removeProfile].forEach((thunk) => {
builder
.addCase(thunk.pending, (s) => { s.loading = true; s.error = null; })
.addCase(thunk.fulfilled, (s, a) => { s.loading = false; if (a.type.endsWith('/remove/fulfilled')) return; s.entity = a.payload; })
.addCase(thunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
});
},
});

return { reducer: slice.reducer, actions: slice.actions, thunks: { fetchMine, fetchByUser, createProfile, updateProfile, removeProfile } };
}
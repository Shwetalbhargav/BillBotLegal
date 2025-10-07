
// src/store/AdminSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAdminMe, updateAdminMe } from "@/services/api";

export const fetchAdminMe = createAsyncThunk("admin/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await getAdminMe();
    // normalize shape: prefer data.profile; else data
    return data?.profile || data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || "Failed to load admin profile");
  }
});

export const updateAdminMeThunk = createAsyncThunk("admin/updateMe", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await updateAdminMe(payload);
    return data?.profile || data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || "Failed to update admin profile");
  }
});

const initialState = {
  me: null,
  loading: false,
  error: null,
  updating: false,
  updateError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminMe.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAdminMe.fulfilled, (s, a) => { s.loading = false; s.me = a.payload; })
      .addCase(fetchAdminMe.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateAdminMeThunk.pending, (s) => { s.updating = true; s.updateError = null; })
      .addCase(updateAdminMeThunk.fulfilled, (s, a) => { s.updating = false; s.me = a.payload; })
      .addCase(updateAdminMeThunk.rejected, (s, a) => { s.updating = false; s.updateError = a.payload; });
  },
});

export const selectAdminMe = (state) => state.admin?.me;
export const selectAdminLoading = (state) => state.admin?.loading;
export const selectAdminUpdating = (state) => state.admin?.updating;

export default adminSlice.reducer;

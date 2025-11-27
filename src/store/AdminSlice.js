
// src/store/AdminSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAdminMe,
  updateAdminMe,
  getAdminDashboard,
  listAdminsApi,
  createAdminApi,
  getAdminByIdApi,
  updateAdminByIdApi,
  deleteAdminByIdApi,
} from "@/services/api";


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

// ----- Dashboard -----
export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getAdminDashboard();
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Failed to load admin dashboard");
    }
  }
);

// ----- Admin list -----
export const fetchAdmins = createAsyncThunk(
  "admin/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await listAdminsApi(params);
      // backend returns { admins: [...] }
      return data?.admins || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Failed to load admins");
    }
  }
);

// ----- Single admin (detail) -----
export const fetchAdminById = createAsyncThunk(
  "admin/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getAdminByIdApi(id);
      return data?.admin || data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Failed to load admin");
    }
  }
);

// ----- Create admin -----
export const createAdminThunk = createAsyncThunk(
  "admin/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createAdminApi(payload);
      // backend: { admin, user }
      return data?.admin || data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Failed to create admin");
    }
  }
);

// ----- Update admin by id -----
export const updateAdminByIdThunk = createAsyncThunk(
  "admin/updateById",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await updateAdminByIdApi(id, payload);
      return data?.admin || data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Failed to update admin");
    }
  }
);

// ----- Delete admin -----
export const deleteAdminByIdThunk = createAsyncThunk(
  "admin/deleteById",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminByIdApi(id);
      return id; // so reducer can remove it from list
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || "Failed to delete admin");
    }
  }
);

const initialState = {
  // self
  me: null,
  loading: false,
  error: null,
  updating: false,
  updateError: null,

  // dashboard
  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,

  // admin list + detail
  items: [],
  listLoading: false,
  listError: null,

  selectedAdmin: null,
  selectedLoading: false,
  selectedError: null,

  creating: false,
  createError: null,

  deleting: false,
  deleteError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ----- self / me -----
      .addCase(fetchAdminMe.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAdminMe.fulfilled, (s, a) => { s.loading = false; s.me = a.payload; })
      .addCase(fetchAdminMe.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateAdminMeThunk.pending, (s) => { s.updating = true; s.updateError = null; })
      .addCase(updateAdminMeThunk.fulfilled, (s, a) => { s.updating = false; s.me = a.payload; })
      .addCase(updateAdminMeThunk.rejected, (s, a) => { s.updating = false; s.updateError = a.payload; })

      // ----- dashboard -----
      .addCase(fetchAdminDashboard.pending, (s) => { s.dashboardLoading = true; s.dashboardError = null; })
      .addCase(fetchAdminDashboard.fulfilled, (s, a) => { s.dashboardLoading = false; s.dashboard = a.payload; })
      .addCase(fetchAdminDashboard.rejected, (s, a) => { s.dashboardLoading = false; s.dashboardError = a.payload; })

      // ----- list -----
      .addCase(fetchAdmins.pending, (s) => { s.listLoading = true; s.listError = null; })
      .addCase(fetchAdmins.fulfilled, (s, a) => { s.listLoading = false; s.items = a.payload; })
      .addCase(fetchAdmins.rejected, (s, a) => { s.listLoading = false; s.listError = a.payload; })

      // ----- single admin -----
      .addCase(fetchAdminById.pending, (s) => { s.selectedLoading = true; s.selectedError = null; })
      .addCase(fetchAdminById.fulfilled, (s, a) => { s.selectedLoading = false; s.selectedAdmin = a.payload; })
      .addCase(fetchAdminById.rejected, (s, a) => { s.selectedLoading = false; s.selectedError = a.payload; })

      // ----- create -----
      .addCase(createAdminThunk.pending, (s) => { s.creating = true; s.createError = null; })
      .addCase(createAdminThunk.fulfilled, (s, a) => {
        s.creating = false;
        s.items.unshift(a.payload); // add to top of list
      })
      .addCase(createAdminThunk.rejected, (s, a) => { s.creating = false; s.createError = a.payload; })

      // ----- update by id -----
      .addCase(updateAdminByIdThunk.fulfilled, (s, a) => {
        const updated = a.payload;
        s.selectedAdmin = updated;
        const idx = s.items.findIndex((x) => x.id === updated.id);
        if (idx !== -1) s.items[idx] = updated;
      })

      // ----- delete -----
      .addCase(deleteAdminByIdThunk.pending, (s) => { s.deleting = true; s.deleteError = null; })
      .addCase(deleteAdminByIdThunk.fulfilled, (s, a) => {
        s.deleting = false;
        const id = a.payload;
        s.items = s.items.filter((x) => x.id !== id);
        if (s.selectedAdmin?.id === id) s.selectedAdmin = null;
      })
      .addCase(deleteAdminByIdThunk.rejected, (s, a) => { s.deleting = false; s.deleteError = a.payload; });
  },
});

export const selectAdminMe = (state) => state.admin?.me;
export const selectAdminLoading = (state) => state.admin?.loading;
export const selectAdminUpdating = (state) => state.admin?.updating;
export const selectAdminDashboard = (state) => state.admin?.dashboard;
export const selectAdmins = (state) => state.admin?.items;
export const selectSelectedAdmin = (state) => state.admin?.selectedAdmin;

export default adminSlice.reducer;

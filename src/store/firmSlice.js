// src/store/firmSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  firms,
  getFirmSettingsApi,
  updateFirmCurrencyApi,
  updateFirmTaxSettingsApi,
  updateFirmBillingPreferencesApi,
} from '../services/api'; 

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedFirmId: null,

  settings: null,
  settingsLoading: false,
  settingsError: null,
  settingsSaving: false,
};


// ---- Thunks ----
// ---- Thunks ----
export const fetchFirms = createAsyncThunk(
  'firms/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await firms.list();
      const data = res.data?.data ?? res.data;
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load firms'
      );
    }
  }
);

export const createFirmThunk = createAsyncThunk(
  'firms/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await firms.create(payload);
      const data = res.data?.data ?? res.data;
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create firm'
      );
    }
  }
);

export const updateFirmThunk = createAsyncThunk(
  'firms/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await firms.update(id, data);
      const updated = res.data?.data ?? res.data;
      return updated;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update firm'
      );
    }
  }
);

export const deleteFirmThunk = createAsyncThunk(
  'firms/delete',
  async (id, { rejectWithValue }) => {
    try {
      await firms.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to delete firm'
      );
    }
  }
);
// Fetch settings (currency, taxSettings, billingPreferences) for a firm
export const fetchFirmSettings = createAsyncThunk(
  'firms/fetchSettings',
  async (firmId, { rejectWithValue }) => {
    try {
      const res = await getFirmSettingsApi(firmId);
      const settings = res.data?.data ?? res.data;
      return { firmId, settings };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to fetch firm settings'
      );
    }
  }
);

// Update currency
export const updateFirmCurrencyThunk = createAsyncThunk(
  'firms/updateCurrency',
  async ({ firmId, currency }, { rejectWithValue }) => {
    try {
      const res = await updateFirmCurrencyApi(firmId, { currency });
      const settings = res.data?.data ?? res.data;
      return { firmId, settings };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update currency'
      );
    }
  }
);

// Update tax settings
export const updateFirmTaxSettingsThunk = createAsyncThunk(
  'firms/updateTaxSettings',
  async ({ firmId, patch }, { rejectWithValue }) => {
    try {
      const res = await updateFirmTaxSettingsApi(firmId, patch);
      const settings = res.data?.data ?? res.data;
      return { firmId, settings };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update tax settings'
      );
    }
  }
);

// Update billing preferences
export const updateFirmBillingPreferencesThunk = createAsyncThunk(
  'firms/updateBillingPreferences',
  async ({ firmId, patch }, { rejectWithValue }) => {
    try {
      const res = await updateFirmBillingPreferencesApi(firmId, patch);
      const settings = res.data?.data ?? res.data;
      return { firmId, settings };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update billing preferences'
      );
    }
  }
);

// ---- Slice ----
const firmSlice = createSlice({
  name: 'firms',
  initialState,
  reducers: {
    setSelectedFirmId(state, action) {
      state.selectedFirmId = action.payload;
    },
    clearFirmError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ---- FETCH ALL FIRMS ----
    builder
      .addCase(fetchFirms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFirms.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFirms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ---- CREATE FIRM ----
    builder
      .addCase(createFirmThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFirmThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createFirmThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ---- UPDATE FIRM ----
    builder
      .addCase(updateFirmThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFirmThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated) return;

        const id = updated._id || updated.id;
        const idx = state.items.findIndex(
          (f) => String(f._id || f.id) === String(id)
        );
        if (idx !== -1) {
          state.items[idx] = updated;
        }
      })
      .addCase(updateFirmThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ---- DELETE FIRM ----
    builder
      .addCase(deleteFirmThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFirmThunk.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.items = state.items.filter(
          (f) => String(f._id || f.id) !== String(id)
        );
      })
      .addCase(deleteFirmThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ---- FETCH FIRM SETTINGS ----
    builder
      .addCase(fetchFirmSettings.pending, (state) => {
        state.settingsLoading = true;
        state.settingsError = null;
      })
      .addCase(fetchFirmSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        const { firmId, settings } = action.payload || {};
        if (!firmId || !settings) return;

        state.settings = settings;

        const id = settings._id || firmId;
        const idx = state.items.findIndex(
          (f) => String(f._id || f.id) === String(id)
        );
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            currency: settings.currency ?? state.items[idx].currency,
            taxSettings: settings.taxSettings ?? state.items[idx].taxSettings,
            billingPreferences:
              settings.billingPreferences ??
              state.items[idx].billingPreferences,
          };
        }
      })
      .addCase(fetchFirmSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.settingsError = action.payload || action.error?.message || null;
      });

    // ---- UPDATE CURRENCY ----
    builder
      .addCase(updateFirmCurrencyThunk.pending, (state) => {
        state.settingsSaving = true;
        state.settingsError = null;
      })
      .addCase(updateFirmCurrencyThunk.fulfilled, (state, action) => {
        state.settingsSaving = false;
        const { firmId, settings } = action.payload || {};
        if (!firmId || !settings) return;

        state.settings = settings;

        const id = settings._id || firmId;
        const idx = state.items.findIndex(
          (f) => String(f._id || f.id) === String(id)
        );
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            currency: settings.currency,
            taxSettings: settings.taxSettings ?? state.items[idx].taxSettings,
            billingPreferences:
              settings.billingPreferences ??
              state.items[idx].billingPreferences,
          };
        }
      })
      .addCase(updateFirmCurrencyThunk.rejected, (state, action) => {
        state.settingsSaving = false;
        state.settingsError = action.payload || action.error?.message || null;
      });

    // ---- UPDATE TAX SETTINGS ----
    builder
      .addCase(updateFirmTaxSettingsThunk.pending, (state) => {
        state.settingsSaving = true;
        state.settingsError = null;
      })
      .addCase(updateFirmTaxSettingsThunk.fulfilled, (state, action) => {
        state.settingsSaving = false;
        const { firmId, settings } = action.payload || {};
        if (!firmId || !settings) return;

        state.settings = settings;

        const id = settings._id || firmId;
        const idx = state.items.findIndex(
          (f) => String(f._id || f.id) === String(id)
        );
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            currency: settings.currency ?? state.items[idx].currency,
            taxSettings: settings.taxSettings,
            billingPreferences:
              settings.billingPreferences ??
              state.items[idx].billingPreferences,
          };
        }
      })
      .addCase(updateFirmTaxSettingsThunk.rejected, (state, action) => {
        state.settingsSaving = false;
        state.settingsError = action.payload || action.error?.message || null;
      });

    // ---- UPDATE BILLING PREFERENCES ----
    builder
      .addCase(updateFirmBillingPreferencesThunk.pending, (state) => {
        state.settingsSaving = true;
        state.settingsError = null;
      })
      .addCase(updateFirmBillingPreferencesThunk.fulfilled, (state, action) => {
        state.settingsSaving = false;
        const { firmId, settings } = action.payload || {};
        if (!firmId || !settings) return;

        state.settings = settings;

        const id = settings._id || firmId;
        const idx = state.items.findIndex(
          (f) => String(f._id || f.id) === String(id)
        );
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            currency: settings.currency ?? state.items[idx].currency,
            taxSettings: settings.taxSettings ?? state.items[idx].taxSettings,
            billingPreferences: settings.billingPreferences,
          };
        }
      })
      .addCase(updateFirmBillingPreferencesThunk.rejected, (state, action) => {
        state.settingsSaving = false;
        state.settingsError = action.payload || action.error?.message || null;
      });
  },
});

export const { setSelectedFirmId, clearFirmError } = firmSlice.actions;
export default firmSlice.reducer;


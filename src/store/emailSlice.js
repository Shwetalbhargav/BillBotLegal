// src/store/emailSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listEmailEntries,
  createEmailEntry,
  updateEmailEntry,
  deleteEmailEntry,
  mapEmailEntryApi,
  generateEmailNarrativeApi,
  createActivityFromEmailApi,
  createTimeEntryFromEmailApi,
  pushEmailEntryToClio,
  bulkIngestEmailEntries,
} from "@/services/api";


// ========== THUNKS ==========

// Fetch list of email entries (optionally with filters)
export const fetchEmails = createAsyncThunk(
  "emails/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await listEmailEntries(params);
      // Controller returns: { ok: true, data: [...] }
      const list =
        Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      return list;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load email entries"
      );
    }
  }
);

// Create a new email entry
export const addEmail = createAsyncThunk(
  "emails/create",
  async (entry, { rejectWithValue }) => {
    try {
      const { data } = await createEmailEntry(entry);
      // createEmailEntry controller: { ok: true, data: entry }
      const created = data?.data ?? data;
      return created;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create email entry"
      );
    }
  }
);

// Push an email entry to Clio
export const pushClio = createAsyncThunk(
  "emails/pushClio",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await pushEmailEntryToClio(id);
      // pushEmailEntryToClio controller: { ok: true, data: { clioActivityId } }
      const clioActivityId = data?.data?.clioActivityId ?? data?.clioActivityId;
      return { id, clioActivityId };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to push email entry to Clio"
      );
    }
  }
);
// Update an existing email entry
export const updateEmail = createAsyncThunk(
  "emails/update",
  async ({ id, patch }, { rejectWithValue }) => {
    try {
      const { data } = await updateEmailEntry(id, patch);
      const updated = data?.data ?? data;
      return updated;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update email entry"
      );
    }
  }
);

// Delete an email entry
export const removeEmail = createAsyncThunk(
  "emails/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmailEntry(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete email entry"
      );
    }
  }
);

// Map email entry to client/case
export const mapEmail = createAsyncThunk(
  "emails/map",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await mapEmailEntryApi(id, payload);
      const updated = data?.data ?? data;
      return updated;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to map email entry"
      );
    }
  }
);

// Generate/Regenerate GPT narrative
export const regenerateNarrative = createAsyncThunk(
  "emails/regenerateNarrative",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await generateEmailNarrativeApi(id);
      const updated = data?.data ?? data;
      return updated;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate narrative"
      );
    }
  }
);

// Create Activity from email entry
export const createActivityFromEmail = createAsyncThunk(
  "emails/createActivityFromEmail",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await createActivityFromEmailApi(id);
      // controller: { ok: true, data: activity }
      const activity = data?.data ?? data;
      const activityId = activity?._id || activity?.id;
      return { id, activityId };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create activity from email"
      );
    }
  }
);

// Create TimeEntry from email entry
export const createTimeEntryFromEmail = createAsyncThunk(
  "emails/createTimeEntryFromEmail",
  async ({ id, payload = {} }, { rejectWithValue }) => {
    try {
      const { data } = await createTimeEntryFromEmailApi(id, payload);
      // controller: { ok: true, data: timeEntry }
      const timeEntry = data?.data ?? data;
      const timeEntryId = timeEntry?._id || timeEntry?.id;
      return { id, timeEntryId };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create time entry from email"
      );
    }
  }
);

// Bulk ingest (from extension)
export const bulkIngestEmails = createAsyncThunk(
  "emails/bulkIngest",
  async (entries, { rejectWithValue }) => {
    try {
      const { data } = await bulkIngestEmailEntries(entries);
      // controller: { ok: true, results: [...] }
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to bulk ingest email entries"
      );
    }
  }
);

// ========== SLICE ==========

const initialState = {
  list: [],
  loading: false,
  error: null,

  creating: false,
  createError: null,

  updating: false,
  updateError: null,

  deleting: false,
  deleteError: null,

  mapping: false,
  mapError: null,

  narrativeLoading: false,
  narrativeError: null,

  pushing: false,
  pushError: null,

  activityCreating: false,
  activityError: null,

  timeEntryCreating: false,
  timeEntryError: null,

  bulkIngesting: false,
  bulkIngestError: null,
  bulkIngestResult: null,
};


const emailSlice = createSlice({
  name: "emails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ----- FETCH -----
    builder
      .addCase(fetchEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ----- CREATE -----
    builder
      .addCase(addEmail.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(addEmail.fulfilled, (state, action) => {
        state.creating = false;
        const e = action.payload;
        if (e) {
          state.list.unshift(e); // newest on top
        }
      })
      .addCase(addEmail.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || action.error?.message || null;
      });

    // ----- UPDATE -----
    builder
      .addCase(updateEmail.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateEmail.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        if (!updated) return;
        const id = updated._id || updated.id;
        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx !== -1) {
          state.list[idx] = updated;
        }
      })
      .addCase(updateEmail.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || action.error?.message || null;
      });

    // ----- DELETE -----
    builder
      .addCase(removeEmail.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(removeEmail.fulfilled, (state, action) => {
        state.deleting = false;
        const id = action.payload;
        state.list = state.list.filter(
          (x) => String(x._id || x.id) !== String(id)
        );
      })
      .addCase(removeEmail.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || action.error?.message || null;
      });

    // ----- MAP TO CLIENT/CASE -----
    builder
      .addCase(mapEmail.pending, (state) => {
        state.mapping = true;
        state.mapError = null;
      })
      .addCase(mapEmail.fulfilled, (state, action) => {
        state.mapping = false;
        const updated = action.payload;
        if (!updated) return;
        const id = updated._id || updated.id;
        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx !== -1) {
          state.list[idx] = updated;
        }
      })
      .addCase(mapEmail.rejected, (state, action) => {
        state.mapping = false;
        state.mapError = action.payload || action.error?.message || null;
      });

    // ----- REGENERATE NARRATIVE -----
    builder
      .addCase(regenerateNarrative.pending, (state) => {
        state.narrativeLoading = true;
        state.narrativeError = null;
      })
      .addCase(regenerateNarrative.fulfilled, (state, action) => {
        state.narrativeLoading = false;
        const updated = action.payload;
        if (!updated) return;
        const id = updated._id || updated.id;
        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx !== -1) {
          state.list[idx] = updated;
        }
      })
      .addCase(regenerateNarrative.rejected, (state, action) => {
        state.narrativeLoading = false;
        state.narrativeError =
          action.payload || action.error?.message || null;
      });

    // ----- PUSH TO CLIO -----
    builder
      .addCase(pushClio.pending, (state) => {
        state.pushing = true;
        state.pushError = null;
      })
      .addCase(pushClio.fulfilled, (state, action) => {
        state.pushing = false;
        const { id, clioActivityId } = action.payload || {};
        if (!id) return;

        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx === -1) return;

        const current = state.list[idx] || {};
        const meta = {
          ...(current.meta || {}),
          clioPushed: true,
          clioActivityId:
            clioActivityId ?? current.meta?.clioActivityId,
          clioPushedAt: new Date().toISOString(),
        };

        state.list[idx] = {
          ...current,
          meta,
        };
      })
      .addCase(pushClio.rejected, (state, action) => {
        state.pushing = false;
        state.pushError = action.payload || action.error?.message || null;
      });

    // ----- CREATE ACTIVITY FROM EMAIL -----
    builder
      .addCase(createActivityFromEmail.pending, (state) => {
        state.activityCreating = true;
        state.activityError = null;
      })
      .addCase(createActivityFromEmail.fulfilled, (state, action) => {
        state.activityCreating = false;
        const { id, activityId } = action.payload || {};
        if (!id || !activityId) return;

        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx === -1) return;

        const current = state.list[idx] || {};
        const meta = {
          ...(current.meta || {}),
          activityId,
        };

        state.list[idx] = {
          ...current,
          meta,
        };
      })
      .addCase(createActivityFromEmail.rejected, (state, action) => {
        state.activityCreating = false;
        state.activityError =
          action.payload || action.error?.message || null;
      });

    // ----- CREATE TIME ENTRY FROM EMAIL -----
    builder
      .addCase(createTimeEntryFromEmail.pending, (state) => {
        state.timeEntryCreating = true;
        state.timeEntryError = null;
      })
      .addCase(createTimeEntryFromEmail.fulfilled, (state, action) => {
        state.timeEntryCreating = false;
        const { id, timeEntryId } = action.payload || {};
        if (!id || !timeEntryId) return;

        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx === -1) return;

        const current = state.list[idx] || {};
        const meta = {
          ...(current.meta || {}),
          timeEntryId,
        };

        state.list[idx] = {
          ...current,
          meta,
        };
      })
      .addCase(createTimeEntryFromEmail.rejected, (state, action) => {
        state.timeEntryCreating = false;
        state.timeEntryError =
          action.payload || action.error?.message || null;
      });

    // ----- BULK INGEST -----
    builder
      .addCase(bulkIngestEmails.pending, (state) => {
        state.bulkIngesting = true;
        state.bulkIngestError = null;
        state.bulkIngestResult = null;
      })
      .addCase(bulkIngestEmails.fulfilled, (state, action) => {
        state.bulkIngesting = false;
        state.bulkIngestResult = action.payload || null;
        // We *don't* mutate list here; caller can trigger fetchEmails()
      })
      .addCase(bulkIngestEmails.rejected, (state, action) => {
        state.bulkIngesting = false;
        state.bulkIngestError =
          action.payload || action.error?.message || null;
      });
  },
});

// ========== SELECTORS ==========

export const selectEmails = (state) => state.emails?.list || [];
export const selectEmailsLoading = (state) => state.emails?.loading;
export const selectEmailsError = (state) => state.emails?.error;
export const selectEmailCreating = (state) => state.emails?.creating;
export const selectEmailPushing = (state) => state.emails?.pushing;
export const selectEmailUpdating = (state) => state.emails?.updating;
export const selectEmailDeleting = (state) => state.emails?.deleting;
export const selectEmailMapping = (state) => state.emails?.mapping;
export const selectEmailNarrativeLoading = (state) => state.emails?.narrativeLoading;
export const selectEmailActivityCreating = (state) => state.emails?.activityCreating;
export const selectEmailTimeEntryCreating = (state) => state.emails?.timeEntryCreating;
export const selectEmailBulkIngesting = (state) => state.emails?.bulkIngesting;
export const selectEmailBulkIngestResult = (state) => state.emails?.bulkIngestResult;

export default emailSlice.reducer;

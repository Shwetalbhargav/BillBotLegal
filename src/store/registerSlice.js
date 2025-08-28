import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser } from "@/services/api"; // uses /api/auth/register

// Async thunk
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await registerUser(payload);
      return data; // whatever your API returns on success
    } catch (err) {
      let message =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  status: "idle",      // idle | loading | succeeded | failed
  error: null,
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    resetRegisterState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Registration failed";
      });
  },
});

export const { resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;

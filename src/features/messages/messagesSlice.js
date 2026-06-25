import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiClient";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (type = "received", { rejectWithValue }) => {
    try {
      const endpoint =
        type === "sent"
          ? "/messages/index.php?type=sent"
          : "/messages/index.php";
      const response = await apiRequest(endpoint);

      return { type, data: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (msgData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiRequest("/messages/send.php", {
        method: "POST",
        body: JSON.stringify(msgData),
      });
      dispatch(fetchMessages("sent"));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: { received: [], sent: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        const messages =
          action.payload.data?.messages || action.payload.data || [];
        if (action.payload.type === "sent") {
          state.sent = messages;
        } else {
          state.received = messages;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default messagesSlice.reducer;

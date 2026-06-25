import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiClient";

const initialState = {
  list: [],
  myRegistrations: [],
  current: null,
  categories: [],
  status: "idle",
  error: null,
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append("q", filters.q);
      if (filters.category_id)
        params.append("category_id", filters.category_id);
      if (filters.price_type) params.append("price_type", filters.price_type);
      if (filters.type) params.append("type", filters.type);
      if (filters.date_filter)
        params.append("date_filter", filters.date_filter);

      const queryString = params.toString();
      const endpoint = queryString
        ? `/events/index.php?${queryString}`
        : "/events/index.php";

      const response = await apiRequest(endpoint);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addEvent = createAsyncThunk(
  "events/addEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/events/store.php", {
        method: "POST",
        body: JSON.stringify(eventData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/events/show.php?id=${eventId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerToEvent = createAsyncThunk(
  "events/registerToEvent",
  async (registerData, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/events/register.php", {
        method: "POST",
        body: JSON.stringify(registerData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchMyRegistrations = createAsyncThunk(
  "events/fetchMyRegistrations",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `/events/index.php?registered_user_id=${userId}`,
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const sendEventMessage = createAsyncThunk(
  "events/sendEventMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/events/message.php", {
        method: "POST",
        body: JSON.stringify(messageData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/categories/index.php", {
        method: "GET",
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/categories/store.php", {
        method: "POST",
        body: JSON.stringify(categoryData),
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload?.events || [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchEventById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = {
          ...action.payload?.event,
          messages: action.payload?.messages || [],
        };
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMyRegistrations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myRegistrations = action.payload?.events || [];
      })
      .addCase(fetchMyRegistrations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerToEvent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerToEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(registerToEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(sendEventMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendEventMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(sendEventMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload?.categories || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default eventsSlice.reducer;

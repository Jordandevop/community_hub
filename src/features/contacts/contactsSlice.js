import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiClient";

export const fetchContacts = createAsyncThunk('contacts/fetchContacts', async (_, { rejectWithValue }) => {
    try {
        return await apiRequest('/contacts/index.php');
    } catch (error) {
        return rejectWithValue(error.message);
    }
});


export const acceptContact = createAsyncThunk('contacts/acceptContact', async (contactId, { dispatch, rejectWithValue }) => {
    try {
        const response = await apiRequest('/contacts/accept.php', {
            method: 'POST',
            body: JSON.stringify({ contact_id: contactId }),
        });

        dispatch(fetchContacts());
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});


export const sendContactRequest = createAsyncThunk('contacts/sendContactRequest', async (receiverId, { rejectWithValue }) => {
    try {
        return await apiRequest('/contacts/store.php', {
            method: 'POST',
            body: JSON.stringify({ receiver_id: receiverId }),
        });
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const contactsSlice = createSlice({
    name: 'contacts',
    initialState: { list: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchContacts.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchContacts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload.contacts || action.payload || [];

            })
            .addCase(fetchContacts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default contactsSlice.reducer;
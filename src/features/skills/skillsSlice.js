import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiClient";

const initialState = {
    skills: [],
    status: 'idle',
    error: null,
};

export const fetchSkills = createAsyncThunk(
    'skills/fetchSkills',
    async (userId = null, { rejectWithValue }) => {
        try {
            const endpoint = userId 
                ? `/skills/index.php?user_id=${userId}`
                : '/skills/index.php';
            return await apiRequest(endpoint);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addSkill = createAsyncThunk(
    'skills/addSkill',
    async (skillData, { rejectWithValue }) => {
        try {
            const response = await apiRequest('/skills/store.php', {
                method: 'POST',
                body: JSON.stringify(skillData),
            });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const skillsSlice = createSlice({
    name: 'skills',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSkills.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSkills.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.skills = action.payload.skills || [];
            })
            .addCase(fetchSkills.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addSkill.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addSkill.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(addSkill.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default skillsSlice.reducer;
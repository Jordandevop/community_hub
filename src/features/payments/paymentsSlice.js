import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiClient";
import { updateLocalUser } from "../auth/authSlice"; 

export const payPremium = createAsyncThunk(
    'payments/payPremium',
    async (paymentData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiRequest('/payments/premium.php', {
                method: 'POST',
                body: JSON.stringify(paymentData),
            });
            
            dispatch(updateLocalUser({ is_premium: true }));
            
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const fetchPayments = createAsyncThunk(
    'payments/fetchPayments',
    async (_, { rejectWithValue }) => {
        try {
            return await apiRequest('/payments/index.php');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const paymentsSlice = createSlice({
    name: 'payments',
    initialState: { list: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(payPremium.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(payPremium.fulfilled, (state) => { state.status = 'succeeded'; })
            .addCase(payPremium.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
            
            .addCase(fetchPayments.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default paymentsSlice.reducer;
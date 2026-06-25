import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiRequest } from "../../api/apiClient"

const storedUser = localStorage.getItem('user') 
const storedToken = localStorage.getItem('token') 

const initialState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    status: 'waiting',
    error: null,
}

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userInfos, { rejectWithValue }) => {
        try {
            return await apiRequest('/auth/login.php', {
                method: 'POST',
                body: JSON.stringify(userInfos),
            })
        } catch(error) {
            return rejectWithValue(error.message)
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userInfos, {rejectWithValue}) => {
        try {
            return await apiRequest('/auth/register.php', {
                method: 'POST',
                body: JSON.stringify(userInfos),
            })
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state, action)=>{
            state.user = null;
            state.token = null;
            state.status = 'waiting';
            state.error= null;

            localStorage.removeItem('user');
            localStorage.removeItem('token')
        },
        updateLocalUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },

    extraReducers : (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'pending'
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'success'
                state.user = action.payload.user
              
                state.token = action.payload.token 

                localStorage.setItem('user', JSON.stringify(action.payload.user))
                localStorage.setItem('token', action.payload.token) 
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'error'
                state.error = action.payload
            })
            .addCase(registerUser.pending, (state)=> {
                state.status = 'pending'
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action)=>{
                state.status= 'success'
                state.user = action.payload

                state.token = action.payload.token

                localStorage.setItem('user', JSON.stringify(action.payload))
                localStorage.setItem('token', action.payload.token) 
            })
            .addCase(registerUser.rejected, (state, action)=>{
                 state.status = 'error'
                state.error = action.payload
            })
    }
})

export const {logout, updateLocalUser} = authSlice.actions
export default authSlice.reducer;
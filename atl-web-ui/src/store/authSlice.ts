import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types/auth';

const initialState: AuthState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        updateUserTenant: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.tenantId = action.payload;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        updateSetupStatus: (state, action: PayloadAction<boolean>) => {
            if (state.user) {
                // @ts-ignore - tenantSetupCompleted might be added back or handled differently
                state.user.tenantSetupCompleted = action.payload;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        updateCurrency: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.currency = action.payload;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
});

export const { loginSuccess, logout, updateUserTenant, updateSetupStatus, updateCurrency } = authSlice.actions;
export default authSlice.reducer;

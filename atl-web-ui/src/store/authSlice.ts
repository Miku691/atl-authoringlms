import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types/auth';

const initialState: AuthState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
        refreshSuccess: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
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

export const { loginSuccess, refreshSuccess, logout, updateUserTenant, updateSetupStatus, updateCurrency } = authSlice.actions;
export default authSlice.reducer;

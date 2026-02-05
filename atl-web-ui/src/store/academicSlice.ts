import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

interface AcademicState {
    isReady: boolean;
    hasActiveOfferings: boolean;
    loading: boolean;
    error: string | null;
    missingComponents: string[];
}

const initialState: AcademicState = {
    isReady: false,
    hasActiveOfferings: false,
    loading: true, // Start true to prevent premature redirect in App.tsx
    error: null,
    missingComponents: [],
};

// Async Thunks
export const fetchAcademicReadiness = createAsyncThunk(
    'academic/fetchReadiness',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/ims-academic-service/readiness/status');
            if (response.data.status === 'SUCCESS') {
                return response.data.apiData;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch readiness');
        }
    }
);

export const fetchActiveOfferings = createAsyncThunk(
    'academic/fetchActiveOfferings',
    async (tenantId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/ims-academic-service/offerings/tenant/${tenantId}/has-active`);
            if (response.data.status === 'SUCCESS') {
                return response.data.apiData;
            }
            return rejectWithValue(response.data.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch active offerings');
        }
    }
);

const academicSlice = createSlice({
    name: 'academic',
    initialState,
    reducers: {
        resetAcademicState: (state) => {
            state.isReady = false;
            state.hasActiveOfferings = false;
            state.missingComponents = [];
        }
    },
    extraReducers: (builder) => {
        // Readiness
        builder.addCase(fetchAcademicReadiness.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAcademicReadiness.fulfilled, (state, action) => {
            state.loading = false;
            state.isReady = action.payload.ready; // Fixed: JSON returns 'ready', not 'isReady'
            state.missingComponents = action.payload.missingComponents || [];
        });
        builder.addCase(fetchAcademicReadiness.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Active Offerings
        builder.addCase(fetchActiveOfferings.fulfilled, (state, action) => {
            state.hasActiveOfferings = action.payload;
        });
    },
});

export const { resetAcademicState } = academicSlice.actions;
export default academicSlice.reducer;

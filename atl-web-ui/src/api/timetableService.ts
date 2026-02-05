import api from '../utils/api';

export interface TimetableEntry {
    id: string;
    tenantId: string;
    timetableSlotId: string;
    offeringId: string;
    subjectId: string;
    instructorId: string;
    room: string;
    // Enriched fields for UI
    subjectName?: string;
    instructorName?: string;
    startTime?: string;
    endTime?: string;
    periodNumber?: number;
    slotLabel?: string;
}

export interface TimetableSlot {
    id: string;
    tenantId: string;
    timetableMasterId: string;
    dayOfWeek: number; // 1-7 (Mon-Sun)
    startTime: string; // "09:00:00"
    endTime: string;   // "10:00:00"
    slotLabel: string;
    periodNumber: number;
    entries: TimetableEntry[];
}

export interface TimetableMaster {
    id: string;
    tenantId: string;
    offeringId: string;
    academicYearId: string;
    name: string;
    timezone: string;
    slots: TimetableSlot[];
}

export const timetableService = {
    getByOfferingId: async (offeringId: string) => {
        const response = await api.get(`/ims-academic-service/timetable-masters/offering/${offeringId}`);
        return response.data.apiData;
    },

    getByOfferingAndTenant: async (offeringId: string, tenantId: string) => {
        const response = await api.get(`/ims-academic-service/timetable-masters/offering/${offeringId}/tenant/${tenantId}`);
        return response.data.apiData;
    },

    createMaster: async (data: Partial<TimetableMaster>) => {
        const response = await api.post('/ims-academic-service/timetable-masters', data);
        return response.data.apiData;
    },

    createSlot: async (data: Partial<TimetableSlot>) => {
        const response = await api.post('/ims-academic-service/timetable-slots', data);
        return response.data.apiData;
    },

    deleteSlot: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/timetable-slots/${id}`);
        return response.data.apiData;
    },

    createEntry: async (data: Partial<TimetableEntry>) => {
        const response = await api.post('/ims-academic-service/timetable-entries', data);
        return response.data.apiData;
    },

    updateEntry: async (id: string, data: Partial<TimetableEntry>) => {
        const response = await api.put(`/ims-academic-service/timetable-entries/${id}`, data);
        return response.data;
    },

    deleteEntry: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/timetable-entries/${id}`);
        return response.data.apiData;
    }
};

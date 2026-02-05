import api from '../utils/api';

export interface AttendanceRecord {
    id?: string;
    personId: string;
    personName?: string;
    personType?: 'STUDENT' | 'STAFF' | 'INSTRUCTOR';
    offeringId?: string;
    subjectId?: string;
    date?: string;
    status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';
    remarks?: string;
}

export interface AttendanceBatchRequest {
    offeringId?: string;
    subjectId?: string;
    date: string;
    personType?: 'STUDENT' | 'STAFF' | 'INSTRUCTOR';
    records: AttendanceRecord[];
}

export const attendanceService = {
    markBulkAttendance: async (tenantId: string, request: AttendanceBatchRequest) => {
        const response = await api.post(`/ims-academic-service/attendance/tenant/${tenantId}/bulk`, request);
        return response.data;
    },

    getAttendanceByOfferingAndDate: async (offeringId: string, date: string) => {
        const response = await api.get(`/ims-academic-service/attendance/offering/${offeringId}?date=${date}`);
        return response.data;
    },

    getStudentAttendance: async (studentId: string) => {
        const response = await api.get(`/ims-academic-service/attendance/student/${studentId}`);
        return response.data;
    },

    getStaffAttendance: async (tenantId: string, date: string) => {
        const response = await api.get(`/ims-academic-service/attendance/tenant/${tenantId}/staff?date=${date}`);
        return response.data;
    },

    getAttendanceStats: async (personId: string, personType: string, month: number, year: number) => {
        const response = await api.get(`/ims-academic-service/attendance/stats/${personId}?personType=${personType}&month=${month}&year=${year}`);
        return response.data;
    },

    updateIndividualRecord: async (tenantId: string, recordId: string, data: AttendanceRecord) => {
        const response = await api.put(`/ims-academic-service/attendance/tenant/${tenantId}/${recordId}`, data);
        return response.data;
    }
};

import api from '../utils/api';

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    status: string;
    email?: string;
    phone?: string;
    dob?: string;
    gender?: string;
    bloodGroup?: string;
    category?: string;
    religion?: string;
    address?: string;
    profileImageUrl?: string;
    birthFormId?: string;
    isOrphan?: boolean;
    caste?: string;
    previousSchool?: string;
    admissionDiscount?: number;
    tenantId: string;
}

export interface BulkAdmissionRequest {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    admissionNo: string;
    offeringId: string;
    // guardians...
}

export const studentService = {
    getAllStudents: async () => {
        const response = await api.get('/ims-student-service/students');
        return response.data;
    },

    getStudentById: async (id: string) => {
        const response = await api.get(`/ims-student-service/students/${id}`);
        return response.data;
    },

    getStudentByUserId: async (userId: string) => {
        const response = await api.get(`/ims-student-service/students/user/${userId}`);
        return response.data;
    },

    executeBulkAdmission: async (tenantId: string, data: BulkAdmissionRequest[]) => {
        const response = await api.post(`/ims-student-service/students/bulk/${tenantId}`, data);
        return response.data;
    },

    // Enrollments
    getStudentEnrollments: async (studentId: string) => {
        const response = await api.get(`/ims-student-service/enrollments/student/${studentId}`);
        return response.data;
    },

    // Guardians
    getStudentGuardians: async (studentId: string) => {
        const response = await api.get(`/ims-student-service/guardians/student/${studentId}`);
        return response.data;
    },

    getStudentsByOffering: async (offeringId: string, page = 0, size = 100) => {
        const response = await api.get(`/ims-student-service/enrollments/offering/${offeringId}?page=${page}&size=${size}`);
        return response.data;
    },

    searchStudents: async (params: {
        tenantId: string;
        gender?: string;
        offeringId?: string;
        searchTerm?: string;
        page?: number;
        size?: number;
    }) => {
        const { tenantId, gender, offeringId, searchTerm, page = 0, size = 10 } = params;
        let url = `/ims-student-service/students/search?tenantId=${tenantId}&page=${page}&size=${size}`;
        if (gender) url += `&gender=${encodeURIComponent(gender)}`;
        if (offeringId) url += `&offeringId=${encodeURIComponent(offeringId)}`;
        if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        const response = await api.get(url);
        return response.data;
    }
};

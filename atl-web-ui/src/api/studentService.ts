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
    religion?: string;
    address?: string;
    profileImageUrl?: string;
    previousSchool?: string;
    admissionDiscount?: number;
    tenantId: string;
    // New Fields
    fatherName?: string;
    motherName?: string;
    idProofType?: string;
    idProofNumber?: string;
    ethnicity?: string;
    languages?: string;
    nationality?: string;
    maritalStatus?: string;
    enrollmentType?: string;
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

    getStudentGuardianMappings: async (studentId: string) => {
        const response = await api.get(`/ims-student-service/student-guardian-mappings/student/${studentId}`);
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
    },

    bulkPromote: async (data: {
        studentIds: string[];
        targetOfferingId: string;
        targetAcademicYear: string;
        newStatus: string;
        tenantId: string;
    }) => {
        const response = await api.post('/ims-student-service/enrollments/bulk-promote', data);
        return response.data;
    },
    updateStudent: async (id: string, data: Partial<Student>) => {
        const response = await api.put(`/ims-student-service/students/${id}`, data);
        return response.data;
    }
};

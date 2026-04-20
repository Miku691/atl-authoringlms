import api from '../utils/api';

export interface InstructorAvailability {
    id: string;
    dayOfWeek: string;
    startTime: string; // "09:00:00"
    endTime: string;
    isAvailable: boolean;
}

export interface InstructorSubject {
    id: string;
    subjectId: string;
    subjectName: string;
    level: 'PRIMARY' | 'SECONDARY';
}

export interface Instructor {
    id?: string;
    userId: string;
    tenantId: string;
    firstName: string;
    lastName?: string;
    qualification?: string;
    experienceYears?: number;
    specialization?: string;
    joinDate?: string;
    status: 'active' | 'inactive';
}

export const instructorService = {
    // Basic CRUD
    getAllInstructors: async (page = 0, size = 10) => {
        const response = await api.get(`/ims-instructor-service/instructors?page=${page}&size=${size}`);
        return response.data;
    },

    getInstructorsByTenant: async (tenantId: string, page = 0, size = 100) => {
        const response = await api.get(`/ims-instructor-service/instructors/tenant/${tenantId}?page=${page}&size=${size}`);
        
        // Extract the actual array from various response structures
        const data = response.data?.apiData;
        if (data && typeof data === 'object' && 'content' in data) {
            return data.content;
        }
        return data || [];
    },

    getInstructorById: async (id: string) => {
        const response = await api.get(`/ims-instructor-service/instructors/${id}`);
        return response.data;
    },

    getInstructorByUserId: async (userId: string) => {
        const response = await api.get(`/ims-instructor-service/instructors/user/${userId}`);
        return response.data;
    },

    createInstructor: async (data: Instructor) => {
        const response = await api.post('/ims-instructor-service/instructors', data);
        return response.data;
    },

    updateInstructor: async (id: string, data: Partial<Instructor>) => {
        const response = await api.put(`/ims-instructor-service/instructors/${id}`, data);
        return response.data;
    },

    deleteInstructor: async (id: string) => {
        const response = await api.delete(`/ims-instructor-service/instructors/${id}`);
        return response.data;
    },

    resolveProfile: async (email: string, tenantId: string) => {
        const response = await api.get(`/ims-instructor-service/instructors/profile/resolve?email=${email}&tenantId=${tenantId}`);
        return response.data;
    },

    // Availability
    getAvailability: async (instructorId: string) => {
        const response = await api.get(`/ims-instructor-service/instructors/availability/${instructorId}`);
        return response.data;
    },

    setAvailability: async (data: Partial<InstructorAvailability>) => {
        const response = await api.post('/ims-instructor-service/instructors/availability', data);
        return response.data;
    },

    deleteAvailability: async (id: string) => {
        const response = await api.delete(`/ims-instructor-service/instructors/availability/${id}`);
        return response.data;
    },

    // Subjects
    getSubjects: async (instructorId: string) => {
        const response = await api.get(`/ims-instructor-service/instructors/subjects/${instructorId}`);
        return response.data;
    },

    assignSubject: async (data: { instructorId: string, subjectId: string, level: string }) => {
        const response = await api.post('/ims-instructor-service/instructors/subjects', data);
        return response.data;
    },

    // Academic Assignments (linking to Offerings in academic-service)
    assignToOffering: async (data: { offeringId: string, instructorId: string, subjectId?: string, role?: string, startDate?: string, endDate?: string }) => {
        const response = await api.post(`/ims-academic-service/offering-instructors`, data);
        return response.data;
    },

    getAssignmentsByOffering: async (offeringId: string) => {
        const response = await api.get(`/ims-academic-service/offering-instructors/offering/${offeringId}`);
        return response.data;
    },

    getAssignmentsByInstructor: async (instructorId: string) => {
        const response = await api.get(`/ims-academic-service/offering-instructors/instructor/${instructorId}`);
        return response.data;
    },

    removeAssignment: async (assignmentId: string) => {
        const response = await api.delete(`/ims-academic-service/offering-instructors/${assignmentId}`);
        return response.data;
    }
};

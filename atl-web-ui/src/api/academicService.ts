import api from '../utils/api';

export interface ImsOffering {
    id: string;
    name: string;
    code?: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'UPCOMING';
    startDate?: string;
    endDate?: string;
    type?: 'SCHOOL' | 'COLLEGE' | 'COACHING';
    programName?: string;
}

export interface Subject {
    id: string;
    code: string;
    title: string;
    subjectType: string;
    totalExamMarks?: number;
}

export interface TimetableSlot {
    id: string;
    slotLabel: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    periodNumber: number;
}

export interface TimetableEntry {
    id: string;
    timetableSlotId: string;
    offeringId: string;
    subjectId: string;
    instructorId: string;
    room: string;
    // Optional enriched fields
    subjectName?: string;
    offeringName?: string;
    slotDetails?: TimetableSlot;
}

export interface Department {
    id: string;
    tenantId: string;
    name: string;
    code: string;
    description: string;
    headOfDepartment?: string;
    programIds: string[];
}

export const academicService = {
    // Departments
    getDepartments: async () => {
        const response = await api.get('/ims-academic-service/departments');
        return response.data;
    },

    createDepartment: async (data: Partial<Department>) => {
        const response = await api.post('/ims-academic-service/departments', data);
        return response.data;
    },

    deleteDepartment: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/departments/${id}`);
        return response.data;
    },

    // Programs
    getPrograms: async (tenantId?: string) => {
        const url = tenantId ? `/ims-academic-service/programs/tenant/${tenantId}` : '/ims-academic-service/programs';
        const response = await api.get(url);
        return response.data.apiData;
    },

    linkProgramToDepartment: async (programId: string, departmentId: string) => {
        const response = await api.put(`/ims-academic-service/programs/${programId}/department/${departmentId}`);
        return response.data;
    },

    // Offerings & Sections (Added for Student Details)
    getOfferingsByTenant: async (tenantId: string) => {
        const response = await api.get(`/ims-academic-service/offerings/tenant/${tenantId}`);
        return response.data.apiData;
    },

    getOfferingsByInstructor: async (instructorId: string) => {
        const response = await api.get(`/ims-academic-service/offerings/instructor/${instructorId}`);
        return response.data.apiData;
    },

    getOfferingById: async (id: string) => {
        const response = await api.get(`/ims-academic-service/offerings/${id}`);
        return response.data;
    },

    getOfferingInstructors: async (offeringId: string) => {
        const response = await api.get(`/ims-academic-service/offering-instructors/offering/${offeringId}`);
        return response.data;
    },

    getSectionById: async (id: string) => {
        const response = await api.get(`/ims-academic-service/sections/${id}`);
        return response.data;
    },

    updateClass: async (id: string, data: Partial<any>) => {
        const response = await api.put(`/ims-academic-service/classes/${id}`, data);
        return response.data;
    },

    updateOffering: async (id: string, data: Partial<any>) => {
        const response = await api.put(`/ims-academic-service/offerings/${id}`, data);
        return response.data;
    },

    // Syllabus
    // Syllabus
    getChaptersByOfferingSubject: async (offeringSubjectId: string) => {
        const response = await api.get(`/ims-academic-service/chapters/offering-subject/${offeringSubjectId}`);
        return response.data.apiData;
    },

    getTopicsByChapter: async (chapterId: string) => {
        const response = await api.get(`/ims-academic-service/topics/chapter/${chapterId}`);
        return response.data.apiData;
    },

    createChapter: async (data: any) => {
        const response = await api.post('/ims-academic-service/chapters', data);
        return response.data.apiData;
    },

    createTopic: async (data: any) => {
        const response = await api.post('/ims-academic-service/topics', data);
        return response.data.apiData;
    },

    updateChapter: async (id: string, data: any) => {
        const response = await api.put(`/ims-academic-service/chapters/${id}`, data);
        return response.data.apiData;
    },

    deleteChapter: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/chapters/${id}`);
        return response.data.apiData;
    },

    updateTopic: async (id: string, data: any) => {
        const response = await api.put(`/ims-academic-service/topics/${id}`, data);
        return response.data.apiData;
    },

    deleteTopic: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/topics/${id}`);
        return response.data.apiData;
    },

    getSyllabusCoverage: async (offeringSubjectId: string) => {
        const response = await api.get(`/ims-academic-service/syllabus/coverage/${offeringSubjectId}`);
        return response.data; // Wrapper might be different here, check controller
    },

    updateCoverage: async (data: any) => {
        const response = await api.put(`/ims-academic-service/syllabus/coverage`, data);
        return response.data;
    },

    // Subjects & Mapping
    getSubjects: async (tenantId: string) => {
        const response = await api.get(`/ims-academic-service/subjects/tenant/${tenantId}`);
        return response.data;
    },

    getOfferingSubjects: async (offeringId: string) => {
        const response = await api.get(`/ims-academic-service/offering-subject/${offeringId}`);
        return response.data;
    },

    mapSubjectToOffering: async (data: any) => {
        const response = await api.post('/ims-academic-service/offering-subject', data);
        return response.data;
    },

    unmapSubjectFromOffering: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/offering-subject/${id}`);
        return response.data;
    },

    createSubject: async (data: any) => {
        const response = await api.post(`/ims-academic-service/subjects/tenant/${data.tenantId}`, data);
        return response.data;
    },

    deleteSubject: async (id: string, tenantId?: string) => {
        // Fallback for types not strictly enforcing tenantId yet, but ideally required
        if (!tenantId) throw new Error("Tenant ID is required for deletion");
        const response = await api.delete(`/ims-academic-service/subjects/tenant/${tenantId}/subject/${id}`);
        return response.data;
    },

    // Instructor Specifics
    getTimetableByInstructor: async (instructorId: string) => {
        const response = await api.get(`/ims-academic-service/timetable-entries/instructor/${instructorId}`);
        return response.data;
    },

    getInstructorAssignments: async (instructorId: string) => {
        const response = await api.get(`/ims-academic-service/offering-instructors/instructor/${instructorId}`);
        return response.data;
    },

    getTimetableSlots: async (tenantId: string) => {
        const response = await api.get(`/ims-academic-service/timetable-slots/tenant/${tenantId}`);
        return response.data;
    },

    // Grading Scales
    getGradingScales: async (tenantId: string) => {
        const response = await api.get(`/ims-academic-service/grading-scales/tenant/${tenantId}`);
        return response.data;
    },

    createGradingScale: async (data: any) => {
        const response = await api.post('/ims-academic-service/grading-scales', data);
        return response.data;
    },

    updateGradingScale: async (id: string, data: any) => {
        const response = await api.put(`/ims-academic-service/grading-scales/${id}`, data);
        return response.data;
    },

    deleteGradingScale: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/grading-scales/${id}`);
        return response.data;
    }
};

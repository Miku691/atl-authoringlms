import api from '../utils/api';

export interface Assignment {
    id?: string;
    tenantId: string;
    offeringId: string;
    subjectId?: string;
    title: string;
    description: string;
    dueDate: string;
    createdBy?: string;
}

export interface AssignmentSubmission {
    id?: string;
    assignmentId: string;
    studentId: string;
    fileUrl?: string;
    submittedAt?: string;
    score?: number;
    feedback?: string;
}

export const assignmentService = {
    createAssignment: async (data: Assignment) => {
        const response = await api.post('/ims-academic-service/assignments', data);
        return response.data;
    },

    getAssignmentById: async (id: string) => {
        const response = await api.get(`/ims-academic-service/assignments/${id}`);
        return response.data;
    },

    getAssignmentsByOffering: async (offeringId: string) => {
        const response = await api.get(`/ims-academic-service/assignments/offering/${offeringId}`);
        return response.data;
    },

    submitAssignment: async (assignmentId: string, studentId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/ims-academic-service/submissions/submit?assignmentId=${assignmentId}&studentId=${studentId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    gradeSubmission: async (submissionId: string, score: number, feedback: string) => {
        const response = await api.put(`/ims-academic-service/submissions/grade/${submissionId}`, { score, feedback });
        return response.data;
    },

    getSubmissionsByAssignment: async (assignmentId: string) => {
        const response = await api.get(`/ims-academic-service/submissions/assignment/${assignmentId}`);
        return response.data;
    }
};

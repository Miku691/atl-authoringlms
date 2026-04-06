import api from '../utils/api';

export interface ExamMaster {
    id: string;
    tenantId: string;
    academicSessionId: string;
    examName: string;
    examType: string;
    isPublished: boolean;
    description: string;
}

export interface ExamSchedule {
    id: string;
    examMasterId: string;
    offeringId: string;
    subjectId: string;
    subjectName?: string;
    examDate: string;
    startTime: string;
    endTime: string;
    maxMarks: number;
    passMarks: number;
    roomNumber: string;
    tenantId: string;
}

export interface MarksRecord {
    id?: string;
    examScheduleId: string;
    studentId: string;
    studentName?: string;
    rollNo?: string;
    marksObtained: number | null;
    isAbsent: boolean;
    remarks: string;
    tenantId: string;
}

export const examService = {
    // Exam Master Management
    createExam: async (exam: Partial<ExamMaster>) => {
        const res = await api.post('/ims-academic-service/exams', exam);
        return res.data;
    },

    getExamsBySession: async (tenantId: string, sessionId: string) => {
        const res = await api.get(`/ims-academic-service/exams/session/${sessionId}?tenantId=${tenantId}`);
        return res.data.apiData || res.data;
    },

    publishResults: async (examId: string, isPublished: boolean) => {
        await api.patch(`/ims-academic-service/exams/${examId}/publish?isPublished=${isPublished}`);
    },

    // Exam Schedule Management
    createSchedule: async (schedule: Partial<ExamSchedule>) => {
        const res = await api.post('/ims-academic-service/exams/schedule', schedule);
        return res.data;
    },

    getSchedulesByExam: async (examId: string) => {
        const res = await api.get(`/ims-academic-service/exams/${examId}/schedules`);
        return res.data.apiData || res.data;
    },

    getSchedulesByOffering: async (offeringId: string, tenantId: string) => {
        const res = await api.get(`/ims-academic-service/exams/offering/${offeringId}?tenantId=${tenantId}`);
        return res.data.apiData || res.data;
    },

    // Marks Management
    saveBulkMarks: async (scheduleId: string, marks: MarksRecord[], tenantId: string) => {
        await api.post(`/ims-academic-service/marks/schedule/${scheduleId}/bulk?tenantId=${tenantId}`, marks);
    },

    getMarksBySchedule: async (scheduleId: string) => {
        const res = await api.get(`/ims-academic-service/marks/schedule/${scheduleId}`);
        return res.data.apiData || res.data;
    },

    getResultsByStudent: async (studentId: string, tenantId: string) => {
        const res = await api.get(`/ims-academic-service/marks/student/${studentId}?tenantId=${tenantId}`);
        return res.data.apiData || res.data;
    }
};

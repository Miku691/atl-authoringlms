import api from '../utils/api';

export interface StudentEnrollment {
    id?: string;
    studentId: string;
    offeringId: string;
    sectionId?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';
    rollNo?: number;
    academicYear: string;
}

export interface StudentSummary {
    studentId: string;
    enrollmentId: string;
    name: string;
    admissionNo: string;
    rollNo?: number;
    enrollmentStatus: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
}

export interface StudentAcademicHistory {
    enrollmentId: string;
    offeringId: string;
    offeringName: string;
    academicYear: string;
    status: string;
    startDate?: string;
    endDate?: string;
}

export const enrollmentService = {
    createEnrollment: (data: StudentEnrollment) => api.post('/ims-student-service/enrollments', data),

    updateEnrollment: (id: string, data: Partial<StudentEnrollment>) => api.put(`/ims-student-service/enrollments/${id}`, data),

    getEnrollmentById: (id: string) => api.get(`/ims-student-service/enrollments/${id}`),

    getStudentEnrollments: (studentId: string) => api.get(`/ims-student-service/enrollments/student/${studentId}`),

    getStudentsByOffering: (offeringId: string, status = 'ACTIVE', page = 0, size = 10) =>
        api.get(`/ims-student-service/enrollments/offering/${offeringId}?status=${status}&page=${page}&size=${size}`),

    getStudentAcademicHistory: (studentId: string) => api.get(`/ims-student-service/enrollments/history/${studentId}`),

    deleteEnrollment: (id: string) => api.delete(`/ims-student-service/enrollments/${id}`)
};

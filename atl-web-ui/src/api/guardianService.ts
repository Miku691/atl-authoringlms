import api from '../utils/api';

export interface Guardian {
    id?: string;
    tenantId?: string;
    userId?: string;
    name: string;
    phone: string;
    email?: string;
    occupation?: string;
    address?: string;
}

export interface StudentGuardianMapping {
    id?: string;
    studentId: string;
    guardianId: string;
    relation: string;
    isPrimary: boolean;
    studentName?: string;
    guardianName?: string;
    guardianPhone?: string;
}

export const guardianService = {
    // Master Guardian CRUD
    createGuardian: (data: Guardian) => api.post('/ims-student-service/master-guardians', data),
    updateGuardian: (id: string, data: Guardian) => api.put(`/ims-student-service/master-guardians/${id}`, data),
    getGuardian: (id: string) => api.get(`/ims-student-service/master-guardians/${id}`),
    getTenantGuardians: (tenantId: string) => api.get(`/ims-student-service/master-guardians/tenant/${tenantId}`),
    searchGuardianByPhone: (tenantId: string, phone: string) =>
        api.get(`/ims-student-service/master-guardians/tenant/${tenantId}/search?phone=${phone}`),
    deleteGuardian: (id: string) => api.delete(`/ims-student-service/master-guardians/${id}`),

    // Student-Guardian Mappings
    linkStudentToGuardian: (data: StudentGuardianMapping) => api.post('/ims-student-service/student-guardian-mappings', data),
    getStudentGuardians: (studentId: string) => api.get(`/ims-student-service/student-guardian-mappings/student/${studentId}`),
    getGuardianStudents: (guardianId: string) => api.get(`/ims-student-service/student-guardian-mappings/guardian/${guardianId}`),
    unlinkStudentFromGuardian: (mappingId: string) => api.delete(`/ims-student-service/student-guardian-mappings/${mappingId}`),
};

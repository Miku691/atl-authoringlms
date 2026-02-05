import api from '../utils/api';

export interface StudentDocument {
    id: string;
    studentId: string;
    documentType: string;
    documentUrl: string;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    uploadedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const documentService = {
    uploadDocument: (studentId: string, documentType: string, file: File) => {
        const formData = new FormData();
        formData.append('studentId', studentId);
        formData.append('documentType', documentType);
        formData.append('file', file);

        return api.post('/ims-student-service/student-documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    getStudentDocuments: (studentId: string) => api.get(`/ims-student-service/student-documents/student/${studentId}`),

    getDocumentById: (id: string) => api.get(`/ims-student-service/student-documents/${id}`),

    deleteDocument: (id: string) => api.delete(`/ims-student-service/student-documents/${id}`),

    getViewUrl: (id: string) => `${api.defaults.baseURL}/ims-student-service/student-documents/view/${id}`
};

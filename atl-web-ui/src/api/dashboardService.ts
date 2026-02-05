import api from '../utils/api';

export interface DashboardStats {
    totalStudents: number;
    totalInstructors: number;
    totalPrograms: number;
    totalOfferings: number;
}

export const dashboardService = {
    getStats: async (tenantId: string): Promise<DashboardStats> => {
        const [studentRes, instructorRes, academicRes] = await Promise.all([
            api.get(`/ims-student-service/students/count/tenant/${tenantId}`),
            api.get(`/ims-instructor-service/instructors/count/tenant/${tenantId}`),
            api.get(`/ims-academic-service/dashboard-stats/tenant/${tenantId}`)
        ]);

        return {
            totalStudents: studentRes.data.apiData || 0,
            totalInstructors: instructorRes.data.apiData || 0,
            totalPrograms: academicRes.data.apiData?.totalPrograms || 0,
            totalOfferings: academicRes.data.apiData?.totalOfferings || 0
        };
    }
};

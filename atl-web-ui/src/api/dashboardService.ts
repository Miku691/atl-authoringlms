import api from '../utils/api';

export interface DashboardStats {
    totalStudents: number;
    totalInstructors: number;
    totalPrograms: number;
    totalOfferings: number;
}

export interface GenderStat {
    gender: string;
    count: number;
}

export interface OfferingStat {
    offeringId: string;
    offeringName: string;
    count: number;
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
    },

    getGenderStats: async (tenantId: string): Promise<GenderStat[]> => {
        const res = await api.get(`/ims-student-service/students/stats/gender/tenant/${tenantId}`);
        return (res.data.apiData || []).map((item: any) => ({
            gender: item.gender || 'Unknown',
            count: Number(item.count)
        }));
    },

    getOfferingStats: async (tenantId: string): Promise<OfferingStat[]> => {
        // 1. Get counts
        const statsRes = await api.get(`/ims-student-service/enrollments/stats/offering/tenant/${tenantId}`);
        const rawStats = statsRes.data.apiData || [];

        if (rawStats.length === 0) return [];

        // 2. Fetch offering names from academic service
        const offeringIds = rawStats.map((s: any) => s.offeringId);
        try {
            const academicRes = await api.post(`/ims-academic-service/offerings/bulk-fetch`, offeringIds);
            const offerings = academicRes.data.apiData || [];
            const offeringMap = new Map(offerings.map((o: any) => [o.id, o.name]));

            return rawStats.map((item: any) => ({
                offeringId: item.offeringId,
                offeringName: offeringMap.get(item.offeringId) || 'Unknown Offering',
                count: Number(item.count)
            }));
        } catch (error) {
            console.error("Failed to resolve offering names", error);
            return rawStats.map((item: any) => ({
                offeringId: item.offeringId,
                offeringName: `Class ${item.offeringId.substring(0, 4)}`,
                count: Number(item.count)
            }));
        }
    }
};

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

    getOfferingStats: async (tenantId: string, tenantType?: string): Promise<OfferingStat[]> => {
        // 1. Get counts
        const statsRes = await api.get(`/ims-student-service/enrollments/stats/offering/tenant/${tenantId}`);
        const rawStats = statsRes.data.apiData || [];

        if (rawStats.length === 0) return [];

        let type = tenantType;
        if (!type) {
             try {
                 const readRes = await api.get('/ims-academic-service/readiness/status');
                 type = readRes.data?.apiData?.tenantType || 'SCHOOL';
             } catch {
                 type = 'SCHOOL';
             }
        }

        // 2. Fetch offering names from academic service
        const offeringIds = rawStats.map((s: any) => s.offeringId);
        try {
            const academicRes = await api.post(`/ims-academic-service/offerings/bulk-fetch`, offeringIds);
            const offerings = academicRes.data.apiData || [];

            let branches: any[] = [];
            let years: any[] = [];
            let classes: any[] = [];
            let courses: any[] = [];

            if (type === 'COLLEGE') {
                const [bRes, yRes] = await Promise.all([
                    api.get(`/ims-academic-service/branches/tenant/${tenantId}`),
                    api.get(`/ims-academic-service/years/tenant/${tenantId}`)
                ]);
                branches = bRes.data?.apiData || [];
                years = yRes.data?.apiData || [];
            } else if (type === 'SCHOOL') {
                const cRes = await api.get(`/ims-academic-service/classes/tenant/${tenantId}`);
                classes = cRes.data?.apiData || [];
            } else if (type === 'COACHING') {
                const cRes = await api.get(`/ims-academic-service/courses/tenant/${tenantId}`);
                courses = cRes.data?.apiData || [];
            }

            const groupedStats = new Map<string, { name: string, count: number }>();

            rawStats.forEach((item: any) => {
                const off = offerings.find((o: any) => o.id === item.offeringId);
                let parentId = item.offeringId;
                let parentName = off?.name || 'Unknown Offering';

                if (off) {
                    if (type === 'COLLEGE' && off.yearId) {
                        const year = years.find(y => y.id === off.yearId);
                        if (year && year.branchId) {
                            const branch = branches.find(b => b.id === year.branchId);
                            if (branch) {
                                parentId = branch.id;
                                parentName = branch.name;
                            }
                        }
                    } else if (type === 'SCHOOL' && off.classId) {
                        const cls = classes.find(c => c.id === off.classId);
                        if (cls) {
                            parentId = cls.id;
                            parentName = cls.name;
                        }
                    } else if (type === 'COACHING' && off.courseId) {
                        const course = courses.find(c => c.id === off.courseId);
                        if (course) {
                            parentId = course.id;
                            parentName = course.name;
                        }
                    }
                }

                if (groupedStats.has(parentId)) {
                    groupedStats.get(parentId)!.count += Number(item.count);
                } else {
                    groupedStats.set(parentId, { name: parentName, count: Number(item.count) });
                }
            });

            return Array.from(groupedStats.entries()).map(([id, data]) => ({
                offeringId: id,
                offeringName: data.name,
                count: data.count
            }));
        } catch (error) {
            console.error("Failed to resolve offering names", error);
            return rawStats.map((item: any) => ({
                offeringId: item.offeringId,
                offeringName: `Class ${item.offeringId.substring(0, 4)}`,
                count: Number(item.count)
            }));
        }
    },

    getTodayBirthdays: async (tenantId: string): Promise<{ students: number; employees: number }> => {
        try {
            const [studentRes, instructorRes] = await Promise.all([
                api.get(`/ims-student-service/students/birthdays/today/tenant/${tenantId}`),
                api.get(`/ims-instructor-service/instructors/birthdays/today/tenant/${tenantId}`)
            ]);
            return {
                students: studentRes.data?.apiData || 0,
                employees: instructorRes.data?.apiData || 0
            };
        } catch (error) {
            console.error("Failed to fetch birthday counts", error);
            return { students: 0, employees: 0 };
        }
    }
};


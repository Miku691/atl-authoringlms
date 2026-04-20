import api from '../utils/api';
import { type TimetableEntry } from './timetableService';
import { type StudentEnrollment } from './enrollmentService';

export interface StudentDashboardData {
    student: any;
    enrollments: StudentEnrollment[];
    attendanceSummary: {
        totalDays: number;
        presentDays: number;
        percentage: number;
    };
    assignmentSummary: {
        totalAssignments: number;
        completedAssignments: number;
        pendingAssignments: number;
    };
    todayClasses: TimetableEntry[];
    activeAnnouncements: any[];
}

export const studentDashboardService = {
    getDashboardData: async (email: string, tenantId: string): Promise<StudentDashboardData> => {
        try {
            // 1. Fetch Student Profile via resolution endpoint
            let student = null;
            try {
                const profileRes = await api.get(`/ims-student-service/students/profile/resolve?email=${email}&tenantId=${tenantId}`);
                student = profileRes.data.apiData;
            } catch (err: any) {
                if (err.response?.status === 404) {
                    console.warn("Student profile not found for email:", email);
                    // Return early with null student and empty data
                    return {
                        student: null,
                        enrollments: [],
                        attendanceSummary: { totalDays: 0, presentDays: 0, percentage: 0 },
                        assignmentSummary: { totalAssignments: 0, completedAssignments: 0, pendingAssignments: 0 },
                        todayClasses: [],
                        activeAnnouncements: []
                    };
                }
                throw err;
            }

            if (!student) {
                return {
                    student: null,
                    enrollments: [],
                    attendanceSummary: { totalDays: 0, presentDays: 0, percentage: 0 },
                    assignmentSummary: { totalAssignments: 0, completedAssignments: 0, pendingAssignments: 0 },
                    todayClasses: [],
                    activeAnnouncements: []
                };
            }

            // 2. Fetch Enrollments first to get context
            const enrollRes = await api.get(`/ims-student-service/enrollments/student/${student.id}`);
            const enrollments = enrollRes.data.apiData || [];
            const offeringId = enrollments.length > 0 ? enrollments[0].offeringId : '';

            // 3. Fetch Enrichments in parallel
            const [attendanceResult, announcResult, assignmentResult] = await Promise.allSettled([
                api.get(`/ims-academic-service/attendance-records/student/${student.id}/summary`),
                api.get(`/ims-academic-service/announcements/tenant/${tenantId}`),
                api.get(`/ims-academic-service/assignments/student/${student.id}/summary?offeringId=${offeringId}&tenantId=${tenantId}`)
            ]);

            const attendance = attendanceResult.status === 'fulfilled' ? (attendanceResult.value.data.apiData || { totalDays: 0, presentDays: 0 }) : { totalDays: 0, presentDays: 0 };
            const activeAnnouncements = announcResult.status === 'fulfilled' ? (announcResult.value.data.apiData || []) : [];
            const assignmentSummary = assignmentResult.status === 'fulfilled' ? (assignmentResult.value.data.apiData || { totalAssignments: 0, completedAssignments: 0, pendingAssignments: 0 }) : { totalAssignments: 0, completedAssignments: 0, pendingAssignments: 0 };

            if (attendanceResult.status === 'rejected') {
                console.error("Dashboard: Failed to fetch attendance summary", attendanceResult.reason);
            }
            if (announcResult.status === 'rejected') {
                console.error("Dashboard: Failed to fetch announcements", announcResult.reason);
            }

            const { totalDays, presentDays } = attendance;
            const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

            // 3. Fetch Today's Classes if enrolled
            let todayClasses = [];
            if (enrollments.length > 0) {
                try {
                    const offeringId = enrollments[0].offeringId;
                    const timetableRes = await api.get(`/ims-academic-service/timetable-entries/offering/${offeringId}/today`);
                    todayClasses = timetableRes.data.apiData || [];
                } catch (err) {
                    console.error("Dashboard: Failed to fetch today's classes", err);
                }
            }

            return {
                student,
                enrollments,
                attendanceSummary: {
                    totalDays,
                    presentDays,
                    percentage: Math.round(percentage)
                },
                assignmentSummary,
                todayClasses,
                activeAnnouncements
            };

        } catch (error) {
            console.error("Failed to fetch student dashboard data:", error);
            throw error;
        }
    },

    getStudentContext: async (email: string, tenantId: string) => {
        try {
            const profileRes = await api.get(`/ims-student-service/students/profile/resolve?email=${email}&tenantId=${tenantId}`);
            const student = profileRes.data.apiData;
            if (!student) return { student: null, enrollment: null };

            const enrollRes = await api.get(`/ims-student-service/enrollments/student/${student.id}`);
            const enrollments = enrollRes.data.apiData || [];

            return {
                student,
                enrollment: enrollments.length > 0 ? enrollments[0] : null
            };
        } catch (error) {
            console.error("Failed to fetch student context:", error);
            throw error;
        }
    }
};

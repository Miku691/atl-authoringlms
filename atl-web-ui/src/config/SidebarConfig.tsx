import {
    LayoutDashboard,
    Settings,
    BookOpen,
    Users,
    ClipboardList,
    DollarSign,
    GraduationCap,
    MessageSquare,
    BarChart3,
    ShieldCheck,
    Calendar,
    FileText,
    CreditCard,
    Briefcase,
    UserCircle,
    Layers,
    ListChecks,
    Clock,
    Megaphone,
    Bell
} from 'lucide-react';

export interface MenuItem {
    path: string;
    label: string;
    icon: any;
    roles?: string[]; // If undefined, allowed for all
    setupRequired?: boolean; // If true, requires tenantSetupCompleted = true
    subItems?: MenuItem[];
    condition?: (user: any) => boolean; // Advanced condition
}

export const getSidebarConfig = (tenantType: 'SCHOOL' | 'COLLEGE' | 'COACHING' | undefined, context?: any): MenuItem[] => {

    // Dynamic Labels based on Tenant Type
    const offeringLabel = tenantType === 'COLLEGE' ? 'Semesters' :
        tenantType === 'COACHING' ? 'Batches' : 'Classes';

    const isReady = context?.readiness?.isReady;
    const hasActiveOfferings = context?.hasActiveOfferings;

    return [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT']
        },
        {
            path: '/student/profile',
            label: 'My Profile',
            icon: UserCircle,
            roles: ['STUDENT']
        },
        {
            path: '/student/academics',
            label: 'My Academics',
            icon: GraduationCap,
            roles: ['STUDENT'],
            setupRequired: true,
            condition: () => hasActiveOfferings
        },
        {
            path: '/student/syllabus',
            label: 'My Syllabus',
            icon: FileText,
            roles: ['STUDENT'],
            setupRequired: true,
            condition: () => hasActiveOfferings
        },
        {
            path: '/student/timetable',
            label: 'My Timetable',
            icon: Clock,
            roles: ['STUDENT'],
            setupRequired: true,
            condition: () => hasActiveOfferings
        },
        {
            path: '/student/attendance',
            label: 'My Attendance',
            icon: ListChecks,
            roles: ['STUDENT'],
            setupRequired: true,
            condition: () => hasActiveOfferings
        },
        {
            path: '/student/assignments',
            label: 'My Assignments',
            icon: FileText,
            roles: ['STUDENT'],
            setupRequired: true,
            condition: () => hasActiveOfferings
        },
        {
            path: '/student/finance',
            label: 'My Finance',
            icon: DollarSign,
            roles: ['STUDENT'],
            setupRequired: true
        },
        {
            path: '/guardian/finance',
            label: 'Ward Finance',
            icon: DollarSign,
            roles: ['GUARDIAN', 'PARENT'],
            setupRequired: true
        },
        {
            path: '/setup',
            label: 'Setup & Config',
            icon: Settings,
            roles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
            condition: (user) => !user.tenantSetupCompleted || !isReady, // Visible if setup incomplete OR not ready
        },
        {
            path: '/academics',
            label: 'Academics',
            icon: BookOpen,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR'],
            setupRequired: true,
            subItems: [
                { path: '/academics/offerings', label: offeringLabel, icon: Layers, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/academics/subjects', label: 'Subjects', icon: BookOpen, roles: ['TENANT_ADMIN'] },
                { path: '/academics/timetable', label: 'Timetable', icon: Clock, roles: ['TENANT_ADMIN', 'INSTRUCTOR'], condition: () => hasActiveOfferings },
                { path: '/academics/grading', label: 'Grading Scales', icon: FileText, roles: ['TENANT_ADMIN'] },
                { path: '/academics/syllabus', label: 'Syllabus', icon: FileText, roles: ['TENANT_ADMIN', 'INSTRUCTOR'], condition: () => hasActiveOfferings },
            ]
        },
        {
            path: '/people',
            label: 'People',
            icon: Users,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR'],
            setupRequired: true,
            subItems: [
                {
                    path: '/people/students',
                    label: 'Students',
                    icon: GraduationCap,
                    roles: ['TENANT_ADMIN', 'INSTRUCTOR'],
                    subItems: [
                        { path: '/people/students/all', label: 'All Students', icon: Users, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                        { path: '/people/students/add', label: 'Add Student', icon: UserCircle, roles: ['TENANT_ADMIN'] },
                        { path: '/people/students/enrollments', label: 'Enrollments', icon: Layers, roles: ['TENANT_ADMIN'], condition: () => hasActiveOfferings },
                        { path: '/people/students/guardians', label: 'Guardians', icon: Users, roles: ['TENANT_ADMIN'] },
                        { path: '/people/students/documents', label: 'Documents', icon: FileText, roles: ['TENANT_ADMIN'] },
                    ]
                },
                { path: '/people/instructors', label: 'Instructors', icon: UserCircle, roles: ['TENANT_ADMIN'] },
                { path: '/people/staff', label: 'Staff', icon: Briefcase, roles: ['TENANT_ADMIN'] },
            ]
        },
        {
            path: '/operations',
            label: 'Operations',
            icon: ClipboardList,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'],
            setupRequired: true,
            condition: () => hasActiveOfferings, // Entire section hidden if no active offerings
            subItems: [
                { path: '/operations/attendance', label: 'Attendance', icon: ListChecks, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/lms/assignments', label: 'Assignments', icon: FileText, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/operations/timetable', label: 'Timetable', icon: Clock, roles: ['TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'] },
                { path: '/operations/calendar', label: 'Calendar', icon: Calendar, roles: ['TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'] },
            ]
        },
        {
            path: '/finance',
            label: 'Finance',
            icon: DollarSign,
            roles: ['TENANT_ADMIN', 'ACCOUNTANT'],
            setupRequired: true,
            subItems: [
                { path: '/finance/config', label: 'Financial Masters', icon: Settings, roles: ['TENANT_ADMIN'] },
                { path: '/finance/structure', label: 'Fee Structure', icon: FileText, roles: ['TENANT_ADMIN'] },
                { path: '/finance/collections', label: 'Collections', icon: CreditCard, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                { path: '/finance/ledger', label: 'Student Ledger', icon: Layers, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
            ]
        },
        {
            path: '/lms',
            label: 'Learning (LMS)',
            icon: GraduationCap,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'],
            setupRequired: true,
            condition: () => hasActiveOfferings,
            subItems: [
                { path: '/lms/courses', label: 'My Courses', icon: BookOpen },
                { path: '/lms/assignments', label: 'Assignments', icon: FileText, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/lms/exams', label: 'Online Exams', icon: FileText } // Placeholder icon
            ]
        },
        {
            path: '/communication',
            label: 'Communication',
            icon: MessageSquare,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'],
            subItems: [
                { path: '/communication/announcements', label: 'Announcements', icon: Megaphone, roles: ['TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT'] },
                { path: '/communication/messages', label: 'Messages', icon: Bell }
            ]
        },
        {
            path: '/reports',
            label: 'Reports',
            icon: BarChart3,
            roles: ['TENANT_ADMIN'],
            setupRequired: true,
            subItems: [
                { path: '/reports/academic', label: 'Academic Reports', icon: BarChart3 },
                { path: '/reports/attendance', label: 'Attendance Reports', icon: ListChecks },
                { path: '/reports/financial', label: 'Financial Reports', icon: DollarSign },
            ]
        },
        {
            path: '/system',
            label: 'System',
            icon: ShieldCheck,
            roles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
            subItems: [
                { path: '/system/users', label: 'User Management', icon: Users },
                { path: '/system/roles', label: 'Role Management', icon: ShieldCheck },
                { path: '/system/audit', label: 'Audit Logs', icon: FileText },
            ]
        }
    ];
};

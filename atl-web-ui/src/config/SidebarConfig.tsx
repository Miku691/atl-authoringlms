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
    Briefcase,
    UserCircle,
    Layers,
    ListChecks,
    Clock,
    Megaphone,
    Bell,
    Calculator,
    AlertTriangle,
    ShoppingBag,
    Tag,
    PieChart,
    Target,
    Package,
    Truck,
    Banknote,
    Trophy
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
            path: '/platform',
            label: 'Platform Control',
            icon: ShieldCheck,
            roles: ['SUPER_ADMIN'],
            subItems: [
                { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
                { path: '/platform/leads', label: 'Demo Leads', icon: Users },
                { path: '/system/subscription-plans', label: 'Subscription Plans', icon: Tag },
                { path: '/system/settings', label: 'Global Settings', icon: Settings },
            ]
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
            path: '/student/results',
            label: 'My Results',
            icon: Trophy,
            roles: ['STUDENT'],
            setupRequired: true
        },
        {
            path: '/student/leaves',
            label: 'Apply Leave',
            icon: Clock,
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
            path: '/academics',
            label: 'Academics',
            icon: BookOpen,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR'],
            setupRequired: true,
            subItems: [
                { path: '/academics/sessions', label: 'Academic Sessions', icon: Calendar, roles: ['TENANT_ADMIN'] },
                { path: '/academics/offerings', label: offeringLabel, icon: Layers, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/academics/promotion', label: 'Promotion Center', icon: GraduationCap, roles: ['TENANT_ADMIN'] },
                { path: '/academics/subjects', label: 'Subjects', icon: BookOpen, roles: ['TENANT_ADMIN'] },
                { path: '/academics/timetable', label: 'Timetable', icon: Clock, roles: ['TENANT_ADMIN', 'INSTRUCTOR'], condition: () => hasActiveOfferings },
                { path: '/academics/grading', label: 'Grading Scales', icon: FileText, roles: ['TENANT_ADMIN'] },
                { path: '/academics/syllabus', label: 'Syllabus', icon: FileText, roles: ['TENANT_ADMIN', 'INSTRUCTOR'], condition: () => hasActiveOfferings },
                { path: '/teacher/exams', label: 'Exams', icon: FileText, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
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
                        { path: '/people/students/guardians', label: 'Guardians', icon: Users, roles: ['TENANT_ADMIN'] },
                        { path: '/people/students/reports', label: 'Reports', icon: BarChart3, roles: ['TENANT_ADMIN'] },
                    ]
                },
                {
                    path: '/people/instructors',
                    label: 'Instructors',
                    icon: UserCircle,
                    roles: ['TENANT_ADMIN'],
                    subItems: [
                        { path: '/people/instructors/all', label: 'All Instructors', icon: Users, roles: ['TENANT_ADMIN'] },
                        { path: '/people/instructors/add', label: 'Add Instructor', icon: UserCircle, roles: ['TENANT_ADMIN'] },
                        { path: '/people/instructors/reports', label: 'Reports', icon: BarChart3, roles: ['TENANT_ADMIN'] },
                    ]
                },
                {
                    path: '/people/staff',
                    label: 'Staff',
                    icon: Briefcase,
                    roles: ['TENANT_ADMIN'],
                    subItems: [
                        { path: '/people/staff/all', label: 'All Staff', icon: Users, roles: ['TENANT_ADMIN'] },
                        { path: '/people/staff/add', label: 'Add Staff', icon: UserCircle, roles: ['TENANT_ADMIN'] },
                        { path: '/people/staff/reports', label: 'Reports', icon: BarChart3, roles: ['TENANT_ADMIN'] },
                    ]
                },
            ]
        },
        {
            path: '/operations',
            label: 'Operations',
            icon: ClipboardList,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR'],
            setupRequired: true,
            condition: () => hasActiveOfferings, // Entire section hidden if no active offerings
            subItems: [
                { path: '/operations/attendance', label: 'Attendance', icon: ListChecks, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/lms/assignments', label: 'Assignments', icon: FileText, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/operations/timetable', label: 'Timetable', icon: Clock, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/operations/calendar', label: 'Calendar', icon: Calendar, roles: ['TENANT_ADMIN', 'INSTRUCTOR'] },
                { path: '/instructor/gradebook', label: 'Gradebook', icon: Trophy, roles: ['INSTRUCTOR'] },
            ]
        },
        {
            path: '/finance',
            label: 'Finance',
            icon: DollarSign,
            roles: ['TENANT_ADMIN', 'ACCOUNTANT'],
            setupRequired: true,
            subItems: [
                { path: '/finance/dashboard', label: 'Finance Dashboard', icon: LayoutDashboard, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                { path: '/finance/fee-heads', label: 'Fee Heads', icon: Tag, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                // hiding for now as it seems mesh
                // { path: '/finance/late-fee-rules', label: 'Late Fee Policies', icon: Clock, roles: ['TENANT_ADMIN'] },
                // { path: '/finance/config', label: 'Financial Masters', icon: Settings, roles: ['TENANT_ADMIN'] },
                // { path: '/finance/concessions', label: 'Concessions', icon: FileText, roles: ['TENANT_ADMIN'] },
                { path: '/finance/structure', label: 'Fee Structure', icon: FileText, roles: ['TENANT_ADMIN'] },
                // hiding for now as it seems mesh
                // { path: '/finance/installment-plans', label: 'Installment Plans', icon: Calendar, roles: ['TENANT_ADMIN'] },
                { path: '/finance/collection-desk', label: 'Collection Desk', icon: Banknote, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                { path: '/finance/ledger', label: 'Student Ledgers', icon: Users, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                // hiding for now as it seems mesh
                // { path: '/finance/defaulters', label: 'Defaulters', icon: AlertTriangle, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                { path: '/finance/expenses', label: 'Expenses', icon: ShoppingBag, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                { path: '/finance/expense-categories', label: 'Expense Categories', icon: Tag, roles: ['TENANT_ADMIN'] },
                { path: '/finance/budgets', label: 'Budgets', icon: Target, roles: ['TENANT_ADMIN'] },
                { path: '/finance/budget-analysis', label: 'Budget Analysis', icon: PieChart, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
                { path: '/finance/reports', label: 'Advanced Reports', icon: BarChart3, roles: ['TENANT_ADMIN', 'ACCOUNTANT'] },
            ]
        },
        {
            path: '/inventory',
            label: 'Inventory & Assets',
            icon: Package,
            roles: ['TENANT_ADMIN', 'INVENTORY_MANAGER'],
            setupRequired: true,
            subItems: [
                { path: '/inventory/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { path: '/inventory/stock', label: 'Stock Management', icon: ShoppingBag },
                { path: '/inventory/assets', label: 'Asset Register', icon: Briefcase },
                { path: '/inventory/suppliers', label: 'Suppliers', icon: Truck },
            ]
        },
        {
            path: '/lms',
            label: 'Learning (LMS)',
            icon: GraduationCap,
            roles: ['TENANT_ADMIN', 'INSTRUCTOR'],
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
                { path: '/reports/people', label: 'People Reports', icon: Users },
                { path: '/reports/academic', label: 'Academic Reports', icon: BookOpen },
                { path: '/reports/financial', label: 'Financial Reports', icon: DollarSign },
            ]
        },
        // NOTE: Templates section hidden for initial release. Will be enabled when
        // Playwright-based dynamic template rendering is implemented.
        // {
        //     path: '/templates',
        //     label: 'Templates',
        //     icon: Layers,
        //     roles: ['TENANT_ADMIN'],
        //     subItems: [
        //         { path: '/system/templates/invoice', label: 'Invoice Template', icon: FileText, roles: ['TENANT_ADMIN'] },
        //     ]
        // },
        {
            path: '/billing',
            label: 'Subscription & Payment',
            icon: DollarSign,
            roles: ['TENANT_ADMIN'],
            subItems: [
                { path: '/billing/subscription', label: 'My Plan', icon: ShieldCheck },
                { path: '/billing/history', label: 'Billing History', icon: FileText },
            ]
        },
        {
            path: '/system',
            label: 'System',
            icon: ShieldCheck,
            roles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
            subItems: [
                { path: '/system/setup-master', label: 'Setup Master', icon: Settings, roles: ['TENANT_ADMIN'] },
                { path: '/system/users', label: 'User Management', icon: Users },
                { path: '/system/roles', label: 'Role Management', icon: ShieldCheck },
                { path: '/system/fee-allocation', label: 'Bulk Fee Allocation', icon: Calculator },
                { path: '/setup', label: 'Setup & Config', icon: Settings, roles: ['SUPER_ADMIN', 'TENANT_ADMIN'], condition: (user: any) => !user.tenantSetupCompleted || !isReady },
                { path: '/system/audit', label: 'Audit Logs', icon: FileText },
            ]
        }
    ];
};

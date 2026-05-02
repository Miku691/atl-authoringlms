import React, { useState, useEffect } from 'react';
import { 
    Settings, 
    BookOpen, 
    DollarSign, 
    Package, 
    CheckCircle2, 
    AlertCircle,
    ArrowRight,
    Loader2,
    ShieldCheck,
    GraduationCap,
    Grid3X3
} from 'lucide-react';
import { academicService } from '../../../../api/academicService';
import { financeService } from '../../../../api/financeService';
import { inventoryService } from '../../../../api/inventoryService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import toast from 'react-hot-toast';

interface SetupCategory {
    id: string;
    title: string;
    description: string;
    icon: any;
    statusKey: string;
    service: 'academic' | 'finance' | 'inventory';
    method: () => Promise<any>;
}

const SetupMasterPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<Record<string, boolean>>({});
    const [initialLoading, setInitialLoading] = useState(true);

    const fetchStatus = async () => {
        if (!user?.tenantId) return;
        try {
            const [academicStatus, financeStatus, inventoryStatus] = await Promise.all([
                academicService.getBulkSetupStatus(user.tenantId),
                financeService.getBulkSetupStatus(),
                inventoryService.getBulkSetupStatus()
            ]);

            setStatus({
                ...academicStatus,
                ...financeStatus,
                ...inventoryStatus
            });
        } catch (error) {
            console.error('Failed to fetch setup status:', error);
            toast.error('Failed to sync setup status');
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [user?.tenantId]);

    const handleRunSetup = async (category: SetupCategory) => {
        setLoading(prev => ({ ...prev, [category.id]: true }));
        try {
            await category.method();
            toast.success(`${category.title} initialized successfully!`);
            await fetchStatus(); // Refresh status
        } catch (error) {
            console.error(`Setup failed for ${category.id}:`, error);
            toast.error(`Failed to initialize ${category.title}`);
        } finally {
            setLoading(prev => ({ ...prev, [category.id]: false }));
        }
    };

    const categories: SetupCategory[] = [
        {
            id: 'subjects',
            title: 'Standard Subjects',
            description: 'Initialize a list of standard academic subjects (English, Math, Science, etc.) across all streams.',
            icon: BookOpen,
            statusKey: 'subjects',
            service: 'academic',
            method: () => academicService.setupSubjects(user?.tenantId!)
        },
        {
            id: 'grading',
            title: 'Grading Scales',
            description: 'Set up industry-standard grading scales (A+, A, B, etc.) with default percentage ranges.',
            icon: GraduationCap,
            statusKey: 'gradingScales',
            service: 'academic',
            method: () => academicService.setupGrading(user?.tenantId!)
        },
        {
            id: 'departments',
            title: 'Academic Departments',
            description: 'Create default departments like Science, Arts, Commerce, and Administration.',
            icon: Grid3X3,
            statusKey: 'departments',
            service: 'academic',
            method: () => academicService.setupDepartments(user?.tenantId!)
        },
        {
            id: 'feeHeads',
            title: 'Financial Fee Heads',
            description: 'Initialize common fee categories like Tuition Fee, Admission Fee, and Transport Fee.',
            icon: DollarSign,
            statusKey: 'feeHeads',
            service: 'finance',
            method: () => financeService.setupFeeHeads()
        },
        {
            id: 'expenseCategories',
            title: 'Expense Categories',
            description: 'Set up standard expense buckets like Salaries, Utilities, and Maintenance.',
            icon: ShieldCheck,
            statusKey: 'expenseCategories',
            service: 'finance',
            method: () => financeService.setupExpenseCategories()
        },
        {
            id: 'inventoryCategories',
            title: 'Inventory Categories',
            description: 'Create standard inventory types like Stationery, IT Assets, and Lab Equipment.',
            icon: Package,
            statusKey: 'inventoryCategories',
            service: 'inventory',
            method: () => inventoryService.setupCategories()
        }
    ];

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-content-secondary text-sm">
                    <Settings className="w-4 h-4" />
                    <span>System</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-content-primary font-medium">Setup Master</span>
                </div>
                <h1 className="text-2xl font-bold text-content-primary">One-Click Bulk Setup</h1>
                <p className="text-content-secondary max-w-2xl">
                    Quickly populate your institution with standard default data. Once initialized, 
                    you can manage these records individually in their respective modules.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                    const isDone = status[category.statusKey];
                    const isRunning = loading[category.id];

                    return (
                        <div 
                            key={category.id}
                            className={`group relative bg-surface rounded-2xl border transition-all duration-300 overflow-hidden ${
                                isDone 
                                ? 'border-emerald-100 bg-emerald-50/10' 
                                : 'border-border hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5'
                            }`}
                        >
                            <div className="p-6 space-y-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                    isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-chrome text-content-secondary group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                }`}>
                                    <category.icon className="w-6 h-6" />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-bold text-content-primary flex items-center gap-2">
                                        {category.title}
                                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                    </h3>
                                    <p className="text-sm text-content-secondary leading-relaxed">
                                        {category.description}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleRunSetup(category)}
                                    disabled={isDone || isRunning}
                                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                                        isDone
                                        ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                        : isRunning
                                        ? 'bg-chrome text-content-muted cursor-wait'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                                    }`}
                                >
                                    {isRunning ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : isDone ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Setup Completed
                                        </>
                                    ) : (
                                        <>
                                            Initialize Now
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Status Indicator Bar */}
                            <div className={`h-1 w-full absolute bottom-0 ${isDone ? 'bg-emerald-500' : 'bg-transparent'}`} />
                        </div>
                    );
                })}
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold text-amber-900">Important Note</h4>
                    <p className="text-sm text-amber-800 leading-relaxed">
                        Bulk setup will only add missing records. It will not overwrite or delete any existing data you have manually entered. 
                        Once a setup is marked as "Completed", it means standard records already exist for your institution.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SetupMasterPage;

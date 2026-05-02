import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../store/store';
import { fetchAcademicReadiness } from '../../../../store/academicSlice';
import { updateSetupStatus } from '../../../../store/authSlice';
import api from '../../../../utils/api';
import { Check, School, Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AcademicSetupWizard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { missingComponents, loading } = useSelector((state: RootState) => state.academic);

    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [programName, setProgramName] = useState('K-12 Schooling');
    const [programCode, setProgramCode] = useState('K12');

    const [academicYearName, setAcademicYearName] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-04-01`);
    const [endDate, setEndDate] = useState(`${new Date().getFullYear() + 1}-03-31`);

    const [startClass, setStartClass] = useState(1);
    const [endClass, setEndClass] = useState(12);

    useEffect(() => {
        if (user?.tenantId) {
            dispatch(fetchAcademicReadiness());
        }
    }, [dispatch, user?.tenantId]);

    // Determine Logic Step based on Missing Components
    useEffect(() => {
        if (!loading) {
            if (missingComponents.includes('PROGRAM')) setCurrentStep(1);
            else if (missingComponents.includes('ACADEMIC_YEAR')) setCurrentStep(2);
            else if (missingComponents.some(c => c.includes('TENANT_SETTINGS'))) setCurrentStep(3);
            else if (missingComponents.some(c => c.includes('CLASS_MISSING'))) setCurrentStep(4);
            else if (missingComponents.length === 0) setCurrentStep(5); // Done
            else setCurrentStep(4); // Default to GENERATE if odd stuff missing
        }
    }, [missingComponents, loading]);

    const handleCreateProgram = async () => {
        setSubmitting(true);
        try {
            await api.post('/ims-academic-service/programs', {
                title: programName,
                code: programCode,
                tenantId: user?.tenantId,
                // type: 'SCHOOL', // Removed as it's not in DTO
                level: 'SCHOOL', // Default level for K-12
                description: 'Main Academic Program'
            });
            toast.success("Program Created!");
            dispatch(fetchAcademicReadiness());
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to create program");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateYear = async () => {
        setSubmitting(true);
        try {
            // Fetch Program ID first (needed for Academic Year)
            const progRes = await api.get(`/ims-academic-service/programs/tenant/${user?.tenantId}`);
            const programId = progRes.data.apiData[0]?.id;

            if (!programId) {
                toast.error("No Program found. Please complete Step 1.");
                return;
            }

            await api.post('/ims-academic-service/academic-years', {
                label: academicYearName,
                programId: programId,
                startDate: startDate,
                endDate: endDate,
                tenantId: user?.tenantId,
                isCurrent: true
            });
            toast.success("Academic Year Created!");
            dispatch(fetchAcademicReadiness());
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to create year");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveClasses = async () => {
        setSubmitting(true);
        try {
            const classes = Array.from({ length: endClass - startClass + 1 }, (_, i) => i + startClass);
            await api.post('/ims-academic-service/tenant-settings', {
                tenantId: user?.tenantId,
                settings: JSON.stringify({ enabledClasses: classes })
            });
            toast.success("Class Range Configured!");
            dispatch(fetchAcademicReadiness());
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to save settings");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBootstrapOfferings = async () => {
        setSubmitting(true);
        try {
            // 1. Get Program ID
            const progRes = await api.get(`/ims-academic-service/programs/tenant/${user?.tenantId}`);
            const programId = progRes.data.apiData[0]?.id;

            // 2. Get Settings
            const setRes = await api.get(`/ims-academic-service/tenant-settings/${user?.tenantId}`);
            const settings = JSON.parse(setRes.data.apiData?.settings || '{}');
            const classes = settings.enabledClasses || []; // [1, 2, ... 12]

            if (!programId || classes.length === 0) {
                toast.error("Missing Program or Classes configuration");
                return;
            }

            const startClassVal = classes[0];
            const endClassVal = classes[classes.length - 1];

            // 3. Call Backend Bootstrap
            await api.post('/ims-academic-service/readiness/bootstrap', {
                tenantId: user?.tenantId,
                programId: programId,
                startDate: startDate,
                endDate: endDate,
                startClass: startClassVal,
                endClass: endClassVal
            });

            toast.success(`Generated Classes ${startClassVal} to ${endClassVal}!`);
            dispatch(fetchAcademicReadiness());
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to bootstrap");
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 max-w-3xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                    <School className="w-6 h-6 text-indigo-600" />
                    Academic Setup Wizard
                </h2>
                <p className="text-content-secondary mt-1">Complete these steps to activate your institute.</p>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-chrome -z-10"></div>
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className={`flex flex-col items-center gap-2 bg-surface px-2`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                            ${step < currentStep ? 'bg-green-100 text-green-600' :
                                step === currentStep ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-chrome text-content-muted'}`}>
                            {step < currentStep ? <Check className="w-4 h-4" /> : step}
                        </div>
                        <span className="text-xs font-medium text-content-secondary">
                            {step === 1 && 'Program'}
                            {step === 2 && 'Year'}
                            {step === 3 && 'Classes'}
                            {step === 4 && 'Generate'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                ) : (
                    <>
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-lg font-semibold text-content-primary">Step 1: Create Academic Program</h3>
                                <p className="text-sm text-content-secondary">This defines your institute's structure (e.g., K-12, High School).</p>

                                <div className="grid gap-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-content-primary mb-1">Program Name</label>
                                        <input
                                            value={programName}
                                            onChange={e => setProgramName(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-content-primary mb-1">Program Code</label>
                                        <input
                                            value={programCode}
                                            onChange={e => setProgramCode(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateProgram}
                                        disabled={submitting}
                                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Create Program
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-lg font-semibold text-content-primary">Step 2: Set Current Academic Year</h3>
                                <div className="grid gap-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-content-primary mb-1">Session Name</label>
                                        <input
                                            value={academicYearName}
                                            onChange={e => setAcademicYearName(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-content-primary mb-1">Start Date</label>
                                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-content-primary mb-1">End Date</label>
                                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCreateYear}
                                        disabled={submitting}
                                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Set Current Year
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-lg font-semibold text-content-primary">Step 3: Configure Classes</h3>
                                <p className="text-sm text-content-secondary">Select the range of classes your institute operates.</p>

                                <div className="max-w-md p-6 bg-chrome rounded-xl border border-border">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-center">
                                            <span className="block text-xs uppercase text-content-secondary font-bold">Start Class</span>
                                            <input
                                                type="number"
                                                min={1} max={12}
                                                value={startClass}
                                                onChange={e => setStartClass(Number(e.target.value))}
                                                className="w-20 text-center text-2xl font-bold p-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="h-0.5 flex-1 bg-gray-300"></div>
                                        <div className="text-center">
                                            <span className="block text-xs uppercase text-content-secondary font-bold">End Class</span>
                                            <input
                                                type="number"
                                                min={startClass} max={12}
                                                value={endClass}
                                                onChange={e => setEndClass(Number(e.target.value))}
                                                className="w-20 text-center text-2xl font-bold p-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveClasses}
                                    disabled={submitting}
                                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Configuration
                                </button>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-lg font-semibold text-content-primary">Step 4: Generate Offerings</h3>
                                <p className="text-sm text-content-secondary">We will now create academic offerings for <strong>Class {startClass} to {endClass}</strong>.</p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleBootstrapOfferings}
                                        disabled={submitting}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto shadow-md hover:shadow-lg transition-all"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                                        Initialize Classes
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="text-center py-12 animate-fadeIn">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-content-primary">Setup Complete!</h2>
                                <p className="text-content-secondary mt-2">Your academic structure is ready. You can now start managing students and operations.</p>
                                <button
                                    onClick={async () => {
                                        try {
                                            if (user?.tenantId) {
                                                await api.put(`/atl-auth-service/tenants/${user.tenantId}/verify-setup?type=SCHOOL`);
                                                dispatch(updateSetupStatus(true));
                                                window.location.href = '/dashboard';
                                            }
                                        } catch (e) {
                                            console.error("Failed to mark setup complete", e);
                                            toast.error("Failed to finalize setup. Please try again.");
                                        }
                                    }}
                                    className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AcademicSetupWizard;

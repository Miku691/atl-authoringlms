import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../../components/common/PageHeader';
import { 
    ArrowRightLeft, 
    Users, 
    Loader2, 
    Search,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Filter,
    ArrowUpRight
} from 'lucide-react';

interface Offering {
    id: string;
    name: string;
    sessionId: string;
}

interface AcademicSession {
    id: string;
    name: string;
    status: string;
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    enrollmentId: string;
    selected?: boolean;
}

const PromotionCenterPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);

    // Promotion State
    const [source, setSource] = useState({
        sessionId: '',
        offeringId: ''
    });

    const [target, setTarget] = useState({
        sessionId: '',
        offeringId: '',
        status: 'ACTIVE' // COMPLETED for passouts
    });

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (tenantId) fetchInitialData();
    }, [tenantId]);

    const fetchInitialData = async () => {
        try {
            const [sessRes, offRes] = await Promise.all([
                api.get(`/ims-academic-service/sessions/tenant/${tenantId}`),
                api.get(`/ims-academic-service/offerings/tenant/${tenantId}`)
            ]);
            if (sessRes.data.status === 'SUCCESS') setSessions(sessRes.data.apiData);
            if (offRes.data.status === 'SUCCESS') setOfferings(offRes.data.apiData);
        } catch (error) {
            toast.error("Failed to load academic data");
        }
    };

    const fetchStudents = async () => {
        if (!source.offeringId) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/ims-student-service/enrollments/offering/${source.offeringId}`);
            if (res.data.status === 'SUCCESS') {
                setStudents(res.data.apiData.map((s: any) => ({
                    id: s.studentId,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    admissionNo: s.admissionNo,
                    enrollmentId: s.id,
                    selected: true
                })));
            }
        } catch (error) {
            toast.error("Failed to load students");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromote = async () => {
        const selectedStudentIds = students.filter(s => s.selected).map(s => s.id);
        if (selectedStudentIds.length === 0) {
            toast.error("Select at least one student");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/ims-student-service/enrollments/bulk-promote', {
                studentIds: selectedStudentIds,
                targetOfferingId: target.offeringId,
                targetAcademicYear: sessions.find(s => s.id === target.sessionId)?.name,
                newStatus: target.status,
                tenantId
            });

            if (res.data.status === 'SUCCESS') {
                toast.success(`${selectedStudentIds.length} Students Promoted Successfully!`);
                setWizardStep(4); // Success step
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Promotion failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStudent = (id: string) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
    };

    const filteredStudents = students.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (source.offeringId) fetchStudents();
    }, [source.offeringId]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Student Promotion Center"
                description="Orchestrate grade transitions, promotions, and session roll-overs."
                actions={
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-surface rounded-lg shadow-sm">
                                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Total Selected</p>
                                <p className="text-2xl font-bold text-indigo-900 dark:text-white">{students.filter(s => s.selected).length}</p>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Stepper Header */}
            <div className="flex items-center gap-4 mb-8 bg-surface p-6 rounded-2xl border border-border shadow-sm">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1 max-w-[200px]">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${wizardStep === s ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-50' : wizardStep > s ? 'bg-green-500 text-white' : 'bg-chrome text-content-muted'}`}>
                            {wizardStep > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                        </div>
                        <div className="hidden sm:block">
                            <span className={`text-xs font-bold uppercase tracking-wider ${wizardStep === s ? 'text-indigo-600' : 'text-content-muted'}`}>
                                Step {s}
                            </span>
                            <p className={`text-[11px] font-semibold ${wizardStep === s ? 'text-content-primary' : 'text-content-secondary'}`}>
                                {s === 1 ? 'Select Source' : s === 2 ? 'Select Target' : 'Confirm'}
                            </p>
                        </div>
                        {s < 3 && <div className="flex-1 h-px bg-chrome ml-2" />}
                    </div>
                ))}
            </div>

            <div className="bg-surface rounded-[2rem] border border-border shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 flex-1">
                    {/* Step 1: Source Selection & Student List */}
                    {wizardStep === 1 && (
                        <div className="animate-slideIn h-full flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-content-primary">Source Session</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        value={source.sessionId}
                                        onChange={(e) => setSource({ ...source, sessionId: e.target.value, offeringId: '' })}
                                    >
                                        <option value="">Choose Session...</option>
                                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-content-primary">Source Offering ({offerings.length})</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        value={source.offeringId}
                                        onChange={(e) => setSource({ ...source, offeringId: e.target.value })}
                                        disabled={!source.sessionId}
                                    >
                                        <option value="">Choose Class/Batch...</option>
                                        {offerings.filter(o => o.sessionId === source.sessionId).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {source.offeringId && (
                                <div className="flex-1 flex flex-col bg-chrome rounded-2xl border border-border overflow-hidden">
                                    <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                                            <input 
                                                type="text"
                                                placeholder="Filter students..."
                                                className="w-full pl-10 pr-4 py-2 text-sm border-none focus:ring-0"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="text-xs font-bold text-content-secondary uppercase">
                                            {students.filter(s=>s.selected).length} / {students.length} Selected
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto max-h-[300px]">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-chrome border-b border-border">
                                                <tr className="text-left">
                                                    <th className="p-4 w-10">
                                                        <input type="checkbox" checked={students.every(s=>s.selected)} onChange={(e) => setStudents(prev => prev.map(s=>({...s, selected: e.target.checked})))} />
                                                    </th>
                                                    <th className="p-4 font-bold text-content-secondary">Student Name</th>
                                                    <th className="p-4 font-bold text-content-secondary">Admission No</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-surface">
                                                {isLoading ? (
                                                    <tr><td colSpan={3} className="p-12 text-center text-content-muted"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading Students...</td></tr>
                                                ) : filteredStudents.length === 0 ? (
                                                    <tr><td colSpan={3} className="p-12 text-center text-content-muted">No students found in this offering.</td></tr>
                                                ) : filteredStudents.map(s => (
                                                    <tr key={s.id} className="hover:bg-indigo-50/50 transition-colors">
                                                        <td className="p-4 text-center"><input type="checkbox" checked={s.selected} onChange={() => toggleStudent(s.id)} /></td>
                                                        <td className="p-4 font-medium text-content-primary">{s.firstName} {s.lastName}</td>
                                                        <td className="p-4 text-content-secondary">{s.admissionNo}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Target Selection */}
                    {wizardStep === 2 && (
                        <div className="animate-slideIn h-full flex flex-col gap-6">
                            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-4">
                                <div className="p-3 bg-surface rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
                                    <ArrowRightLeft className="w-6 h-6" />
                                </div>
                                <div className="text-sm">
                                    <h4 className="font-bold text-content-primary">Transition Context</h4>
                                    <p className="text-content-secondary">You are moving <span className="text-indigo-600 dark:text-indigo-400 font-bold">{students.filter(s=>s.selected).length} students</span> from <span className="font-bold">{offerings.find(o=>o.id === source.offeringId)?.name}</span>.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h5 className="text-sm font-bold text-content-primary uppercase tracking-widest flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-indigo-600" />
                                        Destination Details
                                    </h5>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-content-secondary uppercase">Target Session</label>
                                        <select 
                                            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                                            value={target.sessionId}
                                            onChange={(e) => setTarget({ ...target, sessionId: e.target.value, offeringId: '' })}
                                        >
                                            <option value="">Choose Target Session...</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-content-secondary uppercase">Target Offering</label>
                                        <select 
                                            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                                            value={target.offeringId}
                                            onChange={(e) => setTarget({ ...target, offeringId: e.target.value })}
                                            disabled={!target.sessionId}
                                        >
                                            <option value="">Choose Destination Class...</option>
                                            {offerings.filter(o => o.sessionId === target.sessionId).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-sm font-bold text-content-primary uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-600" />
                                        Promotion Type
                                    </h5>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'ACTIVE', label: 'Regular Promotion', desc: 'Promote to next class for active study.' },
                                            { id: 'COMPLETED', label: 'Final Completion / Passout', desc: 'Mark as completed (Final Year students).' },
                                        ].map(opt => (
                                            <label key={opt.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${target.status === opt.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 ring-4 ring-indigo-50 dark:ring-indigo-500/20' : 'border-border hover:border-content-secondary'}`}>
                                                <input type="radio" name="status" className="mt-1" checked={target.status === opt.id} onChange={() => setTarget({...target, status: opt.id})} />
                                                <div>
                                                    <p className="font-bold text-content-primary">{opt.label}</p>
                                                    <p className="text-xs text-content-secondary">{opt.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {wizardStep === 3 && (
                        <div className="animate-slideIn text-center py-10">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center mx-auto text-white shadow-2xl mb-8">
                                <ArrowUpRight className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-bold text-content-primary">Promotion Summary</h4>
                            <div className="mt-6 space-y-3 max-w-sm mx-auto">
                                <div className="flex justify-between p-3 bg-chrome rounded-xl">
                                    <span className="text-content-secondary font-medium">Students</span>
                                    <span className="font-bold text-content-primary">{students.filter(s=>s.selected).length}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-chrome rounded-xl">
                                    <span className="text-content-secondary font-medium">From Offering</span>
                                    <span className="font-bold text-indigo-600">{offerings.find(o=>o.id === source.offeringId)?.name}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-chrome rounded-xl">
                                    <span className="text-content-secondary font-medium">To Session</span>
                                    <span className="font-bold text-green-600">{sessions.find(s=>s.id === target.sessionId)?.name}</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex items-start gap-3 max-w-lg mx-auto text-left">
                                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                    <p className="font-bold uppercase mb-1">Financial Impact Notice</p>
                                    This action will automatically generate financial records for the new session and carry forward any outstanding arrears from the previous year.
                                </div>
                            </div>
                        </div>
                    )}

                    {wizardStep === 4 && (
                        <div className="animate-scaleIn text-center py-20">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl mb-6">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h4 className="text-3xl font-bold text-content-primary">Process Complete!</h4>
                            <p className="text-content-secondary mt-4 max-w-md mx-auto">Selected students have been promoted and financial records have been synchronized with the Finance Service.</p>
                            <button 
                                onClick={() => { setWizardStep(1); setSource({sessionId: '', offeringId: ''}); setStudents([]); }}
                                className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                            >
                                Process More Promotions
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {wizardStep < 4 && (
                    <div className="p-8 bg-chrome border-t border-border flex justify-between items-center">
                        <button 
                            onClick={() => wizardStep > 1 ? setWizardStep(prev=>prev-1) : setSource({sessionId: '', offeringId: ''})}
                            className="px-6 py-2.5 text-content-secondary font-semibold hover:bg-chrome rounded-xl transition-all"
                        >
                            {wizardStep === 1 ? 'Reset' : 'Back'}
                        </button>
                        <button 
                            onClick={() => {
                                if (wizardStep === 1) {
                                    if (!source.offeringId) return toast.error("Select source offering");
                                    setWizardStep(2);
                                } else if (wizardStep === 2) {
                                    if (!target.offeringId) return toast.error("Select target offering");
                                    setWizardStep(3);
                                } else {
                                    handlePromote();
                                }
                            }}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-soft transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : wizardStep === 3 ? 'Confirm & Promote' : 'Continue'}
                            {wizardStep < 3 && !isSubmitting && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionCenterPage;

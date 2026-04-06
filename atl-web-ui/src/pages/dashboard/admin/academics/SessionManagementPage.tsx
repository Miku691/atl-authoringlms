import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../../components/common/PageHeader';
import { 
    Calendar, 
    Plus, 
    Loader2, 
    ChevronRight, 
    Copy, 
    Lock, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    ArrowRight,
    Settings
} from 'lucide-react';

interface AcademicSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'DRAFT' | 'ENROLLMENT_OPEN' | 'ACTIVE' | 'YEP' | 'CLOSED';
    isLocked: boolean;
}

const SessionManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        sourceSessionId: '' // For cloning
    });

    useEffect(() => {
        if (tenantId) fetchSessions();
    }, [tenantId]);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/ims-academic-service/sessions/tenant/${tenantId}`);
            if (res.data.status === 'SUCCESS') {
                setSessions(res.data.apiData);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast.error("Failed to load sessions");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSession = async () => {
        if (!formData.name || !formData.startDate || !formData.endDate) {
            toast.error("Please fill all basic details");
            return;
        }
        
        setIsSubmitting(true);
        try {
            // 1. Create Session
            const sessionRes = await api.post('/ims-academic-service/sessions', {
                ...formData,
                tenantId,
                status: 'DRAFT'
            });

            if (sessionRes.data.status === 'SUCCESS') {
                const newSessionId = sessionRes.data.apiData.id;

                // 2. Clone Structure if source is selected
                if (formData.sourceSessionId) {
                    toast.loading("Cloning structure from previous session...", { id: 'cloning' });
                    await api.post(`/ims-academic-service/sessions/${newSessionId}/clone-structure?sourceSessionId=${formData.sourceSessionId}`);
                    toast.success("Structure cloned successfully!", { id: 'cloning' });
                }

                toast.success("New Academic Session Created");
                setIsWizardOpen(false);
                setWizardStep(1);
                setFormData({ name: '', startDate: '', endDate: '', sourceSessionId: '' });
                fetchSessions();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create session");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
        try {
            await api.patch(`/ims-academic-service/sessions/${sessionId}/status?status=${newStatus}`);
            toast.success(`Session status updated to ${newStatus}`);
            fetchSessions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
            ENROLLMENT_OPEN: 'bg-blue-100 text-blue-600 border-blue-200',
            ACTIVE: 'bg-green-100 text-green-600 border-green-200',
            YEP: 'bg-orange-100 text-orange-600 border-orange-200',
            CLOSED: 'bg-red-100 text-red-600 border-red-200'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.DRAFT}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Academic Sessions"
                description="Manage institutional academic cycles and structural transitions."
                actions={
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        New Session Setup
                    </button>
                }
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-gray-400 font-medium">Synchronizing sessions...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No Sessions Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">Create your first academic session to start organizing your offerings and students.</p>
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="mt-6 text-indigo-600 font-semibold hover:underline"
                    >
                        Create your first session
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {sessions.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((session) => (
                        <div key={session.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                           <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl ${session.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'} transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-gray-900">{session.name}</h3>
                                            {getStatusBadge(session.status)}
                                            {session.isLocked && <Lock className="w-4 h-4 text-amber-500" />}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{session.isLocked ? 'Immutable' : 'Modified Allowed'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {session.status === 'DRAFT' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(session.id, 'ENROLLMENT_OPEN')}
                                            className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            Open Enrollment
                                        </button>
                                    )}
                                    {session.status === 'ENROLLMENT_OPEN' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(session.id, 'ACTIVE')}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Activate Session
                                        </button>
                                    )}
                                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                           </div>
                           
                           {/* Quick Stats / Info Bar */}
                           <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-4">
                                    <span>Offerings: --</span>
                                    <span>Enrollments: --</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    <span>Real-time Sync</span>
                                </div>
                           </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Session Setup Wizard Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn">
                        {/* Header */}
                        <div className="p-8 pb-4 border-b border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">New Session Setup</h2>
                                    <p className="text-gray-500 text-sm mt-1">Configure your next academic milestone in 3 easy steps.</p>
                                </div>
                                <button onClick={() => setIsWizardOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                    <AlertCircle className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            {/* Steps Indicator */}
                            <div className="flex items-center gap-4">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${wizardStep === s ? 'bg-indigo-600 text-white scale-110 shadow-lg' : wizardStep > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {wizardStep > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                        </div>
                                        <span className={`text-xs font-semibold ${wizardStep === s ? 'text-indigo-600' : 'text-gray-400'}`}>
                                            {s === 1 ? 'Definition' : s === 2 ? 'Structure' : 'Launch'}
                                        </span>
                                        {s < 3 && <div className="w-12 h-px bg-gray-200" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 pt-6 min-h-[350px]">
                            {wizardStep === 1 && (
                                <div className="space-y-6 animate-slideIn">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Session Name</label>
                                        <input 
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="e.g. 2025 - 2026"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider font-bold">Recommended: Use a year range format</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                            <input 
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                            <input 
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 2 && (
                                <div className="space-y-6 animate-slideIn">
                                    <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-4">
                                        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm self-start">
                                            <Copy className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Structure Cloning (Optional)</h4>
                                            <p className="text-sm text-gray-500 mt-1">Want to copy your classes, offerings, and subjects from an existing session? Choose it below.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Source Session</label>
                                        <select 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white font-medium"
                                            value={formData.sourceSessionId}
                                            onChange={(e) => setFormData({...formData, sourceSessionId: e.target.value})}
                                        >
                                            <option value="">Start with Fresh Canvas (No Clone)</option>
                                            {sessions.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 3 && (
                                <div className="space-y-8 py-4 animate-slideIn text-center">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-4">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">Ready to Launch?</h4>
                                        <p className="text-gray-500 mt-2">The session <span className="text-indigo-600 font-bold">{formData.name}</span> will be created as a <span className="font-bold">DRAFT</span>.</p>
                                        {formData.sourceSessionId && (
                                            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-center gap-2 justify-center">
                                                <AlertCircle className="w-4 h-4" />
                                                Cloning structure from {sessions.find(s=>s.id === formData.sourceSessionId)?.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-0 flex justify-between items-center">
                            <button 
                                onClick={() => wizardStep > 1 ? setWizardStep(prev=>prev-1) : setIsWizardOpen(false)}
                                className="px-6 py-2.5 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-all"
                            >
                                {wizardStep === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <button 
                                onClick={() => wizardStep < 3 ? setWizardStep(prev=>prev+1) : handleCreateSession()}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : wizardStep === 3 ? 'Launch Session' : 'Continue'}
                                {wizardStep < 3 && !isSubmitting && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionManagementPage;

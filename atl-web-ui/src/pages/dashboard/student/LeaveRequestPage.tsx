import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Send, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import CustomDatePicker from '../../../components/common/CustomDatePicker';

interface StudentLeave {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    remarks?: string;
    createdAt: string;
}

const LeaveRequestPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [studentProfile, setStudentProfile] = useState<any>(null);
    const [leaves, setLeaves] = useState<StudentLeave[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newLeave, setNewLeave] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        if (user?.id) {
            fetchStudentData();
        }
    }, [user?.id]);

    const fetchStudentData = async () => {
        try {
            // Get student profile from userId
            const profileRes = await api.get(`/ims-student-service/students/user/${user?.id}`);
            if (profileRes.data.status === 'SUCCESS') {
                const profile = profileRes.data.apiData;
                setStudentProfile(profile);
                fetchLeaves(profile.id);
            }
        } catch (error) {
            console.error("Error fetching student profile:", error);
            toast.error("Failed to load student profile");
            setIsLoading(false);
        }
    };

    const fetchLeaves = async (studentId: string) => {
        try {
            const leavesRes = await api.get(`/ims-student-service/leaves/student/${studentId}`);
            if (leavesRes.data.status === 'SUCCESS') {
                setLeaves(leavesRes.data.apiData);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
            toast.error("Please fill all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                tenantId: user?.tenantId,
                studentId: studentProfile.id,
                startDate: newLeave.startDate,
                endDate: newLeave.endDate,
                reason: newLeave.reason,
                status: 'PENDING'
            };

            const res = await api.post('/ims-student-service/leaves', payload);
            if (res.data.status === 'SUCCESS') {
                toast.success("Leave applied successfully");
                setNewLeave({ startDate: '', endDate: '', reason: '' });
                fetchLeaves(studentProfile.id);
            }
        } catch (error: any) {
            console.error("Error applying leave:", error);
            toast.error(error.response?.data?.message || "Failed to apply leave");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
            case 'APPROVED':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
            case 'REJECTED':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 lg:px-0">
            {/* Page Header - Professional & Airy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Deviation</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Absences</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Formal Leave Lifecycle & Institutional Compliance
                    </p>
                </div>
                <div className="flex bg-white px-8 py-5 rounded-[2.5rem] border border-slate-50 shadow-sm items-center gap-5 group hover:shadow-xl transition-all duration-500">
                    <div className="w-12 h-12 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:rotate-12 transition-transform duration-500">
                        <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Queue Overview</p>
                         <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{leaves.length} Formal Filings</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Application Form - Premium Input Architecture */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm sticky top-32 group/form hover:shadow-2xl transition-all duration-700 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute -right-12 -top-12 text-[120px] font-black text-slate-50/50 italic leading-none pointer-events-none uppercase transition-transform group-hover/form:scale-110 duration-700 opacity-20">
                            NEW
                        </div>

                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-5 italic relative z-10 transition-colors group-hover/form:text-indigo-600">
                             <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover/form:bg-indigo-600 group-hover/form:text-white transition-all duration-500">
                                 <Send className="w-5 h-5" />
                             </div>
                             Formal Request
                        </h3>
                        <form onSubmit={handleApplyLeave} className="space-y-10 relative z-10">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-3 italic opacity-60">Cycle Start Node</label>
                                    <CustomDatePicker
                                        label=""
                                        selectedDate={newLeave.startDate ? new Date(newLeave.startDate) : null}
                                        onChange={(date: Date | null) => setNewLeave({ ...newLeave, startDate: date ? date.toISOString().split('T')[0] : '' })}
                                        minDate={new Date()}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-3 italic opacity-60">Cycle Termination</label>
                                    <CustomDatePicker
                                        label=""
                                        selectedDate={newLeave.endDate ? new Date(newLeave.endDate) : null}
                                        onChange={(date: Date | null) => setNewLeave({ ...newLeave, endDate: date ? date.toISOString().split('T')[0] : '' })}
                                        minDate={newLeave.startDate ? new Date(newLeave.startDate) : new Date()}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-3 italic opacity-60">Operational justification</label>
                                <textarea
                                    className="w-full p-8 bg-slate-50/50 border-2 border-transparent rounded-[2rem] focus:ring-0 focus:border-indigo-500/20 focus:bg-white min-h-[160px] text-sm font-black text-slate-900 placeholder:text-slate-300 transition-all shadow-inner uppercase tracking-tight italic"
                                    placeholder="DEFINE LOGISTICAL REASONING..."
                                    value={newLeave.reason}
                                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-600 disabled:opacity-50 transition-all duration-500 flex justify-center items-center gap-4 shadow-xl hover:scale-[1.02] active:scale-95 italic group/btn overflow-hidden relative"
                            >
                                <span className="relative z-10 flex items-center gap-4">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                                    Transmit Protocol
                                </span>
                                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                            </button>
                        </form>
                    </div>
                </div>

                {/* History List - Premium Ledger Feed */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[4rem] border border-slate-50 shadow-sm overflow-hidden group/ledger hover:shadow-2xl transition-all duration-700">
                        <div className="p-10 lg:p-12 border-b border-slate-50 flex justify-between items-center bg-white relative overflow-hidden">
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Accumulated Logs</h3>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Application Feed</p>
                            </div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="px-6 py-2.5 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-4 group-hover/ledger:bg-indigo-600 transition-colors duration-500">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover/ledger:bg-white animate-pulse shadow-[0_0_8px_indigo-600]"></div>
                                    <span className="text-[10px] font-black text-slate-500 group-hover/ledger:text-white uppercase tracking-[0.2em] italic">Active Sync active</span>
                                </div>
                            </div>
                            {/* Abstract background highlight */}
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none"></div>
                        </div>

                        {leaves.length === 0 ? (
                            <div className="p-32 text-center group/empty">
                                <div className="inline-flex p-12 bg-slate-50 rounded-[3rem] mb-10 grayscale opacity-30 border border-slate-100 group-hover/empty:scale-110 group-hover/empty:rotate-12 transition-all duration-700">
                                    <Clock className="w-16 h-16 text-slate-400" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">Archive Baseline</h4>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic opacity-60">Zero historical deviations detected in current cycle</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50/50">
                                {leaves.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((leave) => (
                                    <div key={leave.id} className="p-10 lg:p-12 hover:bg-slate-50/50 transition-all duration-500 group/row relative overflow-hidden">
                                        {/* Row Background Decoration */}
                                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-8xl font-black text-slate-50 italic opacity-0 group-hover/row:opacity-100 transition-opacity pointer-events-none uppercase select-none">
                                            0{leaves.indexOf(leave) + 1}
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 bg-white border border-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover/row:bg-slate-900 group-hover/row:text-white group-hover/row:rotate-6 transition-all duration-500 shadow-xl relative overflow-hidden">
                                                    <CalendarIcon className="w-8 h-8 relative z-10" />
                                                    <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase group-hover/row:text-indigo-600 transition-colors leading-none translate-y-1">
                                                            {new Date(leave.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(leave.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                         <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/row:bg-indigo-400 transition-colors"></div>
                                                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic group-hover/row:text-slate-500 transition-colors">
                                                             Logged: {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'PENDING SYNC'}
                                                         </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 scale-110 group-hover/row:scale-125 transition-transform duration-500">
                                                <div className="px-6 py-2.5 rounded-full border-2 transition-all duration-500 shadow-sm">
                                                    {getStatusBadge(leave.status)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-10 ml-28">
                                            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-transparent group-hover/row:border-slate-100 group-hover/row:bg-white transition-all duration-500 shadow-inner group-hover/row:shadow-xl relative overflow-hidden">
                                                <p className="text-base text-slate-600 font-black italic uppercase tracking-tight relative z-10 leading-relaxed">"{leave.reason}"</p>
                                                {/* Abstract accent */}
                                                <div className="absolute top-0 right-0 w-24 h-full bg-indigo-500/5 group-hover/row:w-32 transition-all duration-700"></div>
                                            </div>
                                            
                                            {leave.remarks && (
                                                <div className="mt-8 flex items-start gap-6 px-4 animate-premium-slide">
                                                    <div className="w-1.5 h-12 bg-indigo-500/10 rounded-full group-hover/row:bg-indigo-500/30 transition-colors"></div>
                                                    <div>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2 italic">Institutional Feedback</span>
                                                        <p className="text-sm font-black text-slate-900 italic tracking-tight uppercase leading-relaxed">{leave.remarks}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Security Protocol Protocol ID */}
                                        <div className="absolute bottom-8 right-12 text-[9px] font-mono text-slate-100 group-hover/row:text-slate-300 transition-colors uppercase tracking-[0.3em] pointer-events-none select-none italic">LOG_PK_{leave.id.substring(0,8)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
;
};

export default LeaveRequestPage;

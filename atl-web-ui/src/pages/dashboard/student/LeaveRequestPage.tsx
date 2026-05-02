import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { 
    Calendar as CalendarIcon, 
    Send, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    HeartPulse, 
    Zap,
    History,
    FilePlus2,
    CalendarDays
} from 'lucide-react';
import CustomDatePicker from '../../../components/common/CustomDatePicker';

interface StudentLeave {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    remarks?: string;
    createdAt: string;
    leaveType?: string; // Added for design alignment, default to 'Casual'
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
        reason: '',
        leaveType: 'Casual'
    });

    useEffect(() => {
        if (user?.id) {
            fetchStudentData();
        }
    }, [user?.id]);

    const fetchStudentData = async () => {
        try {
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
                status: 'PENDING',
                // leaveType: newLeave.leaveType // Backend might not support this yet, but we'll include it in reason or ignore
            };

            const res = await api.post('/ims-student-service/leaves', payload);
            if (res.data.status === 'SUCCESS') {
                toast.success("Leave applied successfully");
                setNewLeave({ startDate: '', endDate: '', reason: '', leaveType: 'Casual' });
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
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#fff3ec] text-[#9e3f00]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9e3f00]" />
                        Pending
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Approved
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                        Rejected
                    </span>
                );
            default:
                return <span className="px-3 py-1 bg-chrome text-content-primary rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#0054d1]" />
            </div>
        );
    }

    const quotas = [
        { type: 'Casual Leave', icon: CalendarDays, color: 'text-[#2a6df4]', bg: 'bg-[#eef2ff]', desc: 'General absence' },
        { type: 'Medical Leave', icon: HeartPulse, color: 'text-amber-700', bg: 'bg-amber-50', desc: 'Requires certificate' },
        { type: 'Emergency Leave', icon: Zap, color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]', desc: 'Urgent matters' }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 px-4 lg:px-0">
             {/* Page Header Block */}
             <div className="bg-[#f1f3f9] rounded-2xl p-8 md:p-10 relative overflow-hidden mb-10">
                <div className="relative z-10">
                    <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest mb-2 block">Leave Management</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1a3d8a] tracking-tight">My Leaves</h1>
                    <p className="text-sm text-[#424655] mt-1 max-w-md">Apply and track your leave requests across the academic term.</p>
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/5 rounded-full blur-3xl"></div>
            </div>

            {/* Quota Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {quotas.map((q, idx) => (
                    <div key={idx} className="bg-surface rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] flex items-center gap-5 group hover:shadow-xl transition-all">
                        <div className={`w-12 h-12 rounded-xl ${q.bg} flex items-center justify-center`}>
                            <q.icon className={`w-6 h-6 ${q.color}`} />
                        </div>
                        <div>
                             <h3 className="text-sm font-bold text-[#181c20]">{q.type}</h3>
                             <p className="text-[10px] text-[#64748b] font-medium tracking-wide">{q.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Apply Form Card */}
                <div className="bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden h-fit">
                    <div className="px-8 py-6 border-b border-[#f1f3f9] flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#f1f3f9] flex items-center justify-center">
                                <FilePlus2 className="w-5 h-5 text-[#2a6df4]" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Apply Leave</h3>
                                <p className="text-xs text-content-muted font-medium">Submit a new request</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleApplyLeave} className="p-8 space-y-8">
                        {/* Leave Type Toggle */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest pl-1">Leave Type</p>
                            <div className="flex flex-wrap gap-3">
                                {['Casual', 'Medical', 'Emergency'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewLeave({ ...newLeave, leaveType: type })}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                            newLeave.leaveType === type 
                                            ? 'bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white shadow-md' 
                                            : 'bg-[#f7f9ff] text-[#424655] hover:bg-[#f1f3f9]'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest pl-1">From Date</p>
                                <CustomDatePicker
                                    label=""
                                    selectedDate={newLeave.startDate ? new Date(newLeave.startDate) : null}
                                    onChange={(date: Date | null) => setNewLeave({ ...newLeave, startDate: date ? date.toISOString().split('T')[0] : '' })}
                                    minDate={new Date()}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest pl-1">To Date</p>
                                <CustomDatePicker
                                    label=""
                                    selectedDate={newLeave.endDate ? new Date(newLeave.endDate) : null}
                                    onChange={(date: Date | null) => setNewLeave({ ...newLeave, endDate: date ? date.toISOString().split('T')[0] : '' })}
                                    minDate={newLeave.startDate ? new Date(newLeave.startDate) : new Date()}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest pl-1">Reason for Leave</p>
                            <textarea
                                className="w-full p-4 bg-[#f7f9ff] border-0 rounded-xl focus:ring-2 focus:ring-[#2a6df4]/20 min-h-[120px] text-sm text-[#181c20] placeholder:text-content-muted transition-all font-medium"
                                placeholder="Describe the reason for your leave..."
                                value={newLeave.reason}
                                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-3 shadow-lg shadow-indigo-200"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit Application
                        </button>
                    </form>
                </div>

                {/* History List Card */}
                <div className="bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-[#f1f3f9] flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#f1f3f9] flex items-center justify-center">
                                <History className="w-5 h-5 text-[#2a6df4]" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Leave History</h3>
                                <p className="text-xs text-content-muted font-medium">Tracking and Status</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto max-h-[600px]">
                        {leaves.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="inline-flex p-8 bg-[#f7f9ff] rounded-full mb-4">
                                    <Clock className="w-12 h-12 text-slate-200" />
                                </div>
                                <h4 className="text-lg font-bold text-[#1a3d8a]">No History</h4>
                                <p className="text-xs text-content-muted font-medium tracking-wide">You haven't applied for any leaves yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#f1f3f9]">
                                {leaves.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((leave) => (
                                    <div key={leave.id} className="p-6 hover:bg-[#f7f9ff] transition-all group">
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                     <p className="text-sm font-bold text-[#181c20]">
                                                         {new Date(leave.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(leave.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                     </p>
                                                     <span className="text-[10px] text-[#64748b] font-medium bg-[#f1f3f9] px-2 py-0.5 rounded-md">
                                                         {leave.leaveType || 'Casual'}
                                                     </span>
                                                </div>
                                                <p className="text-xs text-[#424655] italic font-medium line-clamp-1 group-hover:line-clamp-none transition-all">"{leave.reason}"</p>
                                            </div>
                                            <div className="shrink-0">
                                                {getStatusBadge(leave.status)}
                                            </div>
                                        </div>
                                        
                                        {leave.remarks && (
                                            <div className="mt-3 pl-4 border-l-2 border-border">
                                                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1 opacity-60">Admin Remark</p>
                                                <p className="text-xs font-semibold text-[#181c20] line-clamp-1 group-hover:line-clamp-none transition-all">{leave.remarks}</p>
                                            </div>
                                        )}
                                        <div className="mt-3 flex items-center justify-between">
                                             <span className="text-[10px] text-content-muted font-medium tracking-tight">Applied: {new Date(leave.createdAt).toLocaleDateString()}</span>
                                             <span className="text-[9px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">ID: {leave.id.substring(0,8)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestPage;

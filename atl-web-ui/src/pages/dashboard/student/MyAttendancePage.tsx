
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import { attendanceService, type AttendanceRecord } from '../../../api/attendanceService';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar as CalendarIcon,
    Loader2,
    Filter,
    PieChart,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MyAttendancePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, percentage: 0 });

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadAttendance();
        }
    }, [user?.email, user?.tenantId]);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            // 1. Get Student Profile via context (Email + TenantId)
            const { student } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);

            if (!student) {
                setLoading(false);
                return;
            }

            const studentId = student.id;

            // 2. Get Attendance
            const records = await attendanceService.getStudentAttendance(studentId);
            setAttendance(records.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            // 3. Calculate Stats
            const total = records.length;
            const present = records.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
            const percentage = total > 0 ? (present / total) * 100 : 0;

            setStats({
                total,
                present,
                absent: total - present,
                percentage
            });
        } catch (error) {
            console.error("Failed to load attendance", error);
            toast.error("Failed to load attendance records");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Presence Analytics</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Attendance</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Historical Presence Ledger & Academic Compliance
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-8 py-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${stats.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Global Rate</p>
                            <p className={`text-xl font-black italic tracking-tighter uppercase ${stats.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {stats.percentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none italic">Session Domain</h3>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                             <CalendarIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-8 relative z-10">
                        <div>
                            <p className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-none mb-2">{stats.total}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Aggregate Cycles</p>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                             <div className="h-full bg-slate-900 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-[80px] font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                        ALL
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none italic">Compliance Marker</h3>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm shadow-emerald-50">
                             <CheckCircle2 className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                        </div>
                    </div>
                    <div className="space-y-8 relative z-10">
                        <div>
                            <p className="text-5xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none mb-2">{stats.present}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Positive Handshakes</p>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                        </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-[80px] font-black text-emerald-50/30 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                        YES
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none italic">Deduction Ledger</h3>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-sm shadow-rose-50">
                             <XCircle className="w-5 h-5 text-rose-600 group-hover:text-white" />
                        </div>
                    </div>
                    <div className="space-y-8 relative z-10">
                        <div>
                            <p className="text-5xl font-black text-rose-600 italic tracking-tighter uppercase leading-none mb-2">{stats.absent}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Null Presence</p>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                             <div className="h-full bg-rose-500 rounded-full" style={{ width: `${100 - stats.percentage}%` }}></div>
                        </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-[80px] font-black text-rose-50/30 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                        ABS
                    </div>
                </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-[4rem] border border-slate-50 shadow-sm overflow-hidden group/ledger hover:shadow-2xl transition-all duration-700">
                <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 italic">Presence Archival System</h3>
                        <p className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Activity Feed</p>
                    </div>
                    <div className="relative z-10">
                        <button className="flex items-center gap-4 px-8 py-4 bg-slate-50 rounded-[1.5rem] group/btn hover:bg-slate-900 transition-all duration-500 border border-slate-100 hover:border-slate-900">
                             <Filter className="w-4 h-4 text-slate-400 group-hover/btn:text-white group-hover/btn:rotate-180 transition-all duration-500" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/btn:text-white transition-colors">Apply Structural Filter</span>
                        </button>
                    </div>
                    {/* Abstract ID */}
                    <div className="absolute -right-20 -top-10 text-[120px] font-black text-slate-50 italic leading-none pointer-events-none uppercase transition-transform group-hover/ledger:scale-110 duration-700">
                        FEED
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-12 py-8 font-black">Temporal Signature</th>
                                <th className="px-12 py-8 font-black">Resource Classification</th>
                                <th className="px-12 py-8 font-black text-center">Operational Status</th>
                                <th className="px-12 py-8 font-black">Verification Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-12 py-32 text-center bg-white">
                                        <div className="flex flex-col items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                                            <div className="p-10 bg-slate-50 rounded-[2.5rem] mb-6 border border-slate-100">
                                                <CalendarIcon className="w-16 h-16 text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Archival record empty • No data points detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((record, index) => (
                                    <tr key={record.id || index} className="group hover:bg-slate-50/80 transition-all duration-500 cursor-default">
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shadow-sm">
                                                    <CalendarIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic">Timeline</p>
                                                    <p className="text-base font-black text-slate-900 uppercase tracking-tight italic">
                                                        {new Date(record.date!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none italic">General Academic Block</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">System ID: 00X-{index.toString().padStart(3, '0')}</p>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8 text-center">
                                            <span className={`px-6 py-2.5 rounded-full text-[9px] font-black inline-flex items-center gap-3 uppercase tracking-widest border transition-all duration-500 shadow-sm ${
                                                record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50' :
                                                record.status === 'ABSENT' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50' :
                                                record.status === 'LATE' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50' :
                                                'bg-slate-50 text-slate-600 border-slate-100 shadow-slate-50'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor] animate-pulse`}></div>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-slate-100 transition-all duration-500">
                                                <ShieldCheck className="w-4 h-4 text-slate-300" />
                                                <p className="text-[10px] font-bold text-slate-500 italic truncate max-w-[200px]">
                                                    {record.remarks ? record.remarks : "Operational Data Point Verified"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyAttendancePage;


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
    ShieldCheck,
    TrendingUp
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
            const { student } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            if (!student) { setLoading(false); return; }

            const studentId = student.id;
            const records = await attendanceService.getStudentAttendance(studentId);
            setAttendance(records.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            const total = records.length;
            const present = records.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
            const percentage = total > 0 ? (present / total) * 100 : 0;
            setStats({ total, present, absent: total - present, percentage });
        } catch (error) {
            console.error('Failed to load attendance', error);
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#2a6df4]" />
            </div>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PRESENT': return { color: 'text-[#0054d1]', bg: 'bg-[#dae2ff]', dot: 'bg-[#0054d1]', label: 'Present' };
            case 'LATE':    return { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', label: 'Late' };
            case 'ABSENT':  return { color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]', dot: 'bg-[#ba1a1a]', label: 'Absent' };
            default:        return { color: 'text-[#424655]', bg: 'bg-[#eceef4]', dot: 'bg-[#424655]', label: status };
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">

            {/* ── Page Header ── */}
            <div className="rounded-2xl bg-[#f1f3f9] p-8 md:p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest">Presence Analytics</span>
                    <h1 className="mt-2 text-3xl font-bold text-[#1a3d8a]">My Attendance</h1>
                    <p className="text-sm text-[#424655] mt-1">
                        {user && `Academic compliance record for the current semester`}
                    </p>
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/8 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* ── 3 KPI Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Sessions */}
                <div className="group bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Total Sessions</p>
                        <div className="w-9 h-9 rounded-xl bg-[#f1f3f9] flex items-center justify-center group-hover:bg-[#eceef4] transition-colors">
                            <CalendarIcon className="w-4 h-4 text-[#424655]" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-[#181c20]">{stats.total}</p>
                    <p className="text-xs text-[#64748b] mt-2">Aggregate recorded cycles</p>
                    <div className="mt-4 h-1.5 w-full bg-[#e6e8ee] rounded-full overflow-hidden">
                        <div className="h-full bg-[#181c20] rounded-full w-full" />
                    </div>
                </div>

                {/* Present */}
                <div className="group bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Present Days</p>
                        <div className="w-9 h-9 rounded-xl bg-[#dae2ff] flex items-center justify-center group-hover:bg-[#b2c5ff] transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-[#0054d1]" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-[#0054d1]">{stats.present}</p>
                    <p className="text-xs text-[#64748b] mt-2">Confirmed attendance</p>
                    <div className="mt-4 h-1.5 w-full bg-[#e6e8ee] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#0054d1] to-[#2a6df4] rounded-full transition-all duration-700"
                            style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Absent */}
                <div className="group bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Absent Days</p>
                        <div className="w-9 h-9 rounded-xl bg-[#ffdad6] flex items-center justify-center group-hover:bg-[#ffb4ab] transition-colors">
                            <XCircle className="w-4 h-4 text-[#ba1a1a]" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-[#ba1a1a]">{stats.absent}</p>
                    <p className="text-xs text-[#64748b] mt-2">Unattended sessions</p>
                    <div className="mt-4 h-1.5 w-full bg-[#e6e8ee] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#ba1a1a] rounded-full transition-all duration-700"
                            style={{ width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Overall Rate Banner ── */}
            <div className={`rounded-2xl p-6 flex items-center gap-6 ${stats.percentage >= 75 ? 'bg-[#dae2ff]' : 'bg-[#ffdad6]'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stats.percentage >= 75 ? 'bg-[#2a6df4]' : 'bg-[#ba1a1a]'}`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-[#181c20]">Overall Attendance Rate</p>
                        <p className={`text-2xl font-bold ${stats.percentage >= 75 ? 'text-[#0054d1]' : 'text-[#ba1a1a]'}`}>
                            {stats.percentage.toFixed(1)}%
                        </p>
                    </div>
                    <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${stats.percentage >= 75 ? 'bg-[#0054d1]' : 'bg-[#ba1a1a]'}`}
                            style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                        />
                    </div>
                    {stats.percentage < 75 && (
                        <p className="text-xs text-[#ba1a1a] mt-2 font-medium">
                            ⚠ Attendance below required 75% threshold
                        </p>
                    )}
                </div>
            </div>

            {/* ── Attendance History Table ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f1f3f9] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest mb-1">Attendance Log</p>
                        <h3 className="text-base font-bold text-[#181c20]">Activity Feed</h3>
                    </div>
                    <span className="text-xs text-[#64748b]">{attendance.length} records</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f7f9ff] text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Session</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-[#f1f3f9] rounded-2xl flex items-center justify-center">
                                                <CalendarIcon className="w-7 h-7 text-[#c2c6d7]" />
                                            </div>
                                            <p className="text-sm text-[#424655]">No attendance records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((record, index) => {
                                    const config = getStatusConfig(record.status);
                                    return (
                                        <tr
                                            key={record.id ?? index}
                                            className="group border-t border-[#f7f9ff] hover:bg-[#f7f9ff] transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#f1f3f9] flex items-center justify-center group-hover:bg-[#eceef4] transition-colors shrink-0">
                                                        <CalendarIcon className="w-4 h-4 text-[#424655]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-[#181c20]">
                                                        {new Date(record.date!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-[#424655]">Academic Session</span>
                                                <p className="text-[10px] text-[#64748b] mt-0.5">Period #{index + 1}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-[#c2c6d7] shrink-0" />
                                                    <span className="text-xs text-[#424655] truncate max-w-[160px]">
                                                        {record.remarks || 'Verified'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyAttendancePage;

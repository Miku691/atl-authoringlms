
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
    PieChart
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                <p className="text-gray-500">Track your presence across all classes</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Attendance Rate</span>
                        <div className={`p-2 rounded-lg ${stats.percentage >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <PieChart className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.percentage.toFixed(1)}%</h3>
                        {stats.percentage < 75 && (
                            <span className="text-xs text-red-600 font-medium">Below Target</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Target: 75% minimum</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm font-medium text-gray-500 block mb-2">Total Classes</span>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm font-medium text-gray-500 block mb-2">Present</span>
                    <h3 className="text-2xl font-bold text-green-600">{stats.present}</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${stats.percentage}%` }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm font-medium text-gray-500 block mb-2">Absent</span>
                    <h3 className="text-2xl font-bold text-red-600">{stats.absent}</h3>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: `${100 - stats.percentage}%` }} />
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Attendance History</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        <Filter className="w-4 h-4" /> Filter by Subject
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Subject</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((record, index) => (
                                    <tr key={record.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 border-l-4 border-transparent hover:border-indigo-500">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                {new Date(record.date!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                            {/* Subject name mapping needs enhancement in backend or frontend cache */}
                                            General Class
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                                                    record.status === 'LATE' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {record.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3" />}
                                                {record.status === 'ABSENT' && <XCircle className="w-3 h-3" />}
                                                {(record.status === 'LATE' || record.status === 'LEAVE') && <Clock className="w-3 h-3" />}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 italic">
                                            {record.remarks || '-'}
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

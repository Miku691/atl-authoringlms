import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AttendanceStats {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    lateDays: number;
    attendancePercentage: number;
}

interface AttendanceChartProps {
    stats: AttendanceStats;
    personName: string;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ stats, personName }) => {
    // Calculate SVG donut properties
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (stats.attendancePercentage / 100) * circumference;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{personName}'s Attendance</h3>
                    <p className="text-sm text-gray-500">Monthly Performance Overview</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Current Month
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Donut Chart */}
                <div className="relative flex justify-center">
                    <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-gray-100"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="text-indigo-600 transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-gray-900">{Math.round(stats.attendancePercentage)}%</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Attendance</span>
                    </div>
                </div>

                {/* Stats Breakdown */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Present</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.presentDays}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                            <div className="flex items-center gap-2 text-red-600 mb-1">
                                <XCircle className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Absent</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.absentDays}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                            <div className="flex items-center gap-2 text-yellow-600 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Late</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.lateDays}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Leave</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{stats.leaveDays}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Total Working Days</span>
                            <span className="font-bold text-gray-900">{stats.totalDays}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${stats.attendancePercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceChart;

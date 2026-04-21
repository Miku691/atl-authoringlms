import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../../store/store';
import { studentDashboardService, type StudentDashboardData } from '../../../api/studentDashboardService';
import { financeService } from '../../../api/financeService';
import { instructorService } from '../../../api/instructorService';
import type { FinanceSummary } from '../../../types/finance';
import {
    BookOpen, Clock, Bell, Calendar,
    FileText, CheckCircle2, ArrowUpRight,
    ArrowRight, Shield, Zap, TrendingUp,
    AlertCircle, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboardHome: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            fetchDashboard();
        }
    }, [user?.email, user?.tenantId]);

    const fetchDashboard = async () => {
        if (!user?.email || !user?.tenantId) return;
        setLoading(true);
        try {
            const [dashboardData, summary, instructorsRes] = await Promise.all([
                studentDashboardService.getDashboardData(user.email, user.tenantId),
                financeService.getMySummary(),
                instructorService.getInstructorsByTenant(user.tenantId)
            ]);

            if (dashboardData.todayClasses && instructorsRes) {
                const instructorMap: Record<string, string> = {};
                instructorsRes.forEach((inst: any) => {
                    instructorMap[inst.id] = `${inst.firstName} ${inst.lastName}`;
                });
                dashboardData.todayClasses = dashboardData.todayClasses.map(cls => ({
                    ...cls,
                    instructorName: cls.instructorId ? (instructorMap[cls.instructorId] || 'Academy Faculty') : 'Academy Faculty'
                }));
            }

            setData(dashboardData);
            setFinanceSummary(summary);
        } catch (error) {
            console.error('Failed to load student dashboard', error);
            toast.error('Could not refresh your dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-[3px] border-[#2a6df4] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-[#64748b] tracking-widest uppercase">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data?.student) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl p-10 shadow-[0_8px_32px_-4px_rgba(26,61,138,0.08)] text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                        <Shield className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#181c20]">Student Profile Not Found</h2>
                        <p className="text-sm text-[#424655] mt-2 leading-relaxed">
                            No student record found for <span className="text-[#0054d1] font-semibold">{user?.username}</span>.
                            Please contact administration to complete your enrollment.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const attendancePct = data?.attendanceSummary?.percentage ?? 0;
    const nextClass = data?.todayClasses?.[0];
    const pendingAssignments = data?.assignmentSummary?.pendingAssignments ?? 0;
    const feesBalance = financeSummary?.balance ?? 0;

    const quickLinks = [
        { label: 'My Timetable', icon: Calendar, path: '/student/timetable', accent: '#2a6df4', accentBg: '#eef2ff' },
        { label: 'My Academics', icon: BookOpen, path: '/student/academics', accent: '#0054d1', accentBg: '#f0f4ff' },
        { label: 'Assignments', icon: FileText, path: '/student/assignments', accent: '#9e3f00', accentBg: '#fff3ec' },
        { label: 'Attendance', icon: CheckCircle2, path: '/student/attendance', accent: '#3c5ba9', accentBg: '#eef2ff' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">

            {/* ── Hero Welcome Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#f1f3f9] p-8 md:p-12">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest bg-[#dae1ff] px-3 py-1 rounded-full">
                                {data.enrollments?.[0]?.academicYear ?? 'Academic Session'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1a3d8a] leading-tight">
                            Good Morning, {data.student.firstName ?? user?.username} 👋
                        </h1>
                        <p className="text-sm text-[#424655] font-medium">
                            Here's your academic snapshot for today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-6 py-4 bg-white rounded-xl shadow-[0_4px_16px_-4px_rgba(26,61,138,0.08)] text-center min-w-[120px]">
                            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest mb-1">Attendance</p>
                            <p className={`text-2xl font-bold ${attendancePct >= 75 ? 'text-[#0054d1]' : 'text-[#ba1a1a]'}`}>
                                {attendancePct.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </div>
                {/* Soft decorative circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#2a6df4]/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#3c5ba9]/6 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* ── 4 KPI Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Attendance */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Overall Attendance</p>
                        <div className="w-8 h-8 rounded-xl bg-[#eef2ff] flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-[#2a6df4]" />
                        </div>
                    </div>
                    <p className={`text-3xl font-bold ${attendancePct >= 75 ? 'text-[#0054d1]' : 'text-[#ba1a1a]'}`}>
                        {attendancePct.toFixed(0)}%
                    </p>
                    <div className="mt-3 h-1.5 w-full bg-[#e6e8ee] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0054d1] to-[#2a6df4] transition-all duration-700"
                            style={{ width: `${Math.min(attendancePct, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Next Class */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Next Class</p>
                        <div className="w-8 h-8 rounded-xl bg-[#f0f4ff] flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#0054d1]" />
                        </div>
                    </div>
                    {nextClass ? (
                        <>
                            <p className="text-sm font-bold text-[#181c20] leading-tight line-clamp-1">{nextClass.subjectName}</p>
                            <p className="text-xs text-[#424655] mt-1">{nextClass.startTime?.substring(0, 5)} · Room {nextClass.room ?? 'TBA'}</p>
                        </>
                    ) : (
                        <p className="text-sm font-semibold text-[#424655]">No more classes today</p>
                    )}
                </div>

                {/* Pending Assignments */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Pending</p>
                        <div className="w-8 h-8 rounded-xl bg-[#fff3ec] flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#9e3f00]" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-[#9e3f00]">{pendingAssignments}</p>
                    <p className="text-xs text-[#64748b] mt-1">Due this week</p>
                </div>

                {/* Fees Status */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Fees Status</p>
                        <div className="w-8 h-8 rounded-xl bg-[#eef2ff] flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#3c5ba9]" />
                        </div>
                    </div>
                    <p className={`text-xl font-bold ${feesBalance > 0 ? 'text-[#ba1a1a]' : 'text-[#0054d1]'}`}>
                        {feesBalance > 0 ? `₹${feesBalance.toLocaleString()} Due` : 'Cleared'}
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">
                        {feesBalance > 0 ? 'Outstanding balance' : 'All fees paid'}
                    </p>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(link.path)}
                        className="group flex flex-col items-start gap-4 p-5 bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.12)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: link.accentBg }}
                        >
                            <link.icon className="w-5 h-5" style={{ color: link.accent }} />
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-semibold text-[#181c20]">{link.label}</span>
                            <ChevronRight className="w-4 h-4 text-[#c2c6d7] group-hover:text-[#2a6df4] group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </button>
                ))}
            </div>

            {/* ── Main Grid: Schedule + Sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Today's Schedule */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#f1f3f9] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-[#2a6df4]" />
                            <h3 className="text-sm font-semibold text-[#181c20]">Today's Schedule</h3>
                        </div>
                        <span className="text-xs text-[#64748b]">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <div className="p-4 space-y-2">
                        {data.todayClasses && data.todayClasses.length > 0 ? (
                            data.todayClasses.map((cls, idx) => (
                                <div
                                    key={idx}
                                    className="group flex items-center gap-5 p-4 rounded-xl hover:bg-[#f7f9ff] transition-all duration-200 cursor-pointer"
                                    onClick={() => navigate('/student/timetable')}
                                >
                                    <div className="flex flex-col items-center min-w-[56px]">
                                        <span className="text-sm font-bold text-[#0054d1]">{cls.startTime?.substring(0, 5) ?? '--:--'}</span>
                                        <span className="text-[10px] text-[#64748b] mt-0.5">to {cls.endTime?.substring(0, 5) ?? '--:--'}</span>
                                    </div>
                                    <div className="w-px h-10 bg-[#e6e8ee] rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#181c20] truncate group-hover:text-[#0054d1] transition-colors">
                                            {cls.subjectName ?? 'Session'}
                                        </p>
                                        <p className="text-xs text-[#64748b] mt-0.5">{cls.instructorName ?? 'Academy Faculty'} · Room {cls.room ?? 'TBA'}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-[#c2c6d7] group-hover:text-[#2a6df4] shrink-0 transition-colors" />
                                </div>
                            ))
                        ) : (
                            <div className="py-16 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-[#f1f3f9] rounded-2xl flex items-center justify-center mb-4">
                                    <Calendar className="w-7 h-7 text-[#c2c6d7]" />
                                </div>
                                <p className="text-sm font-semibold text-[#424655]">No classes today</p>
                                <p className="text-xs text-[#64748b] mt-1">Enjoy your free day!</p>
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-5">
                        <button
                            onClick={() => navigate('/student/timetable')}
                            className="w-full py-2.5 text-xs font-semibold text-[#0054d1] bg-[#f0f4ff] hover:bg-[#dae2ff] rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            View Full Timetable <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Sidebar: Metrics + Announcements */}
                <div className="space-y-4">

                    {/* Academic Pulse Card */}
                    <div className="bg-gradient-to-br from-[#0054d1] to-[#2a6df4] rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest">Academic Pulse</h3>
                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs text-white/70">Attendance Rate</span>
                                    <span className="text-2xl font-bold">{attendancePct.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(attendancePct, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] text-white/60 uppercase tracking-widest">Assignments</p>
                                    <p className="text-sm font-semibold mt-0.5">
                                        {data.assignmentSummary?.completedAssignments ?? 0} Done ·{' '}
                                        <span className="text-[#ffb694]">{pendingAssignments} Pending</span>
                                    </p>
                                </div>
                                <CheckCircle2 className="w-6 h-6 text-white/40" />
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/student/academics')}
                            className="w-full mt-5 py-2.5 bg-white text-[#0054d1] text-xs font-bold rounded-xl hover:bg-[#f0f4ff] transition-colors flex items-center justify-center gap-2"
                        >
                            View Academics <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Announcements Feed */}
                    <div className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#f1f3f9] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-[#ba1a1a]" />
                                <h3 className="text-sm font-semibold text-[#181c20]">Announcements</h3>
                            </div>
                            {data.activeAnnouncements && data.activeAnnouncements.length > 0 && (
                                <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                                    {data.activeAnnouncements.length} new
                                </span>
                            )}
                        </div>
                        <div className="p-3 space-y-1 max-h-[280px] overflow-y-auto">
                            {data.activeAnnouncements && data.activeAnnouncements.length > 0 ? (
                                data.activeAnnouncements.slice(0, 5).map((item) => (
                                    <div
                                        key={item.id}
                                        className="group p-3 rounded-xl hover:bg-[#f7f9ff] transition-all cursor-pointer flex items-start gap-3"
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.priority === 'URGENT' ? 'bg-[#ba1a1a]' : 'bg-[#2a6df4]'}`} />
                                        <div className="min-w-0">
                                            {item.priority === 'URGENT' && (
                                                <span className="text-[9px] font-bold text-[#ba1a1a] uppercase tracking-widest">Urgent · </span>
                                            )}
                                            <p className="text-xs font-semibold text-[#181c20] line-clamp-2 group-hover:text-[#0054d1] transition-colors">
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] text-[#64748b] mt-0.5">
                                                {new Date(item.createdAt!).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-[#c2c6d7] group-hover:text-[#2a6df4] shrink-0 mt-0.5 transition-colors" />
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center">
                                    <Bell className="w-8 h-8 text-[#e0e2e8] mx-auto mb-2" />
                                    <p className="text-xs text-[#64748b]">No new announcements</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardHome;

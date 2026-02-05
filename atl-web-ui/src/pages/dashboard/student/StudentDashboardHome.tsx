import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../../store/store';
import { studentDashboardService, type StudentDashboardData } from '../../../api/studentDashboardService';
import { financeService } from '../../../api/financeService';
import type { FinanceSummary } from '../../../types/finance';
import {
    BookOpen, Clock, Bell, Calendar,
    FileText, CheckCircle2, ArrowUpRight,
    PlayCircle, Award, Zap, Shield, DollarSign
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
            const [dashboardData, summary] = await Promise.all([
                studentDashboardService.getDashboardData(user.email, user.tenantId),
                financeService.getMySummary()
            ]);
            setData(dashboardData);
            setFinanceSummary(summary);
        } catch (error) {
            console.error("Failed to load student dashboard", error);
            toast.error("Cloud not refresh your dashboard metrics");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Academic Profile...</p>
                </div>
            </div>
        );
    }

    // Handle missing student record (e.g. admin with student role but no profile)
    if (!data?.student) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center space-y-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
                            <Shield className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Profile Not Found</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            We couldn't find a student record for <span className="text-indigo-600 font-bold">{user?.username}</span>.
                            If you are a student, please contact your administration to complete your enrollment.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                            >
                                Return to Main Dashboard
                            </button>
                        </div>
                    </div>
                    {/* Decorative glow */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]"></div>
                </div>
            </div>
        );
    }

    const quickLinks = [
        { label: 'View Timetable', icon: Calendar, path: '/student/timetable', color: 'bg-indigo-50 text-indigo-600' },
        { label: 'My Syllabus', icon: BookOpen, path: '/student/syllabus', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Assignments', icon: FileText, path: '/student/assignments', color: 'bg-amber-50 text-amber-600' },
        { label: 'Attendance', icon: Clock, path: '/student/attendance', color: 'bg-rose-50 text-rose-600' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Elegant Header with Personal Context */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 md:p-12 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Hey, {data?.student?.firstName || user?.username}! 🚀
                        </h1>
                        <p className="text-indigo-200/80 font-medium text-lg max-w-xl">
                            You're doing great! You've attended <span className="text-white font-black underline decoration-indigo-400">{data?.attendanceSummary.percentage}%</span> of your classes this term.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center flex flex-col items-center">
                            <Award className="w-8 h-8 text-amber-400 mb-2" />
                            <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">Level</span>
                            <span className="text-2xl font-black text-white mt-1">PRO</span>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center flex flex-col items-center">
                            <Zap className="w-8 h-8 text-indigo-400 mb-2 shadow-inner" />
                            <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">Streak</span>
                            <span className="text-2xl font-black text-white mt-1">12D</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(link.path)}
                        className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                    >
                        <div className={`p-4 rounded-2xl ${link.color} group-hover:scale-110 transition-transform`}>
                            <link.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{link.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Real-time Schedule Widget */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-xl"><Clock className="w-5 h-5 text-indigo-600" /></div>
                            TODAY'S SCHEDULE
                        </h3>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {data?.todayClasses && data.todayClasses.length > 0 ? (
                            data.todayClasses.map((cls, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-lg font-black text-indigo-600 leading-none">{cls.startTime?.substring(0, 5) || '--:--'}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-tighter">to {cls.endTime?.substring(0, 5) || '--:--'}</span>
                                        </div>
                                        <div className="w-px h-12 bg-slate-100"></div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">Period {cls.periodNumber || '?'}</span>
                                                <span className="px-2 py-0.5 bg-indigo-50 rounded text-[9px] font-black text-indigo-600 uppercase italic">LIVE SOON</span>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cls.subjectName || 'Academic Session'}</h4>
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                By {cls.instructorName || 'Academy Faculty'} • Room {cls.room || 'A-101'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center">
                                <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Classes Today</h4>
                                <p className="text-xs font-medium text-slate-300 mt-2">Perfect time for some self-study or relaxation!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Announcements & Progress */}
                <div className="space-y-8">
                    {/* Notice Board */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 tracking-widest uppercase">
                                <Bell className="w-4 h-4 text-rose-500" /> Campus Portal
                            </h3>
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                        </div>
                        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {data?.activeAnnouncements && data.activeAnnouncements.length > 0 ? (
                                data.activeAnnouncements.map((item) => (
                                    <div key={item.id} className="group p-4 rounded-3xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-pointer">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${item.priority === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {item.priority}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-300">{new Date(item.createdAt!).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-[13px] font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors uppercase leading-tight">{item.title}</h4>
                                        <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">{item.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-300">
                                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Announcements</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Profile Summary */}
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">My Academic Pulse</h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Term Attendance</span>
                                        <span className="text-2xl font-black">{data?.attendanceSummary.percentage}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000"
                                            style={{ width: `${data?.attendanceSummary.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Assignment Status</p>
                                            <p className="text-[13px] font-black">4 Pending • 12 Done</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-600" />
                                </div>
                            </div>

                            <button className="w-full mt-10 py-5 bg-indigo-600 hover:bg-white hover:text-indigo-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group">
                                <PlayCircle className="w-4 h-4" /> Start Learning Now
                            </button>
                        </div>

                        {/* Glow */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardHome;

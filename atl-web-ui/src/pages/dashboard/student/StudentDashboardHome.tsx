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
            const [dashboardData, summary, instructorsRes] = await Promise.all([
                studentDashboardService.getDashboardData(user.email, user.tenantId),
                financeService.getMySummary(),
                instructorService.getInstructorsByTenant(user.tenantId)
            ]);

            // Enrich todayClasses with instructor names
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
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
            {/* Flagship Header - Proportional & Premium */}
            <div className="relative overflow-hidden rounded-[3rem] bg-[#0A0C10] p-10 md:p-14 shadow-2xl border border-white/5 group">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-500/10 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] border border-indigo-500/20">Institutional Intelligence</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{data?.enrollments?.[0]?.offeringName || 'Standard Operations'}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
                            Welcome, <span className="text-indigo-400">{data?.student?.firstName || user?.username}</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-xl leading-relaxed opacity-80">
                            Your performance index is currently <span className="text-white">OPTIMIZED</span> at <span className="text-indigo-400 font-black">{data?.attendanceSummary.percentage}%</span> metrics density.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-8 py-5 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 text-center min-w-[140px] group-hover:bg-white/10 transition-all duration-500">
                            <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-2 opacity-60">System state</p>
                            <p className="text-xs font-black text-emerald-400 flex items-center justify-center gap-2 italic">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span> VERIFIED
                            </p>
                        </div>
                    </div>
                </div>

                {/* Abstract Visual Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
            </div>

            {/* Premium Strategic Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {quickLinks.map((link, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(link.path)}
                        className="group flex items-center gap-5 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:bg-slate-900 transition-all duration-500"
                    >
                        <div className={`p-4 rounded-3xl ${link.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                            <link.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-white transition-colors">{link.label}</span>
                    </button>
                ))}
            </div>

            {/* Dynamic Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Schedule Engine */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" /> Operational Schedule
                        </h3>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase italic tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data?.todayClasses && data.todayClasses.length > 0 ? (
                            data.todayClasses.map((cls, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex items-center justify-between gap-8 relative overflow-hidden">
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className="flex flex-col items-center min-w-[70px]">
                                            <span className="text-lg font-black text-indigo-600 tracking-tighter italic">{cls.startTime?.substring(0, 5) || '--:--'}</span>
                                            <span className="text-[8px] font-black text-slate-300 uppercase mt-0.5 tracking-widest leading-none">to {cls.endTime?.substring(0, 5) || '--:--'}</span>
                                        </div>
                                        <div className="w-px h-12 bg-slate-100 group-hover:bg-indigo-50 transition-colors"></div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5 opacity-60">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1.5">
                                                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div> Slot {cls.periodNumber || '?'}
                                                </span>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest italic">Unit {cls.room || 'N/A'}</span>
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic leading-none group-hover:text-indigo-600 transition-colors">{cls.subjectName || 'Session'}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{cls.instructorName || 'Academy Faculty'}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    
                                    {/* Backdrop ID */}
                                    <div className="absolute -right-4 -bottom-4 text-[60px] font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                                        #{cls.periodNumber}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                                <div className="p-8 bg-slate-50 rounded-full mb-6 grayscale opacity-30 group-hover:grayscale-0 transition-all">
                                    <Calendar className="w-10 h-10 text-slate-200" />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Operational Downtime</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-relaxed opacity-60">No academic events detected for the current cycle</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Intelligence Sidebar */}
                <div className="space-y-8">
                    {/* Notice Engine */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[350px] overflow-hidden group">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                            <h3 className="text-[10px] font-black text-slate-900 flex items-center gap-3 tracking-[0.2em] uppercase">
                                <Bell className="w-4 h-4 text-rose-500" /> Intelligence Feed
                            </h3>
                            {data?.activeAnnouncements && data.activeAnnouncements.length > 0 && (
                                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[8px] font-black rounded-full uppercase italic">{data.activeAnnouncements.length} NEW</span>
                            )}
                        </div>
                        <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                            {data?.activeAnnouncements && data.activeAnnouncements.length > 0 ? (
                                data.activeAnnouncements.slice(0, 5).map((item) => (
                                    <div key={item.id} className="group/item p-5 rounded-[1.5rem] border border-transparent hover:bg-slate-50 hover:border-slate-100 transition-all cursor-pointer relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest italic ${item.priority === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {item.priority}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">{new Date(item.createdAt!).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-xs font-black text-slate-800 line-clamp-2 leading-relaxed group-hover/item:text-indigo-600 uppercase tracking-tight italic">{item.title}</h4>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 opacity-20">
                                    <Bell className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Station Silent</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic Pulse - Premium Dark */}
                    <div className="p-10 bg-[#0A0C10] rounded-[3rem] text-white shadow-2xl border border-white/5 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">Metric pulse</h3>
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-500">
                                    <Zap className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Attendance flow</span>
                                        <span className="text-[32px] font-black italic tracking-tighter leading-none">{data?.attendanceSummary.percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                            style={{ width: `${data?.attendanceSummary.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-emerald-500/10 transition-colors">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5 italic">Deliverables</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">{data?.assignmentSummary.completedAssignments} Complete • <span className="text-rose-400">{data?.assignmentSummary.pendingAssignments} Backlog</span></p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/student/academics')}
                                    className="w-full mt-4 py-5 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-indigo-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 group/btn shadow-xl"
                                >
                                    <PlayCircle className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" /> 
                                    <span>Execute Portfolio View</span>
                                </button>
                            </div>
                        </div>

                        {/* Visual Glow */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardHome;

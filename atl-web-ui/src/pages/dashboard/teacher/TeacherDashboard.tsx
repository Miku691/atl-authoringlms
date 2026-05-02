import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { instructorService } from '../../../api/instructorService';
import { announcementService, type Announcement } from '../../../api/announcementService';
import {
    Users,
    BookOpen,
    Clock,
    Bell,
    Calendar,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TeacherDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalSubjects: 0,
        activeStudents: 0
    });
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadDashboardData();
        }
    }, [user?.email, user?.tenantId]);

    const loadDashboardData = async () => {
        if (!user?.email || !user?.tenantId) return;
        setLoading(true);
        try {
            // 1. Get Instructor Profile
            const instRes = await instructorService.resolveProfile(user.email, user.tenantId);

            if (instRes.status === 'SUCCESS' && instRes.apiData) {
                const instructorData = instRes.apiData;
                setInstructor(instructorData);

                // 2. Get Assignments & Notices in parallel with resilience
                const [assignResult, noticesResult] = await Promise.allSettled([
                    instructorService.getAssignmentsByInstructor(instructorData.id),
                    announcementService.getActiveAnnouncements(user.tenantId, 'INSTRUCTOR')
                ]);

                if (assignResult.status === 'fulfilled' && assignResult.value.status === 'SUCCESS') {
                    const assignData = assignResult.value.apiData || [];
                    setAssignments(assignData);

                    setStats(prev => ({
                        ...prev,
                        totalClasses: new Set(assignData.map((a: any) => a.offeringId)).size,
                        totalSubjects: new Set(assignData.filter((a: any) => a.subjectId).map((a: any) => a.subjectId)).size
                    }));
                } else {
                    console.error("Dashboard: Failed to fetch assignments", assignResult.status === 'rejected' ? assignResult.reason : 'API Error');
                }

                if (noticesResult.status === 'fulfilled') {
                    setAnnouncements(noticesResult.value.apiData || []);
                } else {
                    console.error("Dashboard: Failed to fetch announcements", noticesResult.reason);
                }
            } else {
                setInstructor(null);
            }
        } catch (error: any) {
            console.error("Dashboard load error", error);
            // If it's a 404 on profile resolve, we handle it via null instructor
            if (error.response?.status !== 404) {
                toast.error("Failed to load dashboard data");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-content-secondary animate-pulse">Setting up your faculty workspace...</p>
            </div>
        );
    }

    // Handle missing instructor record
    if (!instructor) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-surface rounded-[3rem] p-10 shadow-2xl border border-border text-center space-y-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
                            <Users className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-content-primary uppercase tracking-tight">Instructor Profile Not Found</h2>
                        <p className="text-content-secondary font-medium leading-relaxed">
                            We couldn't find an instructor record for <span className="text-indigo-600 font-bold">{user?.username}</span>.
                            If you are a staff member, please contact your administration to set up your profile.
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
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg shadow-indigo-100">
                        {user?.username?.[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-content-primary">Hello, Professor {instructor?.lastName || user?.username}!</h1>
                        <p className="text-content-secondary mt-1">{instructor?.specialization || 'Faculty Member'} • {instructor?.qualification}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="text-right hidden md:block border-r pr-6 border-border">
                        <p className="text-xs text-content-muted uppercase font-bold tracking-wider">Today's Date</p>
                        <p className="text-lg font-bold text-content-primary">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="pl-3">
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-bold uppercase tracking-tight">Active Session</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-content-muted font-bold uppercase tracking-wider">My Classes</p>
                            <h3 className="text-2xl font-black text-content-primary">{stats.totalClasses}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-content-muted font-bold uppercase tracking-wider">Total Subjects</p>
                            <h3 className="text-2xl font-black text-content-primary">{stats.totalSubjects}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-content-muted font-bold uppercase tracking-wider">Hours Today</p>
                            <h3 className="text-2xl font-black text-content-primary">4.5h</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Tasks & Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    {/* My Classes Grid */}
                    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" /> My Active Classes
                            </h2>
                            <button className="text-sm text-indigo-600 font-bold hover:underline">View All</button>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="text-center py-12 bg-chrome rounded-2xl border border-dashed border-border">
                                <p className="text-content-muted italic mb-2">You haven't been assigned to any classes yet.</p>
                                <p className="text-xs text-content-muted">Please contact the administrator for course allocation.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignments.map((a: any) => (
                                    <div
                                        key={a.id}
                                        onClick={() => navigate(`/instructor/class/${a.offeringId}`)}
                                        className="p-4 border border-border rounded-2xl hover:border-indigo-200 hover:shadow-sm transition-all flex justify-between items-center group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-chrome flex items-center justify-center font-bold text-content-muted group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                {a.className?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-content-primary group-hover:text-indigo-600 transition-colors">{a.className || 'Class Room'}</h4>
                                                <p className="text-xs text-content-secondary">{a.subjectName || 'All Subjects'} • {a.role}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="p-4 bg-surface border border-border rounded-2xl shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group flex flex-col items-center gap-2">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-content-secondary">Mark Attendance</span>
                        </button>
                        <button className="p-4 bg-surface border border-border rounded-2xl shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group flex flex-col items-center gap-2">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-content-secondary">Upload Content</span>
                        </button>
                        <button className="p-4 bg-surface border border-border rounded-2xl shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group flex flex-col items-center gap-2">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Bell className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-content-secondary">Post Notice</span>
                        </button>
                        <button className="p-4 bg-surface border border-border rounded-2xl shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group flex flex-col items-center gap-2">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-content-secondary">My Timetable</span>
                        </button>
                    </div>
                </div>

                {/* Sidebar: Announcements */}
                <div className="space-y-6">
                    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-500" /> Notifications
                            </h2>
                        </div>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {announcements.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                                    <p className="text-sm text-content-muted">No active updates for you today.</p>
                                </div>
                            ) : (
                                announcements.map((item) => (
                                    <div key={item.id} className={`p-4 rounded-2xl border transition-all hover:shadow-sm cursor-pointer ${item.priority === 'URGENT' ? 'bg-red-50 border-red-100 hover:border-red-200' :
                                        item.priority === 'IMPORTANT' ? 'bg-amber-50 border-amber-100 hover:border-amber-200' :
                                            'bg-chrome border-border hover:border-border'
                                        }`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-bold text-sm ${item.priority === 'URGENT' ? 'text-red-900' :
                                                item.priority === 'IMPORTANT' ? 'text-amber-900' : 'text-content-primary'
                                                }`}>{item.title}</h4>
                                            {item.priority === 'URGENT' && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>}
                                        </div>
                                        <p className={`text-xs line-clamp-2 ${item.priority === 'URGENT' ? 'text-red-700' :
                                            item.priority === 'IMPORTANT' ? 'text-amber-700' : 'text-content-secondary'
                                            }`}>{item.content}</p>
                                        <span className="text-[10px] text-content-muted mt-3 block font-medium">
                                            {new Date(item.createdAt!).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        {announcements.length > 0 && (
                            <button className="w-full mt-6 py-3 text-sm font-bold text-content-secondary hover:text-indigo-600 transition-colors border-t border-border">
                                View All Notifications
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../../store/store';
import { announcementService, type Announcement } from '../../../api/announcementService';
import { dashboardService, type DashboardStats, type GenderStat, type OfferingStat } from '../../../api/dashboardService';
import DashboardChart from './components/DashboardChart';
import {
    Users, BookOpen, GraduationCap, TrendingUp, Bell,
    PlusCircle, Calendar, ShieldCheck, ArrowUpRight, Clock, MapPin,
    LayoutDashboard, UserPlus, FileText, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardHome: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [genderStats, setGenderStats] = useState<GenderStat[]>([]);
    const [offeringStats, setOfferingStats] = useState<OfferingStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.tenantId) {
            fetchDashboardData();
        }
    }, [user?.tenantId]);

    const fetchDashboardData = async () => {
        if (!user?.tenantId) return;
        setLoading(true);
        try {
            const [announcRes, statsData, gStats, oStats] = await Promise.all([
                announcementService.getAnnouncementsByTenant(user.tenantId),
                dashboardService.getStats(user.tenantId),
                dashboardService.getGenderStats(user.tenantId),
                dashboardService.getOfferingStats(user.tenantId)
            ]);
            setAnnouncements(announcRes.apiData || []);
            setStats(statsData);
            setGenderStats(gStats);
            setOfferingStats(oStats);
        } catch (error) {
            console.error("Dashboard data fetch failed", error);
            toast.error("Failed to load some dashboard metrics");
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Students',
            value: stats?.totalStudents.toLocaleString() || '0',
            change: '+5%',
            icon: GraduationCap,
            color: 'indigo',
            path: '/people/students'
        },
        {
            label: 'Active Teachers',
            value: stats?.totalInstructors.toLocaleString() || '0',
            change: '+2',
            icon: Users,
            color: 'emerald',
            path: '/people/instructors'
        },
        {
            label: 'Programs',
            value: stats?.totalPrograms.toLocaleString() || '0',
            change: '0',
            icon: BookOpen,
            color: 'blue',
            path: '/academics/offerings'
        },
        {
            label: 'Live Offerings',
            value: stats?.totalOfferings.toLocaleString() || '0',
            change: '+1',
            icon: LayoutDashboard,
            color: 'purple',
            path: '/academics/offerings'
        },
    ];

    const quickActions = [
        { label: 'Register Student', icon: UserPlus, path: '/people/students/add', color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Manage Timetable', icon: Calendar, path: '/academics/timetable', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Add Program', icon: PlusCircle, path: '/academics/offerings', color: 'bg-amber-50 text-amber-600' },
        { label: 'Post Notice', icon: Bell, path: '/communication/announcements', color: 'bg-rose-50 text-rose-600' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Greeting Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Hello, {user?.username || 'Admin'} 👋
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Session 2024-25 ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(action.path)}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group text-left"
                    >
                        <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 leading-tight">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(stat.path)}
                        className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden`}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl transition-colors ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' :
                                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                                    stat.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                                        'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                                }`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between relative z-10 text-[10px]">
                            <div className="flex items-center">
                                <span className="font-black text-emerald-500 flex items-center gap-0.5">
                                    <TrendingUp className="w-3 h-3" /> {stat.change}
                                </span>
                                <span className="text-slate-400 font-bold ml-1.5 uppercase tracking-tighter">vs last month</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        {/* Decorative background element */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl transition-colors ${stat.color === 'indigo' ? 'bg-indigo-50/30 group-hover:bg-indigo-100' :
                            stat.color === 'emerald' ? 'bg-emerald-50/30 group-hover:bg-emerald-100' :
                                stat.color === 'blue' ? 'bg-blue-50/30 group-hover:bg-blue-100' :
                                    'bg-purple-50/30 group-hover:bg-purple-100'
                            }`}></div>
                    </div>
                ))}
            </div>

            {/* Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardChart
                    title="Student Growth By Class"
                    data={offeringStats.map(s => ({ name: s.offeringName, value: s.count, id: s.offeringId }))}
                    colors={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981']}
                    onSegmentClick={(item) => navigate(`/people/students?offeringId=${item.id}`)}
                />
                <DashboardChart
                    title="Gender Distribution"
                    data={genderStats.map(s => ({ name: s.gender, value: s.count, id: s.gender }))}
                    colors={['#0ea5e9', '#d946ef', '#f59e0b', '#10b981']}
                    onSegmentClick={(item) => navigate(`/people/students?gender=${item.id}`)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Announcements Section - Occupies 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg"><Bell className="w-4 h-4 text-indigo-600" /></div>
                            ANNOUNCEMENTS
                        </h3>
                        <button
                            onClick={() => navigate('/communication/announcements')}
                            className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-6 space-y-4 flex-grow max-h-[450px] overflow-y-auto custom-scrollbar">
                        {announcements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <Bell className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">No Broadcasts Found</p>
                            </div>
                        ) : (
                            announcements.map((item) => (
                                <div key={item.id} className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 hover:border-indigo-100 transition-all group cursor-pointer relative">
                                    <div className="absolute top-5 right-5">
                                        <div className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${item.priority === 'URGENT' ? 'bg-rose-50 text-rose-600 border-rose-100/50' : 'bg-blue-50 text-blue-600 border-blue-100/50'
                                            }`}>
                                            {item.priority}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white shadow-sm border border-slate-50 rounded-xl h-fit">
                                            <div className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(item.createdAt!).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-lg font-black text-indigo-600 leading-none mt-1">{new Date(item.createdAt!).getDate()}</div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors uppercase text-sm">{item.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-3">{item.content}</p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                                                    <Clock className="w-3 h-3" /> {new Date(item.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                                                    <MapPin className="w-3 h-3" /> Campus Portal
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Status / Mini Logs */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Security & Status</h3>

                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight">Access Control</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">Multi-factor Enabled</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Activity Log</p>
                                {[
                                    { msg: 'System backup completed', time: '12m ago', icon: FileText },
                                    { msg: 'Global settings updated', time: '1h ago', icon: Settings },
                                    { msg: 'New teacher profile active', time: '3h ago', icon: Users },
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group/log">
                                        <div className="flex items-center gap-3">
                                            <log.icon className="w-3.5 h-3.5 text-slate-600 group-hover/log:text-indigo-400 transition-colors" />
                                            <span className="text-[11px] font-bold text-slate-300">{log.msg}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-600 uppercase italic">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                            System Health & Safety
                        </button>
                    </div>

                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;

import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, ArrowUpCircle, Users, GraduationCap, ChevronRight } from 'lucide-react';
import api from '../../../../utils/api';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { useNavigate } from 'react-router-dom';

interface SubscriptionData {
    planName: string;
    maxStudents: number;
    maxTeachers: number;
    status: string;
}

const SubscriptionStatusBanner: React.FC = () => {
    const [sub, setSub] = useState<SubscriptionData | null>(null);
    const [stats, setStats] = useState({ studentCount: 0, instructorCount: 0 });
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.tenantId) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [subRes, statsRes] = await Promise.all([
                api.get(`/ims-platform-service/api/v1/platform/tenant/${user?.tenantId}/subscription`),
                api.get(`/ims-platform-service/api/v1/platform/tenant/stats/${user?.tenantId}`)
            ]);
            setSub(subRes.data.apiData || subRes.data);
            setStats(statsRes.data.apiData || statsRes.data);
        } catch (error) {
            console.error("Failed to fetch subscription data", error);
        }
    };

    if (!sub) return null;

    const studentPercent = Math.min((stats.studentCount / sub.maxStudents) * 100, 100);
    const teacherPercent = Math.min((stats.instructorCount / sub.maxTeachers) * 100, 100);
    const isFree = sub.planName.toLowerCase().includes('free');

    return (
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 mb-8 text-white shadow-2xl shadow-indigo-100/20 group">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                {/* Plan Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-white tracking-tight">{sub.planName} Plan</h3>
                                {isFree && (
                                    <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded-full">
                                        Trial Mode
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 text-xs font-medium mt-0.5">Subscription active for your institution</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-6">
                        <div className="space-y-2 min-w-[160px]">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5" /> Students
                                </span>
                                <span className="text-white font-bold">{stats.studentCount} / {sub.maxStudents}</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${studentPercent > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${studentPercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 min-w-[160px]">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> Teachers
                                </span>
                                <span className="text-white font-bold">{stats.instructorCount} / {sub.maxTeachers}</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${teacherPercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${teacherPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => navigate('/billing/subscription')}
                        className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        Plan Details
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    <button 
                        onClick={() => navigate('/billing/subscription')} // Or trigger UpgradeModal
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group/btn"
                    >
                        <ArrowUpCircle className="w-4 h-4 group-hover/btn:translate-y--0.5 transition-transform" />
                        Upgrade Plan
                    </button>
                </div>
            </div>

            {/* Decorative Sparkles for High-End feel */}
            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-indigo-500/5 rotate-12" />
        </div>
    );
};

export default SubscriptionStatusBanner;

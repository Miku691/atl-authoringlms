import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Zap, 
    ArrowUpCircle, 
    Activity, 
    ChevronRight, 
    CheckCircle2, 
    CreditCard,
    Calendar,
    Users,
    GraduationCap,
    Download,
    Layout
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface SubscriptionData {
    planName: string;
    maxStudents: number;
    maxTeachers: number;
    maxStaff: number;
    maxGuardians: number;
    status: string;
    validUntil: string;
}

const SubscriptionBillingPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [sub, setSub] = useState<SubscriptionData | null>(null);
    const [stats, setStats] = useState({ studentCount: 0, instructorCount: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.tenantId) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, statsRes] = await Promise.all([
                api.get(`/ims-platform-service/api/v1/platform/tenant/${user?.tenantId}/subscription`),
                api.get(`/ims-platform-service/api/v1/platform/tenant/stats/${user?.tenantId}`)
            ]);
            setSub(subRes.data.apiData || subRes.data);
            setStats(statsRes.data.apiData || statsRes.data);
        } catch (error) {
            console.error("Failed to fetch billing data", error);
            toast.error("Could not load subscription details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!sub) return null;

    const usageCards = [
        { label: 'Students', current: stats.studentCount, max: sub.maxStudents, icon: GraduationCap, color: 'indigo' },
        { label: 'Teachers', current: stats.instructorCount, max: sub.maxTeachers, icon: Users, color: 'emerald' },
        { label: 'Staff Slots', current: 0, max: sub.maxStaff, icon: ShieldCheck, color: 'blue' },
        { label: 'Guardians', current: 0, max: sub.maxGuardians, icon: Activity, color: 'purple' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscription & Plan</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your institution's growth and billing</p>
                </div>
                <button 
                    onClick={() => navigate('/billing/upgrade')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                    <ArrowUpCircle className="w-5 h-5" />
                    Upgrade My Plan
                </button>
            </div>

            {/* Current Plan Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Plan Detail Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-50 rounded-[1.5rem]">
                                    <Zap className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{sub.planName}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Active Subscription</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renews On</p>
                                <p className="text-sm font-black text-slate-900">{new Date(sub.validUntil).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {usageCards.map((card, i) => {
                                const percent = Math.min((card.current / card.max) * 100, 100);
                                return (
                                    <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <card.icon className={`w-4 h-4 text-${card.color}-500`} />
                                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{card.label}</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{card.current} / {card.max}</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500' : `bg-${card.color}-500`}`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-tighter">
                                            {percent.toFixed(0)}% of your plan limit used
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            Plan Inclusions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            {[
                                "Advanced Student Information System", 
                                "Academic Result Management", 
                                "Automated Attendance Logs", 
                                "Public Landing Page Management", 
                                "Multi-role Access Control", 
                                "Staff & Instructor Records"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="p-1 bg-white/10 rounded-full">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Quick Stats sidebar */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-6">Payment Method</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-black tracking-tight">Razorpay Secure</p>
                                    <p className="text-xs font-medium text-indigo-100">Automatic Renewals Enabled</p>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-white text-indigo-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">
                                Manage Payments
                            </button>
                        </div>
                        <Layout className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 -rotate-12" />
                    </div>

                    {/* Branding / Info Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Need Assistance?</h3>
                        <div className="space-y-4">
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                Our support team is here to help you scale your institution. Contact us for custom enterprise quotes or onboarding assistance.
                            </p>
                            <button className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 transition-colors">
                                Talk to an Expert
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade logic moved to dedicated page */}
        </div>
    );
};

export default SubscriptionBillingPage;

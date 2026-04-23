import React from 'react';
import { Lock, ArrowUpCircle, ChevronRight, ShieldAlert, Users, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionLockedOverlayProps {
    planName: string;
    reason: 'STUDENT_LIMIT' | 'TEACHER_LIMIT' | 'EXPIRED' | 'OTHER';
    currentCount: number;
    maxLimit: number;
}

const SubscriptionLockedOverlay: React.FC<SubscriptionLockedOverlayProps> = ({ 
    planName, 
    reason, 
    currentCount, 
    maxLimit 
}) => {
    const navigate = useNavigate();

    const getReasonDetails = () => {
        switch (reason) {
            case 'STUDENT_LIMIT':
                return {
                    title: 'Student Limit Reached',
                    description: `Your ${planName} plan allows up to ${maxLimit} students. You currently have ${currentCount} students.`,
                    icon: GraduationCap,
                    color: 'rose'
                };
            case 'TEACHER_LIMIT':
                return {
                    title: 'Teacher Limit Reached',
                    description: `Your ${planName} plan allows up to ${maxLimit} teachers. You currently have ${currentCount} teachers.`,
                    icon: Users,
                    color: 'amber'
                };
            case 'EXPIRED':
                return {
                    title: 'Subscription Expired',
                    description: 'Your subscription has expired. Please renew to continue using the platform.',
                    icon: ShieldAlert,
                    color: 'rose'
                };
            default:
                return {
                    title: 'Subscription Locked',
                    description: 'Your current plan limits have been exceeded. Please upgrade to continue.',
                    icon: Lock,
                    color: 'indigo'
                };
        }
    };

    const details = getReasonDetails();
    const Icon = details.icon;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden border border-slate-100">
                {/* Decorative Gradients */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`p-6 bg-${details.color}-50 rounded-[2rem] mb-8 border border-${details.color}-100 shadow-xl shadow-${details.color}-500/10`}>
                        <Icon className={`w-12 h-12 text-${details.color}-600`} />
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">
                        {details.title}
                    </h2>
                    
                    <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10 max-w-md">
                        {details.description}
                        <br />
                        <span className="text-sm font-bold text-slate-400 mt-4 block uppercase tracking-widest italic">
                            Platform access is restricted until upgrade
                        </span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <button
                            onClick={() => navigate('/billing/upgrade')}
                            className="flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/30 group active:scale-95"
                        >
                            <ArrowUpCircle className="w-5 h-5" />
                            Upgrade to Pro
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button
                            onClick={() => navigate('/billing/subscription')}
                            className="flex items-center justify-center gap-3 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-3xl text-sm font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            View Plan Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionLockedOverlay;

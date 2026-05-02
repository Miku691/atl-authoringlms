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
        if (user?.tenantId) fetchData();
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
            console.error('Failed to fetch subscription data', error);
        }
    };

    if (!sub) return null;

    const studentPercent = Math.min((stats.studentCount / sub.maxStudents) * 100, 100);
    const teacherPercent = Math.min((stats.instructorCount / sub.maxTeachers) * 100, 100);
    const isFree = sub.planName.toLowerCase().includes('free');

    return (
        <div
            className="relative overflow-hidden rounded-2xl mb-6"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
        >
            {/* Brand left accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: 'var(--brand)' }} />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-7 py-5">

                {/* ── Plan info ── */}
                <div className="flex-1 pl-2">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-subtle)' }}>
                            <ShieldCheck style={{ color: 'var(--brand)', width: '18px', height: '18px' }} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                    {sub.planName} Plan
                                </h3>
                                {isFree && (
                                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(217,119,6,0.12)', color: '#D97706', border: '1px solid rgba(217,119,6,0.25)' }}>
                                        Trial Mode
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '1px' }}>
                                Subscription active for your institution
                            </p>
                        </div>
                    </div>

                    {/* Usage meters */}
                    <div className="flex flex-wrap gap-6">
                        <div className="space-y-1.5 min-w-[160px]">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    <GraduationCap style={{ width: '13px', height: '13px' }} /> Students
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {stats.studentCount} / {sub.maxStudents}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${studentPercent}%`, background: studentPercent > 90 ? '#DC2626' : 'var(--brand)' }} />
                            </div>
                        </div>

                        <div className="space-y-1.5 min-w-[160px]">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    <Users style={{ width: '13px', height: '13px' }} /> Teachers
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {stats.instructorCount} / {sub.maxTeachers}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${teacherPercent}%`, background: teacherPercent > 90 ? '#DC2626' : '#16A34A' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/billing/subscription')}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 transition-all"
                        style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-surface-2)', border: '1.5px solid var(--border)' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-subtle)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                        }}
                    >
                        Plan Details
                        <ChevronRight style={{ width: '14px', height: '14px', opacity: 0.6 }} />
                    </button>

                    <button
                        onClick={() => navigate('/billing/subscription')}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 transition-all"
                        style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#FFFFFF', background: 'var(--brand)', boxShadow: '0 4px 12px rgba(42,109,244,0.30)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)'}
                    >
                        <ArrowUpCircle style={{ width: '14px', height: '14px' }} />
                        Upgrade Plan
                    </button>
                </div>
            </div>
            <Sparkles className="absolute -top-3 right-6 w-16 h-16 pointer-events-none" style={{ color: 'var(--brand)', opacity: 0.05 }} />
        </div>
    );
};

export default SubscriptionStatusBanner;

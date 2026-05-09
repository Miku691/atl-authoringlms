import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Zap, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { getSidebarConfig } from '../../config/SidebarConfig';
import api from '../../utils/api';
import SidebarMenuItem from './SidebarMenuItem';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
    const { user } = useSelector((state: RootState) => state.auth);

    const [readiness, setReadiness] = useState<any>(null);
    const [hasActiveOfferings, setHasActiveOfferings] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [stats, setStats] = useState<any>({ studentCount: 0, instructorCount: 0 });

    const toggleSubMenu = (path: string) => {
        if (!isOpen) setIsOpen(true);
        setExpandedMenus(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    useEffect(() => {
        const fetchState = async () => {
            if (!user?.tenantId) return;
            try {
                const r = await api.get('/ims-academic-service/readiness/status');
                if (r.data?.status === 'SUCCESS') setReadiness(r.data.apiData);

                const a = await api.get(`/ims-academic-service/offerings/tenant/${user.tenantId}/has-active`);
                if (a.data?.status === 'SUCCESS') setHasActiveOfferings(a.data.apiData);

                if (user.roles.includes('TENANT_ADMIN')) {
                    const [sRes, statsRes] = await Promise.all([
                        api.get(`/ims-platform-service/api/v1/platform/tenant/${user.tenantId}/subscription`),
                        api.get(`/ims-platform-service/api/v1/platform/tenant/stats/${user.tenantId}`)
                    ]);
                    setSubscription(sRes.data.apiData || sRes.data);
                    setStats(statsRes.data.apiData || statsRes.data);
                }
            } catch (e) {
                console.error('Failed to sync sidebar state', e);
            }
        };
        fetchState();
    }, [user?.tenantId, user?.roles]);

    const rawMenuItems = useMemo(
        () => getSidebarConfig(user?.tenantType || readiness?.tenantType, { readiness, hasActiveOfferings }),
        [user?.tenantType, readiness, hasActiveOfferings]
    );

    const menuItems = useMemo(() => {
        if (!user) return [];
        const hasRole = (allowedRoles?: string[]) =>
            !allowedRoles || allowedRoles.some(role => user.roles.includes(role));

        const filterRecursive = (items: any[]): any[] =>
            items
                .filter(item => {
                    if (!hasRole(item.roles)) return false;
                    if (item.setupRequired && !user.tenantSetupCompleted && !item.condition) return false;
                    if (item.condition && !item.condition(user)) return false;
                    return true;
                })
                .map(item =>
                    item.subItems
                        ? { ...item, subItems: filterRecursive(item.subItems) }
                        : item
                )
                .filter(item => !(item.subItems && item.subItems.length === 0));

        return filterRecursive(rawMenuItems);
    }, [user, rawMenuItems]);

    const isSuperAdmin = user?.roles.includes('SUPER_ADMIN');
    const brandColor = isSuperAdmin ? '#E11D48' : 'var(--brand)';

    return (
        <aside
            className={`${isOpen ? 'w-72' : 'w-16'} h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-50 flex flex-col`}
            style={{
                background: 'var(--bg-chrome)',
                borderRight: '1px solid var(--border-chrome)',
                boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
            }}
        >
            {/* ── Logo ── */}
            <div
                className="h-16 flex items-center justify-between flex-shrink-0"
                style={{
                    padding: isOpen ? '0 14px 0 18px' : '0',
                    borderBottom: '1px solid var(--border-chrome)',
                    justifyContent: !isOpen ? 'center' : undefined,
                }}
            >
                <div className={`flex items-center gap-2.5 min-w-0 overflow-hidden ${!isOpen && 'justify-center'}`}>
                    <div
                        className="flex-shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center"
                        style={{
                            background: brandColor,
                            boxShadow: `0 2px 8px ${isSuperAdmin ? 'rgba(225,29,72,0.35)' : 'rgba(79,70,229,0.30)'}`,
                        }}
                    >
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    {isOpen && (
                        <div className="min-w-0">
                            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }} className="truncate">
                                {isSuperAdmin ? 'EduMatrix Platform' : 'EduMatrix'}
                            </p>
                            <p style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.02em', lineHeight: 1.2, marginTop: '2px' }} className="truncate">
                                {isSuperAdmin ? 'Super Admin Console' : 'Institute Management'}
                            </p>
                        </div>
                    )}
                </div>

                {isOpen && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all"
                        style={{ color: 'var(--text-muted)', background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                        title="Collapse"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* ── Expand button when collapsed ── */}
            {!isOpen && (
                <div className="flex justify-center py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-chrome)' }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: 'var(--text-muted)', background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                        title="Expand"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* ── Navigation ── */}
            <nav
                className="flex-1 overflow-y-auto custom-scrollbar"
                style={{ padding: isOpen ? '10px 10px' : '10px 6px' }}
            >
                {menuItems.map(item => (
                    <SidebarMenuItem
                        key={item.path}
                        item={item}
                        isOpen={isOpen}
                        expandedMenus={expandedMenus}
                        toggleSubMenu={toggleSubMenu}
                        location={location.pathname}
                        depth={0}
                    />
                ))}
            </nav>

            {/* ── Footer: Subscription ── */}
            {user?.roles.includes('TENANT_ADMIN') && subscription && (
                <div
                    className="flex-shrink-0"
                    style={{ padding: isOpen ? '10px 10px' : '10px 6px', borderTop: '1px solid var(--border-chrome)' }}
                >
                    {isOpen ? (
                        <div className="rounded-xl p-3" style={{ background: 'var(--brand-subtle)', border: '1px solid var(--brand-border)' }}>
                            <div className="flex items-center justify-between mb-1">
                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Current Plan
                                </span>
                                <Zap className="w-3 h-3" style={{ color: 'var(--brand)' }} />
                            </div>
                            <div className="flex items-baseline justify-between mb-2.5">
                                <h4 className="truncate mr-2" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {subscription.planName}
                                </h4>
                                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    {stats.studentCount} / {subscription.maxStudents}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/billing/upgrade')}
                                className="w-full rounded-lg flex items-center justify-center gap-1.5 transition-all"
                                style={{ padding: '6px 12px', background: 'var(--brand)', color: '#fff', fontSize: '11px', fontWeight: 700, boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}
                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)'}
                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)'}
                            >
                                <CreditCard className="w-3 h-3" />
                                Upgrade / Manage
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/billing/upgrade')}
                            className="w-full flex items-center justify-center rounded-xl transition-all"
                            style={{ padding: '10px', background: 'var(--brand-subtle)', border: '1px solid var(--brand-border)' }}
                            title="Upgrade / Manage Plan"
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                        >
                            <Zap className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                        </button>
                    )}
                </div>
            )}
        </aside>
    );
};

export default Sidebar;

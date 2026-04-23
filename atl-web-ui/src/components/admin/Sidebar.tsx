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
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['/admin/users']);
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

    // Fetch Operational State
    useEffect(() => {
        const fetchState = async () => {
            if (!user?.tenantId) return;
            try {
                // Readiness
                const r = await api.get('/ims-academic-service/readiness/status');
                if (r.data?.status === 'SUCCESS') {
                    setReadiness(r.data.apiData);
                }

                // Active Offerings
                const a = await api.get(`/ims-academic-service/offerings/tenant/${user.tenantId}/has-active`);
                if (a.data?.status === 'SUCCESS') {
                    setHasActiveOfferings(a.data.apiData);
                }

                // Subscription & Stats
                if (user.roles.includes('TENANT_ADMIN')) {
                    const [sRes, statsRes] = await Promise.all([
                        api.get(`/ims-platform-service/api/v1/platform/tenant/${user.tenantId}/subscription`),
                        api.get(`/ims-platform-service/api/v1/platform/tenant/stats/${user.tenantId}`)
                    ]);
                    setSubscription(sRes.data.apiData || sRes.data);
                    setStats(statsRes.data.apiData || statsRes.data);
                }
            } catch (e) {
                console.error("Failed to sync sidebar state", e);
            }
        };
        fetchState();
    }, [user?.tenantId, user?.roles]);

    // Import config
    const rawMenuItems = useMemo(() => {
        return getSidebarConfig(user?.tenantType, { readiness, hasActiveOfferings });
    }, [user?.tenantType, readiness, hasActiveOfferings]);

    // Filtering Logic
    const menuItems = useMemo(() => {
        if (!user) return [];

        const hasRole = (allowedRoles?: string[]) => {
            if (!allowedRoles) return true; // Public
            return allowedRoles.some(role => user.roles.includes(role));
        };

        const filterRecursive = (items: any[]): any[] => {
            return items
                .filter(item => {
                    // 1. Role Check
                    if (!hasRole(item.roles)) return false;

                    // 2. Setup Check (Skip if condition explicitly allows)
                    if (item.setupRequired && !user.tenantSetupCompleted && !item.condition) return false;

                    // 3. Custom Condition
                    if (item.condition && !item.condition(user)) return false;

                    return true;
                })
                .map(item => {
                    if (item.subItems) {
                        return { ...item, subItems: filterRecursive(item.subItems) };
                    }
                    return item;
                })
                .filter(item => {
                    // Remove parents with empty submenus
                    if (item.subItems && item.subItems.length === 0) return false;
                    return true;
                });
        };

        return filterRecursive(rawMenuItems);
    }, [user, rawMenuItems]);

    return (
        <aside
            className={`${isOpen ? 'w-64' : 'w-20'
                } bg-slate-900 h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xl`}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center justify-between px-4 bg-slate-950/50 backdrop-blur-sm border-b border-slate-800">
                <div className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'justify-center w-full'}`}>
                    <div className={`${user?.roles.includes('SUPER_ADMIN') ? 'bg-rose-600' : 'bg-primary'} p-2 rounded-lg flex-shrink-0 transition-colors`}>
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    {isOpen && (
                        <span className="text-white font-bold text-lg tracking-wide whitespace-nowrap italic">
                            {user?.roles.includes('SUPER_ADMIN') ? 'EduMatrix Platform' : 'EduMatrix'}
                        </span>
                    )}
                </div>
                {isOpen && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Toggle Button for Collapsed State */}
            {!isOpen && (
                <div className="flex justify-center py-4 border-b border-slate-800">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}


            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                {menuItems.map((item) => (
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

            {/* Footer Section - Subscription Plan or Empty space */}
            {user?.roles.includes('TENANT_ADMIN') && subscription && (
                <div className={`px-4 py-2 border-t border-slate-800 bg-slate-950/30 ${!isOpen && 'flex justify-center'}`}>
                    {isOpen ? (
                        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-900/10">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Current Plan</span>
                                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="flex items-baseline justify-between mb-2">
                                <h4 className="text-sm font-bold text-white truncate mr-2">{subscription.planName}</h4>
                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                    {stats.studentCount} / {subscription.maxStudents}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/billing/upgrade')}
                                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-900/20"
                            >
                                <CreditCard className="w-3 h-3" />
                                Upgrade / Manage
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/billing/upgrade')}
                            className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-lg"
                            title="Upgrade / Manage Plan"
                        >
                            <Zap className="w-5 h-5 fill-indigo-400" />
                        </button>
                    )}
                </div>
            )}
        </aside>
    );
};

export default Sidebar;

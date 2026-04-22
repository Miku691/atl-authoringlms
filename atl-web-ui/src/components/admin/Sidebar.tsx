import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    LogOut
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import type { RootState } from '../../store/store';
import { getSidebarConfig } from '../../config/SidebarConfig';
import api from '../../utils/api';
import SidebarMenuItem from './SidebarMenuItem';
import UpgradePlanModal from '../common/UpgradePlanModal';
import { CreditCard, Zap } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['/admin/users']);
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleSubMenu = (path: string) => {
        if (!isOpen) setIsOpen(true);
        setExpandedMenus(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    const [readiness, setReadiness] = useState<any>(null);
    const [hasActiveOfferings, setHasActiveOfferings] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // Fetch Operational State
    React.useEffect(() => {
        if (!user?.tenantId) return;

        const fetchState = async () => {
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

                // Subscription Status
                if (user.roles.includes('TENANT_ADMIN')) {
                    const s = await api.get(`/ims-platform-service/api/v1/platform/tenant/${user.tenantId}/subscription`);
                    setSubscription(s.data.apiData || s.data);
                }
            } catch (e) {
                console.error("Failed to sync sidebar state", e);
                // Fail graceful - assume accessible if error? Or block?
                // Logic rule says "Visible ONLY if...", so default should be false (which is initial state)
            }
        };
        fetchState();
    }, [user?.tenantId, user?.roles]);

    // Import config
    const rawMenuItems = React.useMemo(() => {
        return getSidebarConfig(user?.tenantType, { readiness, hasActiveOfferings });
    }, [user?.tenantType, readiness, hasActiveOfferings]);

    // Filtering Logic
    const menuItems = React.useMemo(() => {
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

            {/* User Profile Mini - Only shown when expanded */}
            {isOpen && (
                <div className="px-4 py-6 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 font-semibold text-lg">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="text-sm font-medium text-white truncate">{user?.username}</h3>
                            <p className="text-xs text-slate-400 truncate">
                                {user?.roles?.[0]?.replace('_', ' ') || 'User'}
                            </p>
                        </div>
                    </div>
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

            {/* Subscription Plan Card */}
            {isOpen && user?.roles.includes('TENANT_ADMIN') && subscription && (
                <div className="mx-4 mb-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Current Plan</span>
                        <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{subscription.planName}</h4>
                    <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">Students:</span>
                            <span className="text-slate-200 font-medium">{subscription.maxStudents}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-900/20"
                    >
                        <CreditCard className="w-3 h-3" />
                        Upgrade / Manage
                    </button>
                </div>
            )}

            {/* Logout Section */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-all duration-200 group ${!isOpen && 'justify-center'}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0 group-hover:stroke-red-400" />
                    {isOpen && <span className="font-medium text-sm">Sign Out</span>}
                </button>
            </div>

            {isUpgradeModalOpen && (
                <UpgradePlanModal 
                    isOpen={isUpgradeModalOpen} 
                    onClose={() => setIsUpgradeModalOpen(false)} 
                    currentPlanId={subscription?.planId}
                />
            )}
        </aside>
    );
};

export default Sidebar;

import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { type RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import api from '../../utils/api';
import {
    Bell, Search, Menu, HelpCircle, ChevronRight, Globe,
    Settings, LogOut, User, Shield, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { isDark, toggleTheme } = useTheme();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Get breadcrumbs from URL
    const breadcrumbPaths = location.pathname.split('/').filter(p => p && !isUUID(p));

    const breadcrumbs = breadcrumbPaths.map((p, i) => {
        const label = p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');
        // We need to construct the actual path including potential UUIDs for the Link to work correctly
        // But the user said "only upto student enough", implying they don't want to go back to the specific student ID
        // if they are on a sub-page of a student. However, typically breadcrumbs should lead to valid pages.
        // If the path is /people/students/UUID, the breadcrumb "Students" should go to /people/students.

        // Let's find the original path parts to map labels back to correct indices
        const originalPathParts = location.pathname.split('/').filter(p => p);
        const partIndex = originalPathParts.indexOf(p);
        const actualPath = '/' + originalPathParts.slice(0, partIndex + 1).join('/');

        const isLast = i === breadcrumbPaths.length - 1;
        return { label, path: actualPath, isLast };
    });

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await api.post('/atl-auth-service/auth/logout', { refreshToken });
            } catch (err) {
                console.error("Logout failed at backend", err);
            }
        }
        dispatch(logout());
        navigate('/login');
    };

    const initials = user?.username ?
        user.username.substring(0, 2).toUpperCase() : 'AD';

    return (
        <header className={`h-16 fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'left-72' : 'left-16'}`} style={{ background: 'var(--bg-chrome)', borderBottom: '1px solid var(--border-chrome)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="h-full px-6 flex items-center justify-between">

                {/* Left Section: Breadcrumbs (SPA Enabled) */}
                <div className="flex items-center gap-3 min-w-0 mr-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-xl transition-all active:scale-90 flex-shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <nav
                        className="hidden lg:flex items-center text-sm overflow-hidden"
                        aria-label="Breadcrumb"
                        title={`${breadcrumbPaths[0] !== 'dashboard' ? 'DASHBOARD > ' : ''}${breadcrumbs.map(bc => bc.label).join(' > ')}`}
                    >
                        <ol className="flex items-center">
                            {/* Always show Dashboard if not on it */}
                            {breadcrumbPaths[0] !== 'dashboard' && (
                                <li className="flex items-center">
                                    <Link to="/dashboard" className="text-content-secondary font-bold hover:text-indigo-600 transition-colors uppercase tracking-tight text-[11px] whitespace-nowrap">DASHBOARD</Link>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1 flex-shrink-0" />
                                </li>
                            )}
                            {breadcrumbs.map((bc, i) => (
                                <li key={i} className="flex items-center min-w-0">
                                    <Link
                                        to={bc.path}
                                        className={`${bc.isLast ? 'text-indigo-600 font-black cursor-default pointer-events-none' : 'text-content-secondary font-bold hover:text-indigo-500'} transition-colors uppercase tracking-tight text-[11px] whitespace-nowrap ${bc.isLast ? 'truncate' : ''}`}
                                    >
                                        {bc.label}
                                    </Link>
                                    {!bc.isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1 flex-shrink-0" />}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>

                {/* Right Section: Actions & Profile Dropdown */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    {/* Search Bar - Aesthetic Only for now */}
                    <div className="hidden lg:flex items-center rounded-xl px-4 py-2 border transition-all w-48 xl:w-64" style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}>
                        <Search className="w-4 h-4 mr-3" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-transparent border-none outline-none text-[13px] w-full font-medium"
                            style={{ color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle theme"
                        >
                            {isDark
                                ? <Sun className="w-4 h-4" />
                                : <Moon className="w-4 h-4" />
                            }
                        </button>

                        <button
                            onClick={() => toast.success("Language selector available soon!")}
                            className="p-2 rounded-xl transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            title="Language"
                        >
                            <Globe className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate('/setup')}
                            className="p-2 rounded-xl transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toast("Contacting Help Center...", { icon: 'ℹ️' })}
                            className="p-2 rounded-xl transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            title="Help Center"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>

                        <div className="h-6 w-px mx-2 hidden sm:block" style={{ background: 'var(--border)' }}></div>

                        <button className="relative p-2 rounded-2xl transition-all" style={{ color: 'var(--text-secondary)' }}>
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2" style={{ borderColor: 'var(--bg-chrome)' }}></span>
                        </button>

                        {/* User Role Clip Badge */}
                        <div className="flex items-center gap-3 ml-1.5">
                            {user?.roles?.[0] && (
                                <div className={`hidden md:flex items-center px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap transition-all ${user.roles[0].includes('SUPER_ADMIN') ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' :
                                        user.roles[0].includes('ADMIN') ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                                            user.roles[0].includes('INSTRUCTOR') ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                user.roles[0].includes('STUDENT') ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                    user.roles[0].includes('GUARDIAN') || user.roles[0].includes('PARENT') ? 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400' :
                                                        'bg-chrome border-border text-content-secondary'
                                    }`}>
                                    {user.roles[0].replace('_', ' ')}
                                </div>
                            )}

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center border-2 border-white overflow-hidden active:scale-95 shadow-sm"
                                >
                                    <span className="font-black text-white text-xs tracking-tighter">
                                        {initials}
                                    </span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-surface rounded-[2rem] border border-border shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="px-6 py-5 border-b border-border bg-chrome/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-content-primary truncate">{user?.username}</p>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${user?.roles?.[0]?.includes('SUPER_ADMIN') ? 'text-rose-500' :
                                                            user?.roles?.[0]?.includes('ADMIN') ? 'text-indigo-500' :
                                                                user?.roles?.[0]?.includes('INSTRUCTOR') ? 'text-amber-500' :
                                                                    user?.roles?.[0]?.includes('STUDENT') ? 'text-emerald-500' :
                                                                        user?.roles?.[0]?.includes('GUARDIAN') || user?.roles?.[0]?.includes('PARENT') ? 'text-violet-500' :
                                                                            'text-content-secondary'
                                                        }`}>
                                                        {user?.roles?.[0]?.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-content-secondary hover:bg-indigo-500/10 hover:text-indigo-600 rounded-2xl transition-all">
                                                <User className="w-4 h-4" /> My Profile
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold text-content-secondary hover:bg-indigo-500/10 hover:text-indigo-600 rounded-2xl transition-all">
                                                <Shield className="w-4 h-4" /> Security Settings
                                            </button>

                                            <div className="h-px bg-chrome my-2 mx-4"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-black text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                                            >
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

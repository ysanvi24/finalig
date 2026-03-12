import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Calendar, Radio, Star, Trophy, Target, Settings, Users, GraduationCap, BookOpen, LogOut, Menu, X, Sparkles, Award, GitBranch } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Footer from './Footer';

const AdminLayout = ({ secretPath }) => {
    const basePath = secretPath ? `/${secretPath}` : '/admin';
    const loginPath = secretPath ? `/${secretPath}/login` : '/auth/login';
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');
            const userStr = localStorage.getItem('adminUser');
            
            if (!token) {
                navigate(loginPath, { replace: true });
                return;
            }
            
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.role === 'viewer' && !user.isTrusted) {
                        toast.error('Access denied. Only admins can access this area.');
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        localStorage.removeItem('sessionFingerprint');
                        localStorage.removeItem('sessionStart');
                        navigate(loginPath, { replace: true });
                        return;
                    }
                    setCurrentUser(user);
                } catch (e) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('sessionFingerprint');
                    localStorage.removeItem('sessionStart');
                    navigate(loginPath, { replace: true });
                }
            }
        };
        checkAuth();
    }, [navigate, loginPath]);

    const navItems = [
        { name: 'Dashboard', path: `${basePath}/dashboard`, icon: LayoutDashboard },
        { name: 'Departments', path: `${basePath}/departments`, icon: Building2 },
        { name: 'Schedule Match', path: `${basePath}/schedule`, icon: Calendar },
        { name: 'Live Console', path: `${basePath}/live`, icon: Radio },
        { name: 'Highlights', path: `${basePath}/highlights`, icon: Sparkles },
        { name: 'Events', path: `${basePath}/events`, icon: Award },
        { name: 'Award Points', path: `${basePath}/points`, icon: Star },
        { name: 'Leaderboard', path: `${basePath}/leaderboard`, icon: Trophy },
        { name: 'Seasons', path: `${basePath}/seasons`, icon: Target },
        { name: 'Scoring Table', path: `${basePath}/scoring-presets`, icon: Settings },
        { name: 'Bracket Manager', path: `${basePath}/bracket-manager`, icon: GitBranch },
        { name: 'Admin Users', path: `${basePath}/users`, icon: Users },
        { name: 'Student Council', path: `${basePath}/student-council`, icon: GraduationCap },
        { name: 'About IG', path: `${basePath}/about`, icon: BookOpen }
    ];

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('sessionFingerprint');
            localStorage.removeItem('sessionStart');
            navigate(loginPath, { replace: true });
            toast.success('Logged out successfully');
        }
    };

    return (
        <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-[var(--color-accent)]">
                            शाश्वतम् Admin
                        </h1>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">IG '26 Dashboard</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-[var(--border-color)]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[var(--bg-primary)] w-full shashwatam-bg">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="text-base font-semibold text-[var(--color-accent)]">शाश्वतम् Admin</h2>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
                <Footer />
            </main>
        </div>
    );
};

export default AdminLayout;

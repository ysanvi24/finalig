import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Trophy, BookOpen, GraduationCap, Menu, X, Sparkles } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';

const PublicNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Live', path: '/', icon: Radio },
        { label: 'Events', path: '/events', icon: Sparkles },
        { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { label: 'About', path: '/about', icon: BookOpen },
        { label: 'Council', path: '/student-council', icon: GraduationCap }
    ];

    return (
        <nav
            className="sticky top-0 z-50 backdrop-blur-md shadow-lg"
            style={{
                backgroundColor: theme.navBg,
                borderBottom: `1px solid ${theme.borderDefault}`,
            }}
        >
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/')}
                        className="cursor-pointer flex items-center gap-2.5"
                    >
                        <img
                            src="/vnit_logo.svg"
                            alt="VNIT Logo"
                            className="w-10 h-10 rounded-full object-contain"
                            style={{ boxShadow: `0 0 0 2px ${theme.borderDefault}` }}
                        />
                        <div className="leading-tight">
                            <h1
                                className="text-base sm:text-lg font-bold tracking-tight"
                                style={{ color: theme.textPrimary }}
                            >
                                शाश्वतम् <span style={{ color: theme.accent }}>'26</span>
                            </h1>
                            <p
                                className="text-[10px] font-medium tracking-wide hidden sm:block"
                                style={{ color: theme.textMuted }}
                            >
                                IG • VNIT NAGPUR
                            </p>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <motion.button
                                    key={item.path}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(item.path)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    style={{
                                        backgroundColor: active ? theme.accent : 'transparent',
                                        color: active ? (theme.key === 'light' ? '#fff' : theme.bgPrimary) : theme.textSecondary,
                                        boxShadow: active ? `0 2px 8px ${theme.accentSubtle}` : 'none',
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </motion.button>
                            );
                        })}
                        <div className="ml-2">
                            <ThemeSwitcher compact />
                        </div>
                    </div>

                    {/* Mobile: Theme + Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeSwitcher compact />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: theme.textSecondary }}
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden"
                            style={{ borderTop: `1px solid ${theme.borderDefault}` }}
                        >
                            <div className="py-3 space-y-1">
                                {navItems.map((item, idx) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <motion.button
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => { navigate(item.path); setIsOpen(false); }}
                                            className="w-full px-4 py-3 rounded-lg text-left font-medium transition-colors flex items-center gap-3"
                                            style={{
                                                backgroundColor: active ? theme.accent : 'transparent',
                                                color: active ? (theme.key === 'light' ? '#fff' : theme.bgPrimary) : theme.textSecondary,
                                            }}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default PublicNavbar;

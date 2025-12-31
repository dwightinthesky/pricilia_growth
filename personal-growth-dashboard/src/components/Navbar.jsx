import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Globe, User, LogOut, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageModal from './LanguageModal';

const Navbar = ({ onMenuClick }) => {
    const location = useLocation();
    const { t } = useTranslation();
    const { logout, currentUser } = useAuth();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Helper for breadcrumbs mapping
    const getPageTitle = (path) => {
        switch (path) {
            case '/': return 'Overview';
            case '/schedule': return 'Schedule';
            case '/extra-up': return 'Goals';
            case '/chores': return 'Chores';
            case '/finance': return 'Finance';
            case '/billing': return 'Billing';
            case '/settings': return 'Settings';
            default: return 'Dashboard';
        }
    };

    return (
        <>
            <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

            {/* Backdrop for User Menu */}
            {isUserMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
            )}

            <header className="fixed top-0 right-0 left-0 md:left-[240px] h-16 z-40 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 transition-all duration-300">

                <div className="md:hidden">
                    <button onClick={onMenuClick} className="text-slate-500 dark:text-white">
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex items-center md:hidden">
                    <span className="font-serif font-black text-xl tracking-tighter text-slate-900 dark:text-white flex items-start select-none">
                        Pricilia(Growth)
                    </span>
                </div>

                {/* Breadcrumb / Page Title */}
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500 dark:text-neutral-400">Dashboard</span>
                    <span className="text-slate-300 dark:text-neutral-600">/</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {getPageTitle(location.pathname)}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search (Visual) */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                        <Search size={14} />
                        <span className="font-semibold">Search</span>
                        <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 font-mono text-[10px]">⌘K</kbd>
                    </div>

                    <button
                        onClick={() => setIsLangOpen(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"
                        title="Change Language"
                    >
                        <Globe size={18} />
                    </button>

                    {/* Avatar Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                {currentUser?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <ChevronDown size={14} className="text-slate-400" />
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                                    <div className="text-xs font-semibold text-slate-400">Signed in as</div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser?.email}</div>
                                </div>

                                <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <User size={16} /> Profile
                                </Link>
                                <Link to="/billing" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <CreditCard size={16} /> Billing
                                </Link>
                                <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <Settings size={16} /> Settings
                                </Link>

                                <div className="my-1 border-t border-slate-100 dark:border-white/5"></div>

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;

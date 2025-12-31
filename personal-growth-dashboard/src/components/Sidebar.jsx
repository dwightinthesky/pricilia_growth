import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Target, Home, Bot, CreditCard, Settings, LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, onHowieClick }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { logout } = useAuth();

    const coreItems = [
        { icon: LayoutDashboard, label: t('nav.overview'), path: '/' },
        { icon: Calendar, label: t('nav.schedules'), path: '/schedule' },
        { icon: Target, label: t('nav.goals'), path: '/extra-up' },
        { icon: CreditCard, label: "Finance", path: '/finance' },
        { icon: Home, label: t('nav.chores'), path: '/chores' },
    ];

    const accountItems = [
        { icon: Settings, label: t('common.settings'), path: '/settings' },
        { icon: CreditCard, label: "Billing", path: '/billing' },
    ];

    const NavItem = ({ item }) => {
        const isActive = location.pathname === item.path;
        return (
            <Link
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`
                    group flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all
                    ${isActive
                        ? 'border-l-2 border-slate-900 text-slate-900 dark:border-white dark:text-white'
                        : 'border-l-2 border-transparent text-slate-500 hover:text-slate-900 dark:text-neutral-500 dark:hover:text-white'}
                `}
            >
                <item.icon
                    size={16}
                    className={`transition-colors ${isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 group-hover:text-slate-900 dark:text-neutral-600 dark:group-hover:text-white'}`}
                />
                {item.label}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                w-[240px] h-screen bg-white border-r border-slate-100 flex flex-col py-6
                fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out
                dark:bg-[#0f0f0f] dark:border-white/5
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:flex
            `}>
                {/* Header */}
                <div className="px-6 mb-10 flex items-center justify-between">
                    <span className="font-serif font-black text-xl tracking-tighter text-slate-900 dark:text-white select-none">
                        Pricilia
                        <span className="text-slate-400 font-sans font-normal mx-0.5">/</span>
                        Growth
                    </span>
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Sections */}
                <div className="flex-1 space-y-8 overflow-y-auto px-0">

                    {/* CORE */}
                    <div>
                        <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Core
                        </div>
                        <nav className="space-y-0.5">
                            {coreItems.map((item) => (
                                <NavItem key={item.path} item={item} />
                            ))}
                        </nav>
                    </div>

                    {/* ACCOUNT */}
                    <div>
                        <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Account
                        </div>
                        <nav className="space-y-0.5">
                            {accountItems.map((item) => (
                                <NavItem key={item.path} item={item} />
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Plan Badge (Bottom) */}
                <div className="px-6 pb-4 mt-auto">
                    <Link to="/billing" className="block p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5 group transition-all hover:bg-slate-100 dark:hover:bg-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Plan</div>
                                <div className="font-black text-slate-900 dark:text-white">PLUS Plan</div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold">UP</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Footer Actions */}
                <div className="px-6 pt-2 pb-6 space-y-2">
                    {/* Howie Button */}
                    <button
                        onClick={() => {
                            if (onClose) onClose();
                            if (onHowieClick) onHowieClick();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10 transition-all text-sm font-semibold group"
                    >
                        <Bot size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <span>Ask Howie</span>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-sm font-medium"
                    >
                        <LogOut size={16} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

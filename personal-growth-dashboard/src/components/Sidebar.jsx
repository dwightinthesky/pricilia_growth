import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Target, Home, Bot, X, Settings } from 'lucide-react';
import HowieModal from './HowieModal';
import { useTranslation } from 'react-i18next'; // 🔥 Fix: Import i18n

const Sidebar = ({ isOpen, onClose }) => {
    const { t } = useTranslation(); // 🔥 Fix: Initialize t
    const location = useLocation();
    const [isHowieOpen, setIsHowieOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: t('sidebar.overview'), path: '/' },
        { icon: Calendar, label: t('sidebar.schedules'), path: '/schedule' },
        { icon: Target, label: t('sidebar.extra_up'), path: '/extra-up' },
        { icon: Home, label: t('sidebar.chores'), path: '/chores' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                w-64 h-screen bg-[#0f0f0f] border-r border-white/5 flex flex-col p-6
                fixed left-0 top-0 z-50 text-left transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:flex
            `}>
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-xl tracking-tighter text-white select-none">
                            Pricilia(Growth)
                            <span className="text-[10px] font-sans font-bold ml-1 text-[#f4f46a] align-top">™</span>
                        </span>
                    </div>
                    {/* Close Button on Mobile */}
                    <button onClick={onClose} className="md:hidden text-neutral-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="space-y-8">
                    <div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 px-3">
                            {t('common.platform')}
                        </div>
                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => onClose && onClose()}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-neutral-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon size={16} className={`transition-colors ${isActive ? 'text-[#f4f46a]' : 'text-neutral-500 group-hover:text-white'}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 px-3">
                            {t('common.preference')}
                        </div>
                        <nav className="space-y-1">
                            <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                                <Settings size={16} />
                                {t('common.settings')}
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Howie Entry Point */}
                <div className="mt-auto">
                    <button
                        onClick={() => setIsHowieOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 text-white shadow-lg group hover:border-[#f4f46a]/50 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#f4f46a] flex items-center justify-center text-black">
                            <Bot size={18} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-[#f4f46a] uppercase tracking-widest">{t('common.assistant')}</div>
                            <div className="text-sm font-bold group-hover:text-white/90">{t('common.ask_howie')}</div>
                        </div>
                    </button>
                </div>
            </div>

            <HowieModal isOpen={isHowieOpen} onClose={() => setIsHowieOpen(false)} />
        </>
    );
};

export default Sidebar;

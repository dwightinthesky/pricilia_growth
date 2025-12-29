import React, { useState } from 'react'; // 引入 useState
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Target, Home, Sparkles, Menu } from 'lucide-react'; // Added Menu
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // 引入翻譯 Hook
import LanguageModal from './LanguageModal'; // 🔥 引入彈窗組件

const Navbar = ({ onMenuClick }) => {
    const location = useLocation();
    const { t } = useTranslation(); // 使用翻譯功能
    const { logout } = useAuth();
    const [isLangOpen, setIsLangOpen] = useState(false); // 🔥 控制彈窗狀態

    const menuItems = [
        { icon: LayoutDashboard, label: t('nav.overview'), path: '/' }, // 使用 t()
        { icon: Calendar, label: t('nav.schedules'), path: '/schedule' },
        { icon: Target, label: t('nav.goals'), path: '/extra-up' },
        { icon: Home, label: t('nav.chores'), path: '/chores' },
    ];

    return (
        <>
            {/* 🔥 放入 LanguageModal */}
            <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

            <header className="fixed top-0 right-0 left-0 md:left-64 h-16 z-40 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 transition-all duration-300">

                {/* Mobile Menu Button - Keeping consistent with original layout */}
                <div className="md:hidden">
                    <button onClick={onMenuClick} className="text-white">
                        <Menu size={20} />
                    </button>
                </div>

                {/* Logo (Optional in Dashboard if Sidebar exists, but code has it) */}
                <div className="flex items-center md:hidden">
                    {/* Mobile only logo? The code says `flex items-center`. */}
                    <span className="font-serif font-black text-xl tracking-tighter text-white flex items-start select-none">
                        Pricilia(Growth)
                        <span className="text-[10px] font-sans font-bold ml-1 text-[#f4f46a]">™</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-full border border-white/10 mx-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const baseClass = "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300";
                        const activeClass = "bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
                        const inactiveClass = "text-white/70 hover:text-white hover:bg-white/5";

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                            >
                                <item.icon size={14} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">

                    {/* 🔥 語言切換按鈕 */}
                    <button
                        onClick={() => setIsLangOpen(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-lg"
                        title="Change Language"
                    >
                        🌍
                    </button>

                    <button
                        onClick={logout}
                        className="text-xs font-bold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest hidden md:block"
                    >
                        {t('logout')}
                    </button>



                    <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                        <kbd className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700 font-mono text-[10px]">⌘K</kbd>
                        <span className="font-semibold">Search</span>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;

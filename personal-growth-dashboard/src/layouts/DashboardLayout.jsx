import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import { useAuth } from '../context/AuthContext';
import { useHowieAI } from '../hooks/useHowieAI';
import HowieAIPanel from '../components/HowieAI/HowieAIPanel';
import HowieAIButton from '../components/HowieAI/HowieAIButton';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser: user } = useAuth();
    const howie = useHowieAI(user);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0f0f0f] dark:text-white selection:bg-[#f4f46a] selection:text-black font-sans">
            {/* Top Navbar */}
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} onOpenHowie={howie.toggle} />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onOpenHowie={howie.toggle}
            />

            {/* Main Content Area */}
            <main className="md:pl-64 pt-16 min-h-screen transition-all duration-300">
                <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>

            {/* HowieAI */}
            <HowieAIButton onClick={howie.toggle} />
            <HowieAIPanel
                isOpen={howie.isOpen}
                onClose={howie.close}
                controller={howie}
            />
        </div>
    );
};

export default DashboardLayout;

import React, { useState, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import { useAuth } from '../context/AuthContext';
import { useHowieAI } from '../hooks/useHowieAI';
import HowieAIPanel from '../components/HowieAI/HowieAIPanel';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser: user } = useAuth();
    const howie = useHowieAI(user);
    const [params, setParams] = useSearchParams();

    // Checkout Toast Logic
    useEffect(() => {
        const s = params.get("checkout");
        if (s === "success") {
            toast.success("Unlocked Plus Plan!");
            // Clean up URL
            const newParams = new URLSearchParams(params);
            newParams.delete("checkout");
            newParams.delete("session_id");
            setParams(newParams, { replace: true });
        }
        if (s === "cancel") {
            toast("Checkout canceled");
            const newParams = new URLSearchParams(params);
            newParams.delete("checkout");
            setParams(newParams, { replace: true });
        }
    }, [params, setParams]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0f0f0f] dark:text-white selection:bg-[#f4f46a] selection:text-black font-sans">
            <Toaster position="top-center" richColors />
            {/* Top Navbar */}
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} onOpenHowie={howie.toggle} />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onHowieClick={howie.toggle}
            />

            {/* Main Content Area */}
            <main className="md:pl-64 pt-16 min-h-screen transition-all duration-300">
                <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>

            <HowieAIPanel
                isOpen={howie.isOpen}
                onClose={howie.close}
                controller={howie}
            />
        </div>
    );
};

export default DashboardLayout;

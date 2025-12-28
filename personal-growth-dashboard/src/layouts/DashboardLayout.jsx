import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#f4f46a] selection:text-black font-sans">
            {/* Top Navbar */}
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="md:pl-64 pt-16 min-h-screen transition-all duration-300">
                <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

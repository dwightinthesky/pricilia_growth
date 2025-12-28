import React, { useState } from 'react';
import {
    Play, Zap, Shield, Clock, MousePointer2, Menu,
    Database, TrendingUp, Sparkles, Calendar, CheckCircle2,
    ArrowRight, Globe, CreditCard, ListTodo, Layout, Settings, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageModal from '../components/LanguageModal';

const LandingPage = () => {
    const { login } = useAuth(); // Auth Context
    const [isLangOpen, setIsLangOpen] = useState(false);

    const handleLogin = async () => {
        try {
            await login(); // Mock Login
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-[#f4f46a] selection:text-black">

            {/* 語言選擇彈窗 */}
            <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

            {/* Navigation Bar */}
            <nav className="px-8 py-5 flex justify-between items-center sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#0f0f0f]/80">
                <div className="flex items-center gap-12">
                    <span className="font-serif font-black text-2xl tracking-tighter text-white flex items-start cursor-pointer select-none">
                        Pricilia(Growth)
                        <span className="text-[10px] font-sans font-bold ml-1 -mt-1 text-[#f4f46a]">™</span>
                    </span>
                    <div className="hidden md:flex gap-8">
                        {['Product', 'Methodology', 'Pricing'].map((item) => (
                            <a key={item} href="#" className="text-neutral-400 font-medium text-sm hover:text-white transition-colors">{item}</a>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogin} className="hidden md:block text-neutral-300 font-medium text-sm hover:text-white transition-colors px-4">Log in</button>
                    <button onClick={handleLogin} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-neutral-200 transition-transform active:scale-95">Sign up</button>
                    <button onClick={() => setIsLangOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-lg ml-2">🇺🇸</button>
                    <button className="md:hidden text-white ml-2"><Menu size={24} /></button>
                </div>
            </nav>

            {/* ===== 1. HERO SECTION (文案升級) ===== */}
            <section className="relative px-8 pt-24 pb-32 grid lg:grid-cols-12 gap-16 items-center overflow-hidden max-w-[1400px] mx-auto">

                {/* 背景光暈 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#f4f46a]/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                <div className="lg:col-span-6 space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f4f46a]/20 bg-[#f4f46a]/5 text-xs font-bold uppercase tracking-widest text-[#f4f46a] mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f4f46a] animate-pulse"></span> v3.0 Now Available
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.0] tracking-tight">
                        The operating system <br /> for <span className="text-[#f4f46a]">high achievers.</span>
                    </h1>
                    <p className="text-xl text-neutral-400 max-w-lg leading-relaxed font-light">
                        Stop juggling tasks, calendars, and spreadsheets. Pricilia centralizes your entire life into one intelligent dashboard.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button onClick={handleLogin} className="bg-[#f4f46a] text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-[#e2e255] transition-transform active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(244,244,106,0.2)]">
                            Start for free <ArrowRight size={16} />
                        </button>
                        {/* 🔥 修改：更專業的按鈕文案 */}
                        <button className="group bg-transparent border border-white/10 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
                            Student discount available
                        </button>
                    </div>
                    <p className="text-xs text-neutral-600 font-medium tracking-wide">TRUSTED BY STUDENTS AT TOP UNIVERSITIES WORLDWIDE</p>
                </div>

                {/* Abstract 3D Blocks (保持您喜歡的設計) */}
                <div className="lg:col-span-6 relative h-[500px] hidden lg:block perspective-1000">
                    <div className="relative w-full h-full grid grid-cols-2 gap-6 p-8 transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-1000 ease-out">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between hover:-translate-y-2 transition-transform shadow-2xl backdrop-blur-sm">
                            <div className="flex justify-between">
                                <div className="w-10 h-10 rounded-full bg-[#f4f46a] flex items-center justify-center"><Zap size={20} className="text-black" /></div>
                                <span className="text-xs font-mono text-neutral-500">AUTO_SYNC</span>
                            </div>
                            <div>
                                <div className="h-1.5 w-12 bg-neutral-700 rounded-full mb-2"></div>
                                <div className="text-2xl font-bold">Effortless</div>
                            </div>
                        </div>
                        <div className="bg-[#f4f46a] rounded-[2rem] p-6 flex flex-col justify-between text-black translate-y-12 shadow-[0_0_50px_rgba(244,244,106,0.2)]">
                            <div className="flex justify-between items-start">
                                <TrendingUp size={32} />
                                <span className="text-xs font-bold border border-black/20 px-2 py-1 rounded-full">+24%</span>
                            </div>
                            <div className="text-3xl font-black font-serif tracking-tighter">Growth<br />Metric</div>
                        </div>
                        <div className="col-span-2 bg-[#111] border border-white/10 rounded-[2rem] p-6 flex items-center gap-6 relative overflow-hidden backdrop-blur-md">
                            <div className="bg-neutral-800 p-3 rounded-xl"><Calendar className="text-white" /></div>
                            <div>
                                <div className="text-lg font-bold">Upcoming: Managerial Accounting</div>
                                <div className="text-sm text-neutral-500">Today, 14:00 • Amphithéâtre</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 2. BENTO GRID FEATURES ===== */}
            <section className="py-32 px-8 max-w-[1400px] mx-auto bg-[#0f0f0f]">
                <div className="max-w-2xl mb-20">
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
                        Everything you need <br /> to <span className="text-[#f4f46a]">get ahead.</span>
                    </h2>
                    <p className="text-lg text-neutral-400 font-light">
                        Replace your fragmented toolset with one cohesive operating system.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">

                    {/* Card 1: AI Assistant */}
                    <div className="md:col-span-2 bg-[#161616] border border-white/5 text-white rounded-[2rem] p-10 relative overflow-hidden group min-h-[400px]">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#f4f46a]/10 to-transparent rounded-full blur-[80px] group-hover:opacity-100 opacity-30 transition-opacity"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                    <Sparkles className="text-[#f4f46a]" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Howie AI Agent</h3>
                                <p className="text-neutral-400 text-sm max-w-md">Not just a chatbot. An agent that creates tasks, schedules meetings, and tracks expenses for you.</p>
                            </div>

                            {/* Mock Chat UI */}
                            <div className="mt-8 space-y-3 max-w-sm">
                                <div className="bg-[#2a2a2a] border border-white/5 p-3 rounded-2xl rounded-tl-sm self-start text-xs text-neutral-300">
                                    Remind me to pay rent on Friday.
                                </div>
                                <div className="bg-[#f4f46a] text-black p-3 rounded-2xl rounded-tr-sm self-end text-xs font-bold shadow-lg">
                                    Done. Added to your Finance tracker. 💸
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Calendar */}
                    <div className="md:col-span-1 bg-white text-black border border-stone-200 rounded-[2rem] p-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Calendar className="text-black" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Smart Sync</h3>
                                <p className="text-neutral-500 text-sm">Two-way sync with your university iCal. Never miss a deadline.</p>
                            </div>
                            <div className="mt-8 bg-stone-50 rounded-2xl p-4 border border-stone-100">
                                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 mb-3">
                                    <span>09:00</span><span>10:00</span><span>11:00</span>
                                </div>
                                <div className="h-10 bg-[#f4f46a] rounded-lg w-full border-l-4 border-black flex items-center px-3">
                                    <span className="text-[10px] font-bold truncate">Strategy Class</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Finance */}
                    <div className="md:col-span-1 bg-[#1a1a1a] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group cursor-pointer hover:border-[#f4f46a]/50 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <CreditCard size={24} className="text-[#f4f46a]" />
                                <span className="text-xs font-bold bg-[#f4f46a]/10 text-[#f4f46a] px-2 py-1 rounded">PRO</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Finance Tracker</h3>
                            <p className="text-neutral-500 text-sm">Track monthly burns & recurring bills automatically.</p>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <div className="h-1 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full w-[70%] bg-[#f4f46a]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Goals */}
                    <div className="md:col-span-2 bg-[#f4f46a] rounded-[2rem] p-10 relative overflow-hidden flex items-center text-black">
                        <div className="grid md:grid-cols-2 gap-10 items-center w-full">
                            <div>
                                <h3 className="text-3xl font-bold mb-2 font-serif">Extra*up Goals</h3>
                                <p className="text-black/70 text-sm font-medium">Turn vague dreams into actionable milestones. Level up your life like a RPG character.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-black/10 backdrop-blur-sm p-3 rounded-xl flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-2 border-black/30"></div>
                                    <span className="font-bold text-sm">Learn SQL Basics</span>
                                </div>
                                <div className="bg-black text-[#f4f46a] p-3 rounded-xl flex items-center gap-3 shadow-xl scale-105">
                                    <CheckCircle2 size={20} className="text-[#f4f46a]" />
                                    <span className="font-bold text-sm">Build Portfolio Project</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ===== 4. DEEP DIVE (🔥 全新升級：應用程式介面模擬) ===== */}
            <section className="py-32 px-8 bg-[#f6f5f2] text-black">
                <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left: High-Fidelity App Mockup */}
                    <div className="relative order-2 lg:order-1">
                        <div className="relative z-10">
                            {/* The "App Window" */}
                            <div className="bg-white rounded-[1.5rem] shadow-2xl border border-stone-200 overflow-hidden max-w-lg mx-auto transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out">

                                {/* Fake Sidebar & Header */}
                                <div className="flex h-[400px]">
                                    {/* Sidebar */}
                                    <div className="w-16 bg-stone-50 border-r border-stone-100 flex flex-col items-center py-6 gap-6">
                                        <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold text-xs">P</div>
                                        <Layout size={20} className="text-black" />
                                        <Calendar size={20} className="text-stone-400" />
                                        <ListTodo size={20} className="text-stone-400" />
                                        <div className="mt-auto"><Settings size={20} className="text-stone-400" /></div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="font-bold text-xl flex items-center gap-2">
                                                Today's Focus
                                            </h4>
                                            <div className="flex gap-3">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            </div>
                                        </div>

                                        {/* 🔥 真實的任務列表設計 */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100 shadow-sm group hover:border-black transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full border-2 border-stone-200 group-hover:border-black transition-colors"></div>
                                                    <span className="font-bold text-sm">Review Quarterly Goals</span>
                                                </div>
                                                <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded uppercase">High</span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-stone-50/50 rounded-xl border border-stone-100 opacity-60">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                        <CheckCircle2 size={12} className="text-white" />
                                                    </div>
                                                    <span className="font-medium text-sm line-through text-stone-500">Email Professor Dugas</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full border-2 border-stone-200"></div>
                                                    <span className="font-medium text-sm">Prepare Managerial Accounting</span>
                                                </div>
                                                <span className="text-[10px] font-bold bg-[#f4f46a] text-black px-2 py-1 rounded uppercase">Medium</span>
                                            </div>
                                        </div>

                                        {/* Floating AI Toast */}
                                        <div className="mt-6 bg-black text-white p-3 rounded-lg shadow-lg flex items-center gap-3 text-xs animate-pulse">
                                            <Sparkles size={14} className="text-[#f4f46a]" />
                                            <span>Howie suggests: Take a 5 min break.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative blob behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-stone-200 to-white rounded-full blur-3xl -z-10 opacity-50"></div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="order-1 lg:order-2 space-y-8">
                        <div className="inline-block px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-bold text-black uppercase tracking-wider">
                            Workflow
                        </div>
                        <h3 className="text-4xl lg:text-6xl font-serif font-bold text-black leading-tight">
                            Life OS as it <br /> should be.
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
                            <div className="space-y-2">
                                <strong className="block text-lg flex items-center gap-2"><Zap size={20} className="text-[#f4f46a] fill-black" /> Frictionless</strong>
                                <p className="text-stone-600 leading-relaxed text-sm">Capture tasks in seconds. No complex forms, just type and go.</p>
                            </div>
                            <div className="space-y-2">
                                <strong className="block text-lg flex items-center gap-2"><Clock size={20} className="text-black" /> Time-Saving</strong>
                                <p className="text-stone-600 leading-relaxed text-sm">Let AI organize your schedule so you can focus on execution.</p>
                            </div>
                            <div className="space-y-2">
                                <strong className="block text-lg flex items-center gap-2"><MousePointer2 size={20} className="text-black" /> Automation</strong>
                                <p className="text-stone-600 leading-relaxed text-sm">Recurring bills and tasks reset automatically. Set it and forget it.</p>
                            </div>
                            <div className="space-y-2">
                                <strong className="block text-lg flex items-center gap-2"><Shield size={20} className="text-black" /> Private</strong>
                                <p className="text-stone-600 leading-relaxed text-sm">Your data is yours. We don't sell ads or track your behavior.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ===== 5. BIG CTA ===== */}
            <section className="bg-[#0f0f0f] py-32 px-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f4f46a]/10 to-transparent"></div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-5xl lg:text-7xl font-serif font-bold text-white tracking-tight">
                        Ready to upgrade <br /> your life?
                    </h2>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleLogin} className="bg-[#f4f46a] text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-[#e2e255] transition-transform hover:scale-105 shadow-[0_0_40px_rgba(244,244,106,0.3)]">
                            Start for free
                        </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-8 font-medium">NO CREDIT CARD REQUIRED • FREE FOR STUDENTS</p>
                </div>
            </section>

            {/* ===== 6. CORPORATE FOOTER (🔥 企業級 Footer) ===== */}
            <footer className="bg-[#0f0f0f] text-white py-20 px-8 border-t border-white/10">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2">
                        <span className="font-serif font-black text-2xl tracking-tighter text-white flex items-start mb-6">
                            Pricilia(Growth)
                            <span className="text-[10px] font-sans font-bold ml-1 -mt-1 text-[#f4f46a]">™</span>
                        </span>
                        <p className="text-neutral-500 text-sm max-w-xs leading-relaxed">
                            The all-in-one operating system for students and high achievers. Built for growth, designed for focus.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold mb-6 text-white">Product</h4>
                        <ul className="space-y-4 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Daily Overview</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Howie AI</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Extra*up Goals</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Finance Tracker</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold mb-6 text-white">Company</h4>
                        <ul className="space-y-4 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <h4 className="font-bold mb-6 text-white">Legal</h4>
                        <ul className="space-y-4 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-neutral-600 text-xs">© 2025 Pricilia(Growth)™. All rights reserved.</p>
                    <div className="flex gap-4">
                        {/* Social Icons Placeholders */}
                        <div className="w-5 h-5 bg-white/10 rounded-full hover:bg-[#f4f46a] hover:text-black transition-colors cursor-pointer"></div>
                        <div className="w-5 h-5 bg-white/10 rounded-full hover:bg-[#f4f46a] hover:text-black transition-colors cursor-pointer"></div>
                        <div className="w-5 h-5 bg-white/10 rounded-full hover:bg-[#f4f46a] hover:text-black transition-colors cursor-pointer"></div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;

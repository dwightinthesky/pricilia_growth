import React, { useState } from 'react';
import {
    Play, Zap, Shield, Clock, MousePointer2, Menu,
    Database, TrendingUp, Sparkles, Calendar, CheckCircle2,
    ArrowRight, Globe, CreditCard, ListTodo, Layout, Settings, Bell,
    Search, Command, Lock, ChevronDown, Check, X, Plane, BookOpen, Coffee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageModal from '../components/LanguageModal';

const LandingPage = () => {
    const { login } = useAuth();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [faqOpen, setFaqOpen] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    const handleLogin = async () => {
        try {
            await login();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-[#f4f46a] selection:text-black">

            {/* Language Modal */}
            <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

            {/* ===== A. TOP NAV ===== */}
            <nav className="px-6 md:px-8 py-5 flex justify-between items-center sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#0f0f0f]/80">
                <div className="flex items-center gap-12">
                    <span className="font-serif font-black text-2xl tracking-tighter text-white flex items-start cursor-pointer select-none">
                        Pricilia(Growth)
                        <span className="text-[10px] font-sans font-bold ml-1 -mt-1 text-[#f4f46a]">™</span>
                    </span>
                    <div className="hidden lg:flex gap-8">
                        {['Product', 'Methodology', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                            <a key={item} href="#" className="text-neutral-400 font-medium text-sm hover:text-white transition-colors">{item}</a>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Command K Capsule */}
                    <div className="hidden xl:flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer group">
                        <Command size={14} />
                        <span className="font-bold">K</span>
                        <span className="w-[1px] h-3 bg-white/20 mx-1"></span>
                        <span className="overflow-hidden w-0 group-hover:w-[180px] transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">
                            Search anything, create events
                        </span>
                    </div>

                    <button onClick={handleLogin} className="hidden md:block text-neutral-300 font-medium text-sm hover:text-white transition-colors px-2">Log in</button>
                    <button onClick={handleLogin} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-neutral-200 transition-transform active:scale-95">Sign up</button>
                    <button onClick={() => setIsLangOpen(true)} className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-lg ml-2">🌍</button>
                    <button className="lg:hidden text-white ml-2"><Menu size={24} /></button>
                </div>
            </nav>

            {/* ===== B. HERO SECTION ===== */}
            <section className="relative px-6 md:px-8 pt-20 pb-32 grid lg:grid-cols-12 gap-16 items-center overflow-hidden max-w-[1400px] mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#f4f46a]/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                <div className="lg:col-span-6 space-y-8 relative z-10">
                    <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.0] tracking-tight">
                        One dashboard to run your <br className="hidden lg:block" /> student life.
                    </h1>
                    <p className="text-4xl lg:text-5xl font-serif font-bold text-[#f4f46a] leading-tight tracking-tight">
                        Schedule, goals, and money — organized.
                    </p>
                    <p className="text-lg text-neutral-400 max-w-lg leading-relaxed font-light mt-4">
                        Sync your university calendar, plan deep work, track long-term goals, and stay on budget — with an AI agent that actually takes action.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-6">
                        <button onClick={handleLogin} className="bg-[#f4f46a] text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-[#e2e255] transition-transform active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(244,244,106,0.2)]">
                            Start for free <ArrowRight size={16} />
                        </button>
                        <button className="group bg-transparent border border-white/10 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
                            <Play size={16} className="fill-white" /> Watch demo (45s)
                        </button>
                    </div>
                </div>

                {/* Hero Right UI: 4 Card Stack */}
                <div className="lg:col-span-6 relative h-[600px] hidden lg:block">
                    <div className="relative w-full h-full perspective-1000">
                        {/* 1. Upcoming Card */}
                        <div className="absolute top-0 right-0 w-[300px] bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-500 z-10 hover:z-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Calendar size={20} /></div>
                                <div>
                                    <div className="text-xs text-neutral-400 font-bold uppercase">Next Class</div>
                                    <div className="font-bold">Strategy 101</div>
                                </div>
                            </div>
                            <div className="text-2xl font-mono mb-2">14:00</div>
                            <div className="text-xs text-neutral-500 flex items-center gap-1"><Clock size={12} /> Starts in 45m</div>
                        </div>

                        {/* 2. Extra*Up Card */}
                        <div className="absolute top-32 left-10 w-[320px] bg-[#f4f46a] text-black rounded-3xl p-6 shadow-[0_0_50px_rgba(244,244,106,0.3)] transform -rotate-3 hover:rotate-0 transition-all duration-500 z-20 hover:z-50">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif font-black text-xl">SQL Cert</h3>
                                <span className="text-xs font-bold bg-black/10 px-2 py-1 rounded">ON TRACK</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold opacity-70">
                                    <span>Progress</span>
                                    <span>65%</span>
                                </div>
                                <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[65%] bg-black"></div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Finance Card */}
                        <div className="absolute bottom-20 right-10 w-[280px] bg-white text-black rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 z-30 hover:z-50 border border-neutral-200">
                            <div className="flex justify-between items-center mb-4">
                                <div className="font-bold">Monthly Burn</div>
                                <TrendingUp size={20} className="text-red-500" />
                            </div>
                            <div className="text-3xl font-black mb-1">€842</div>
                            <div className="text-xs text-neutral-500 mb-4">limit: €1,000</div>
                            <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                <CreditCard size={14} /> Netflix renewal tmrow
                            </div>
                        </div>

                        {/* 4. Howie AI Card */}
                        <div className="absolute bottom-0 left-0 w-[400px] bg-[#0f0f0f] border border-white/20 rounded-3xl p-6 shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500 z-40 hover:z-50">
                            <div className="space-y-4">
                                <div className="bg-[#2a2a2a] rounded-2xl p-3 text-xs text-neutral-300 self-start w-3/4">
                                    I need focused time for React study.
                                </div>
                                <div className="bg-[#f4f46a] text-black rounded-2xl p-3 text-xs font-medium self-end w-3/4 shadow-lg">
                                    Blocked 90 mins for "Deep Work: React" tomorrow at 10 AM.
                                </div>
                                <button className="w-full bg-[#1a1a1a] border border-white/10 hover:bg-[#252525] text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                    <Calendar size={14} /> Add to Calendar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== C. TRUSTED ===== */}
            <section className="border-y border-white/5 bg-[#0a0a0a] py-10">
                <div className="max-w-[1400px] mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-8">Trusted by students at</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale">
                        {/* Mock Logos - Text based for simplicity but styled like logos */}
                        <span className="font-serif font-black text-xl text-white">ESCP<span className="text-xs font-sans align-top">BUSINESS SCHOOL</span></span>
                        <span className="font-sans font-bold text-xl text-white tracking-tighter">HEC<span className="text-[#f4f46a]">PARIS</span></span>
                        <span className="font-mono font-bold text-xl text-white">SCIENCES<span className="font-light">PO</span></span>
                        <span className="font-serif font-bold text-xl text-white italic">LSE</span>
                        <span className="font-sans font-black text-xl text-white tracking-widest">BOCCO<span className="text-neutral-500">NI</span></span>
                    </div>
                </div>
            </section>

            {/* ===== D. PROBLEM / SHIFT ===== */}
            <section className="py-32 px-6 max-w-[1400px] mx-auto">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-[#161616] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6"><Layout className="text-neutral-400" /></div>
                        <h3 className="text-xl font-bold mb-2">Fragmented Calendar</h3>
                        <p className="text-neutral-500 text-sm">School schedule here, personal tasks there. You're always switching apps.</p>
                    </div>
                    <div className="bg-[#161616] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6"><ListTodo className="text-neutral-400" /></div>
                        <h3 className="text-xl font-bold mb-2">Goals with no system</h3>
                        <p className="text-neutral-500 text-sm">"Learn SQL" sits on your todo list for months with zero progress.</p>
                    </div>
                    <div className="bg-[#161616] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6"><CreditCard className="text-neutral-400" /></div>
                        <h3 className="text-xl font-bold mb-2">Money Leaks</h3>
                        <p className="text-neutral-500 text-sm">Subscriptions and small daily spends drain your budget unnoticed.</p>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-2xl md:text-4xl font-serif font-bold text-white">
                        Pricilia turns chaos into a <span className="text-[#f4f46a] underline underline-offset-8 decoration-4 decoration-[#f4f46a]/30">weekly rhythm.</span>
                    </p>
                </div>
            </section>

            {/* ===== FEATURES DEEP DIVE ===== */}

            {/* Feature 1: Smart Sync */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-block px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded-full text-xs font-bold text-[#f4f46a] mb-6">SMART SYNC</div>
                        <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">Smart Sync that <br /> just works.</h2>
                        <ul className="space-y-4 text-neutral-400">
                            <li className="flex items-start gap-3"><Check className="text-[#f4f46a] shrink-0 mt-1" size={18} /> <span>Import university iCal once. We keep it updated.</span></li>
                            <li className="flex items-start gap-3"><Check className="text-[#f4f46a] shrink-0 mt-1" size={18} /> <span>Auto-normalizes messy event titles.</span></li>
                            <li className="flex items-start gap-3"><Check className="text-[#f4f46a] shrink-0 mt-1" size={18} /> <span>School + Personal merged in one coherent timeline.</span></li>
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#f4f46a] blur-[100px] opacity-10 rounded-full"></div>
                        <div className="bg-[#161616] border border-white/10 rounded-3xl p-8 relative z-10">
                            <div className="space-y-3">
                                {/* School Event */}
                                <div className="flex gap-4 p-4 bg-[#1a1a1a] rounded-xl border-l-4 border-blue-500">
                                    <div className="text-center min-w-[50px]">
                                        <div className="text-xs font-bold text-neutral-500">NOV</div>
                                        <div className="text-xl font-bold">14</div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Financial Accounting</div>
                                        <div className="text-xs text-neutral-500">09:00 - 12:00 • Hall B</div>
                                        <div className="mt-2 inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded">SCHOOL</div>
                                    </div>
                                </div>
                                {/* Personal Event */}
                                <div className="flex gap-4 p-4 bg-[#1a1a1a] rounded-xl border-l-4 border-green-500">
                                    <div className="text-center min-w-[50px]">
                                        <div className="text-xs font-bold text-neutral-500">NOV</div>
                                        <div className="text-xl font-bold">14</div>
                                    </div>
                                    <div>
                                        <div className="font-bold">Gym Session</div>
                                        <div className="text-xs text-neutral-500">18:00 - 19:30 • Vitality</div>
                                        <div className="mt-2 inline-block px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded">PERSONAL</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Command K */}
            <section className="py-24 px-6 border-t border-white/5 bg-[#121212]">
                <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-2 max-w-md mx-auto">
                            <div className="bg-[#0f0f0f] rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-3 text-neutral-400 border-b border-white/10 pb-4 mb-2">
                                    <Search size={18} />
                                    <span className="text-sm">standup|</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="px-3 py-2 bg-[#f4f46a]/10 text-[#f4f46a] rounded-lg text-sm flex justify-between items-center cursor-pointer">
                                        <span className="font-bold">Weekly Standup</span>
                                        <span className="text-xs opacity-70">Event • Today 09:00</span>
                                    </div>
                                    <div className="px-3 py-2 text-neutral-400 hover:bg-white/5 rounded-lg text-sm flex justify-between items-center">
                                        <span>Create event "Standup"</span>
                                        <span className="text-[10px] border border-white/10 px-1 rounded">↵</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-6">
                            <button className="text-sm font-bold text-neutral-400 hover:text-white transition-colors border-b border-dashed border-neutral-600 pb-0.5"> Try it: Press ⌘K now</button>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="inline-block px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded-full text-xs font-bold text-blue-400 mb-6">ONBOARDING</div>
                        <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">⌘K to move faster.</h2>
                        <p className="text-neutral-400 text-lg mb-6">
                            Navigate your life at the speed of thought. Search events, jump to dates, or create new tasks without ever touching your mouse.
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature 3: Extra*Up Goals */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-block px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded-full text-xs font-bold text-purple-400 mb-6">LONG TERM GROWTH</div>
                        <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">Long-term goals, <br /> weekly rhythm.</h2>
                        <p className="text-neutral-400 text-lg mb-8">
                            Whether it's the 3-month Microsoft SQL cert, LSAT prep, or the Bar Exam. Set a weekly commitment, track progress, and get nudged if you fall behind.
                        </p>
                        <div className="p-4 bg-white/5 rounded-2xl border-l-4 border-[#f4f46a]">
                            <p className="text-sm font-medium text-white italic">
                                "If you're behind, we don't shame you — we schedule you."
                            </p>
                        </div>
                    </div>
                    <div>
                        <div className="bg-[#161616] border border-white/10 rounded-3xl p-6 relative">
                            {/* RPG Card */}
                            <div className="bg-[#f4f46a] rounded-2xl p-6 text-black shadow-lg">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="text-xs font-bold opacity-60 uppercase mb-1">Goal</div>
                                        <h3 className="text-2xl font-black font-serif">LSAT Prep</h3>
                                    </div>
                                    <div className="bg-black/10 px-3 py-1 rounded-full text-xs font-bold">6h / week</div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span>Week 4 of 12</span>
                                            <span className="text-red-600">⚠ 2h Behind</span>
                                        </div>
                                        <div className="h-3 bg-black/10 rounded-full overflow-hidden">
                                            <div className="h-full w-[40%] bg-black"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-black text-white py-2 rounded-xl text-xs font-bold">Catch up</button>
                                        <button className="px-3 bg-black/10 rounded-xl font-bold">...</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 4: Deadline Timer */}
            <section className="py-24 px-6 border-t border-white/5 bg-[#121212]">
                <div className="max-w-[1200px] mx-auto text-center mb-16">
                    <div className="inline-block px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded-full text-xs font-bold text-red-500 mb-6">FOCUS</div>
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">Deadlines you can feel.</h2>
                </div>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                        <div className="bg-black text-white p-10 flex-1 flex flex-col justify-center">
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Project Submission</div>
                            <h3 className="text-2xl font-bold mb-4">Marketing Capstone</h3>
                            <div className="font-mono text-5xl font-bold tracking-tighter">
                                48<span className="text-neutral-600">:</span>12<span className="text-neutral-600 text-3xl">:05</span>
                            </div>
                        </div>
                        <div className="bg-white text-black p-10 flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-neutral-100">
                            <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Next Class</div>
                            <h3 className="text-2xl font-bold mb-4">Consumer Behavior</h3>
                            <div className="font-mono text-3xl font-bold tracking-tighter text-neutral-400">
                                Starts in 15m
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-neutral-100 self-start px-2 py-1 rounded">
                                <MapPinIcon /> Room 304
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 5: Howie AI */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1 relative">
                        {/* Chat Interface Mock */}
                        <div className="bg-[#161616] border border-white/10 rounded-3xl p-6 max-w-md mx-auto relative z-10">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0"></div>
                                    <div className="bg-[#2a2a2a] p-4 rounded-2xl rounded-tl-none text-sm text-neutral-300">
                                        I'm feeling overwhelmed with the Marketing project. Help me plan.
                                    </div>
                                </div>
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-[#f4f46a] flex items-center justify-center shrink-0 text-black font-bold">H</div>
                                    <div className="bg-[#f4f46a] text-black p-4 rounded-2xl rounded-tr-none text-sm font-medium shadow-lg">
                                        I see you have 3 free slots before the deadline called "Procrastination". Shall I book deep work sessions?
                                        <div className="mt-4 flex flex-col gap-2">
                                            <button className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors text-left flex justify-between group">
                                                Schedule 90-min session <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                            <button className="bg-black/10 text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/20 transition-colors text-left">
                                                Show my calendar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="inline-block px-3 py-1 bg-[#1a1a1a] border border-white/10 rounded-full text-xs font-bold text-[#f4f46a] mb-6">ACTION ENGINE</div>
                        <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">Not a chatbot. <br /> An action engine.</h2>
                        <ul className="space-y-6 text-lg text-neutral-400">
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-[#f4f46a] flex items-center justify-center text-black font-bold shrink-0">1</div>
                                <span>Reads your complete schedule + goals context.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-[#f4f46a] flex items-center justify-center text-black font-bold shrink-0">2</div>
                                <span>Detects when you are overloaded or behind schedule.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-[#f4f46a] flex items-center justify-center text-black font-bold shrink-0">3</div>
                                <span>Creates sessions and calendar events with one click.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Feature 6: Finance Tracker (🔥 New) */}
            <section className="py-24 px-6 border-t border-white/5 bg-[#1a1a1a]">
                <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-block px-3 py-1 bg-black border border-white/10 rounded-full text-xs font-bold text-green-400 mb-6 flex items-center gap-2"><CreditCard size={12} /> FINANCE OS</div>
                        <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-white">Know where your money goes.</h2>
                        <p className="text-neutral-400 text-lg mb-8">
                            Your goals fail when your budget leaks. Track subscriptions, daily spending, and study costs without messy spreadsheets.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-black/50 rounded-2xl border border-white/5">
                                <h4 className="font-bold text-white mb-1">Recurring</h4>
                                <p className="text-sm text-neutral-500">Netflix, Gym, iCloud</p>
                            </div>
                            <div className="p-4 bg-black/50 rounded-2xl border border-white/5">
                                <h4 className="font-bold text-white mb-1">Alerts</h4>
                                <p className="text-sm text-neutral-500">Before you're charged</p>
                            </div>
                        </div>
                    </div>

                    {/* Finance UI Stack */}
                    <div className="relative h-[400px] w-full max-w-sm mx-auto">
                        {/* Black Card: Spend */}
                        <div className="absolute top-0 left-0 w-full bg-black border border-white/10 text-white p-6 rounded-3xl shadow-2xl z-30">
                            <div className="text-xs text-neutral-500 font-bold uppercase mb-2">This Month</div>
                            <div className="text-4xl font-bold font-mono mb-4">€842.50</div>
                            <div className="h-10 flex items-end gap-2">
                                {[40, 60, 30, 80, 50, 90, 20].map((h, i) => (
                                    <div key={i} className="flex-1 bg-[#f4f46a]" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.3 }}></div>
                                ))}
                            </div>
                        </div>
                        {/* Yellow Card: Bills */}
                        <div className="absolute top-24 left-4 w-full bg-[#f4f46a] text-black p-6 rounded-3xl shadow-xl z-20 transform rotate-2">
                            <div className="text-xs font-bold opacity-60 uppercase mb-4">Upcoming Bills</div>
                            <div className="space-y-3">
                                <div className="flex justify-between font-bold text-sm border-b border-black/10 pb-2">
                                    <span>Netflix</span>
                                    <span>€13.99</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm border-b border-black/10 pb-2">
                                    <span>Gym</span>
                                    <span>€29.99</span>
                                </div>
                            </div>
                        </div>
                        {/* White Card: Subs */}
                        <div className="absolute top-48 left-8 w-full bg-white text-black p-6 rounded-3xl shadow-xl z-10 transform rotate-3">
                            <div className="text-xs font-bold opacity-60 uppercase mb-4">Subscriptions</div>
                            <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[1200px] mx-auto">
                    <h2 className="text-center text-3xl font-bold font-serif mb-16">How it works</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-white/10">1</div>
                            <h3 className="font-bold text-xl">Connect Calendar</h3>
                            <p className="text-neutral-500 text-sm">One-click sync with your university iCal.</p>
                        </div>
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-white/10">2</div>
                            <h3 className="font-bold text-xl">Set Goals</h3>
                            <p className="text-neutral-500 text-sm">Define your weekly commitment hours.</p>
                        </div>
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-white/10">3</div>
                            <h3 className="font-bold text-xl">Execute</h3>
                            <p className="text-neutral-500 text-sm">Use ⌘K and Howie to stay on track.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section className="py-24 px-6 border-t border-white/5 bg-[#121212]">
                <div className="max-w-[1200px] mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold font-serif mb-4">Fair Pricing</h2>
                        <p className="text-neutral-400">Free for early adopters.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free */}
                        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10">
                            <h3 className="font-bold text-xl mb-2">Free</h3>
                            <div className="text-3xl font-bold mb-6">€0</div>
                            <ul className="space-y-3 text-sm text-neutral-400 mb-8">
                                <li className="flex gap-2"><Check size={16} /> Calendar Sync</li>
                                <li className="flex gap-2"><Check size={16} /> Basic Goals</li>
                                <li className="flex gap-2"><Check size={16} /> Deadline Timer</li>
                            </ul>
                            <button onClick={handleLogin} className="w-full py-3 rounded-xl border border-white/20 font-bold hover:bg-white/5">Start Free</button>
                        </div>
                        {/* Pro */}
                        <div className="bg-[#f4f46a] text-black p-8 rounded-3xl relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(244,244,106,0.2)]">
                            <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                            <h3 className="font-bold text-xl mb-2">Student Pro</h3>
                            <div className="text-3xl font-bold mb-6">€4<span className="text-sm font-normal">/mo</span></div>
                            <ul className="space-y-3 text-sm font-medium mb-8">
                                <li className="flex gap-2"><Check size={16} /> Everything in Free</li>
                                <li className="flex gap-2"><Check size={16} /> Howie AI Action Engine</li>
                                <li className="flex gap-2"><Check size={16} /> Finance Tracker</li>
                                <li className="flex gap-2"><Check size={16} /> Advanced Analytics</li>
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-black text-white font-bold hover:bg-neutral-800">Join Waitlist</button>
                        </div>
                        {/* Team */}
                        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 opacity-60">
                            <h3 className="font-bold text-xl mb-2">Family / Flat</h3>
                            <div className="text-3xl font-bold mb-6">Coming Soon</div>
                            <ul className="space-y-3 text-sm text-neutral-400 mb-8">
                                <li className="flex gap-2"><Check size={16} /> Shared Chores</li>
                                <li className="flex gap-2"><Check size={16} /> Shared Grocery List</li>
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-white/10 font-bold cursor-not-allowed">Notify Me</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ROADMAP ===== */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[1000px] mx-auto">
                    <h2 className="text-3xl font-bold font-serif mb-12 text-center">Product Roadmap</h2>
                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="w-32 font-bold text-[#f4f46a] text-right pt-1 shrink-0">NOW</div>
                            <div className="border-l border-white/20 pl-6 pb-2">
                                <h4 className="font-bold text-lg text-white">Smart Sync & Core Dashboard</h4>
                                <p className="text-neutral-500 text-sm mt-1">Calendar integration, Task management, Deadline Timer, ⌘K Command Palette.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-32 font-bold text-neutral-500 text-right pt-1 shrink-0">NEXT</div>
                            <div className="border-l border-white/20 pl-6 pb-2">
                                <h4 className="font-bold text-lg text-white">Full Extra*Up & Howie V1</h4>
                                <p className="text-neutral-500 text-sm mt-1">Complete Goal RPG system with alerts. First version of Howie Action Engine for auto-scheduling.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-32 font-bold text-neutral-700 text-right pt-1 shrink-0">LATER</div>
                            <div className="border-l border-white/20 pl-6 pb-2">
                                <h4 className="font-bold text-lg text-neutral-400">Finance & Chores</h4>
                                <p className="text-neutral-600 text-sm mt-1">Recurring subscription tracking and shared household management.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECURITY ===== */}
            <section className="py-24 px-6 border-t border-white/5 bg-[#1a1a1a]">
                <div className="max-w-[1000px] mx-auto text-center">
                    <h2 className="text-2xl font-bold font-serif mb-12">Built for privacy.</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <Shield className="mx-auto text-[#f4f46a]" size={32} />
                            <h4 className="font-bold">You own your data</h4>
                            <p className="text-sm text-neutral-500">We don't track your behavior or sell your schedule to advertisers.</p>
                        </div>
                        <div className="space-y-4">
                            <Lock className="mx-auto text-[#f4f46a]" size={32} />
                            <h4 className="font-bold">Encrypted Secrets</h4>
                            <p className="text-sm text-neutral-500">Calendar keys are stored as encrypted secrets on Cloudflare.</p>
                        </div>
                        <div className="space-y-4">
                            <CheckCircle2 className="mx-auto text-[#f4f46a]" size={32} />
                            <h4 className="font-bold">No Ads</h4>
                            <p className="text-sm text-neutral-500">A clean interface designed for focus, not distraction.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-3xl font-bold font-serif mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: "How does Smart Sync work?", a: "We connect directly to your university's iCal feed. When your school updates the schedule, Pricilia updates automatically. You can also mix in your personal Google Calendar events." },
                            { q: "Can I combine school + personal calendars?", a: "Yes. You typically have your school events in Blue and personal events in Green. They live on one unified timeline so you never double-book." },
                            { q: "What does HowieAI actually do?", a: "Howie isn't just a chatbot. He has access to your calendar API. You can tell him 'Find time for gym' and he will actually create the event for you, checking for conflicts." },
                            { q: "Is ⌘K available on Windows?", a: "Yes! It works on both Mac (Cmd+K) and Windows (Ctrl+K). It's the fastest way to navigate the dashboard." },
                            { q: "Can I track recurring subscriptions?", a: "Yes. The Finance module is designed specifically for this. Add your Netflix, Spotify, etc., and see your total monthly 'burn' rate." },
                            { q: "Can I export my data?", a: "Yes, you can export your events and goals at any time." },
                            { q: "What happens if I hit usage limits?", a: "For the Free tier, there are no strict hard limits on events. AI features in the future Pro tier may have fair usage policies." },
                            { q: "Can I use it without connecting school calendar?", a: "Absolutely. You can use Pricilia purely for personal goals and scheduling manually." }
                        ].map((item, i) => (
                            <div key={i} className="border border-white/10 rounded-2xl bg-[#161616] overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-bold">{item.q}</span>
                                    <ChevronDown size={20} className={`text-neutral-500 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                                </button>
                                {faqOpen === i && (
                                    <div className="px-6 pb-6 text-neutral-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-[#0f0f0f] text-white py-20 px-8 border-t border-white/10">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <span className="font-serif font-black text-2xl tracking-tighter text-white flex items-start mb-6">
                            Pricilia(Growth)
                            <span className="text-[10px] font-sans font-bold ml-1 -mt-1 text-[#f4f46a]">™</span>
                        </span>
                        <p className="text-neutral-500 text-sm max-w-xs leading-relaxed">
                            The all-in-one operating system for students and high achievers. Built for growth, designed for focus.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white">Product</h4>
                        <ul className="space-y-4 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Daily Overview</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Howie AI</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Extra*up Goals</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Finance Tracker</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white">Company</h4>
                        <ul className="space-y-4 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-[#f4f46a] transition-colors">Contact</a></li>
                        </ul>
                    </div>
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
                        <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#f4f46a] hover:text-black transition-colors flex items-center justify-center cursor-pointer font-bold text-xs">X</div>
                        <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#f4f46a] hover:text-black transition-colors flex items-center justify-center cursor-pointer font-bold text-xs">In</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Mini-component for icon used above
function MapPinIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
}

export default LandingPage;

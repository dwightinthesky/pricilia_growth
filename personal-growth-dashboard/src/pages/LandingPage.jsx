import React from "react";
import { ArrowRight, Calendar, Sparkles, Bot, Wallet, Clock, Command } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
    const { login } = useAuth();

    return (
        <div className="bg-black text-white font-sans">

            {/* ===== NAVBAR ===== */}
            <header className="fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-serif font-black text-xl">
                        Pricilia<span className="text-[#f4f46a]">(Growth)</span>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm text-white/70">
                        <a href="#product" className="hover:text-white transition-colors">Product</a>
                        <a href="#method" className="hover:text-white transition-colors">Methodology</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </nav>
                    <div className="flex gap-3">
                        <button onClick={login} className="text-sm text-white/70 hover:text-white transition-colors">Log in</button>
                        <button onClick={login} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors">
                            Sign up
                        </button>
                    </div>
                </div>
            </header>

            {/* ===== HERO ===== */}
            <section className="pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="inline-block mb-6 px-4 py-1 rounded-full border border-[#f4f46a]/30 text-[#f4f46a] text-xs font-bold tracking-widest">
                            V3.1 NOW AVAILABLE
                        </span>

                        <h1 className="text-5xl md:text-6xl font-serif font-black leading-tight">
                            The operating system<br />
                            for <span className="text-[#f4f46a]">high achievers</span>.
                        </h1>

                        <p className="mt-6 text-white/60 max-w-xl">
                            Schedule, goals, deadlines, and money — unified into one intelligent dashboard.
                            Built for students with real workloads and real ambitions.
                        </p>

                        <div className="mt-10 flex gap-4">
                            <button onClick={login} className="px-8 py-4 rounded-full bg-[#f4f46a] text-black font-bold flex items-center gap-2 hover:bg-[#e2e255] transition-colors">
                                Start for free <ArrowRight size={16} />
                            </button>
                            <button className="px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors">
                                Watch demo
                            </button>
                        </div>
                    </div>

                    {/* HERO MOCK */}
                    <div className="relative">
                        {/* 4 Cards Stack Effect from previous design (Simulated or kept simple as per user code) */}
                        {/* User gave a simple mock in the code block, sticking to it or enhancing slightly? User said "HERO MOCK" div. I will implement what they provided. */}
                        <div className="rounded-3xl bg-neutral-900 p-6 shadow-xl border border-white/10 relative z-10">
                            <div className="text-xs text-white/40 mb-3 uppercase font-bold tracking-wider">Upcoming</div>
                            <div className="text-lg font-bold">Managerial Accounting</div>
                            <div className="text-sm text-white/60 mt-1 flex items-center gap-2">
                                <Clock size={14} /> Today · 14:00 · Amphithéâtre
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-4 -right-4 w-full h-full bg-neutral-800 rounded-3xl -z-10 opacity-50"></div>
                    </div>
                </div>
            </section>

            {/* ===== PROBLEM ===== */}
            <section className="py-32 bg-neutral-950 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl font-serif font-black">
                        Your life isn’t messy.<br />Your tools are.
                    </h2>
                    <p className="mt-6 text-white/50 text-lg">
                        Calendars everywhere. Goals without rhythm. Money leaking quietly every month.
                    </p>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="product" className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid gap-24">

                    {/* Smart Sync */}
                    <Feature
                        icon={Calendar}
                        title="Smart Schedule Sync"
                        description="School iCal and personal events normalized into one clean timeline."
                        bullets={[
                            "University calendar auto-sync",
                            "School + Personal merged seamlessly",
                            "Always up to date"
                        ]}
                    />

                    {/* Command Palette */}
                    <Feature
                        icon={Command}
                        title="Command Palette (⌘K)"
                        description="Search, navigate, and create without breaking focus."
                        bullets={[
                            "Jump to any event or date",
                            "Create events instantly",
                            "Keyboard-first workflow"
                        ]}
                    />

                    {/* ExtraUp */}
                    <Feature
                        icon={Sparkles}
                        title="Extra*Up Goals"
                        description="Turn long-term ambitions into weekly rhythm."
                        bullets={[
                            "Weekly commitment tracking",
                            "Overload & behind alerts",
                            "Certs, exams, projects"
                        ]}
                    />

                    {/* Deadline */}
                    <Feature
                        icon={Clock}
                        title="Deadline & Next Class Timer"
                        description="Deadlines you can feel. Time until your next class."
                        bullets={[
                            "Custom countdowns",
                            "Auto-detected next class",
                            "Location & professor extraction"
                        ]}
                    />

                    {/* Finance */}
                    <Feature
                        icon={Wallet}
                        title="Finance Tracker"
                        description="Manual input. Recurring-first. No spreadsheets."
                        bullets={[
                            "Recurring bills & subscriptions",
                            "Upcoming charges preview",
                            "Monthly spending overview"
                        ]}
                        highlight
                    />

                    {/* Howie */}
                    <Feature
                        icon={Bot}
                        title="Howie AI"
                        description="Not a chatbot. An action engine."
                        bullets={[
                            "Reads your schedule & goals",
                            "Detects overload automatically",
                            "Creates events with one click"
                        ]}
                    />

                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="py-40 bg-gradient-to-b from-black to-neutral-900 text-center px-6">
                <h2 className="text-5xl font-serif font-black">
                    Ready to upgrade your life?
                </h2>
                <p className="mt-6 text-white/50 text-lg">
                    Free for students. No credit card required.
                </p>
                <div className="mt-10">
                    <button onClick={login} className="px-10 py-4 rounded-full bg-[#f4f46a] text-black font-bold hover:bg-[#e2e255] transition-colors">
                        Start for free
                    </button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-20 px-6 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm text-white/50">
                    <div>
                        <div className="font-serif font-black text-white mb-3 text-xl">
                            Pricilia<span className="text-[#f4f46a]">(Growth)</span>
                        </div>
                        <p>Life OS for students and high achievers.</p>
                    </div>
                    <div>
                        <div className="text-white font-bold mb-3">Product</div>
                        <ul className="space-y-2">
                            <li>Daily Overview</li>
                            <li>Howie AI</li>
                            <li>Extra*Up Goals</li>
                            <li>Finance Tracker</li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-white font-bold mb-3">Company</div>
                        <ul className="space-y-2">
                            <li>About</li>
                            <li>Blog</li>
                            <li>Careers</li>
                        </ul>
                    </div>
                    <div>
                        <div className="text-white font-bold mb-3">Legal</div>
                        <ul className="space-y-2">
                            <li>Privacy</li>
                            <li>Terms</li>
                            <li>Security</li>
                        </ul>
                    </div>
                </div>
            </footer>

        </div>
    );
}

/* ===== FEATURE BLOCK ===== */
function Feature({ icon: Icon, title, description, bullets, highlight }) {
    return (
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${highlight ? "bg-[#f4f46a] text-black" : "bg-white/10 text-white"}`}>
                    <Icon size={22} />
                </div>
                <h3 className="text-3xl font-serif font-black">{title}</h3>
                <p className="mt-4 text-white/60 max-w-lg text-lg leading-relaxed">{description}</p>
                <ul className="mt-6 space-y-3 text-white/70 font-medium">
                    {bullets.map(b => <li key={b}>• {b}</li>)}
                </ul>
            </div>
            {/* Mock UI Placeholder */}
            <div className="rounded-3xl bg-[#111] h-80 shadow-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Icon size={64} className="text-white/10 group-hover:text-white/20 transition-colors duration-500" />
            </div>
        </div>
    );
}

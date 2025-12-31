import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    Check,
    Command,
    Calendar,
    Sparkles,
    Timer,
    Bot,
    CreditCard,
    Shield,
    Lock,
    Zap,
    LineChart,
    Bell,
    Globe,
    Menu,
    X,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import FinanceSection from "../components/FinanceSection";

/**
 * Pricilia(Growth) — Landing Page (Static V3.1)
 * Self-contained version with internal UI components.
 */

// --- UTILS ---
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function useLockBodyScroll(locked) {
    useEffect(() => {
        if (!locked) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [locked]);
}

// --- UI COMPONENTS ---
const Button = React.forwardRef(({ className, variant = "primary", size = "default", ...props }, ref) => {
    const variants = {
        primary: "bg-white text-black hover:bg-white/90",
        secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
        ghost: "hover:bg-white/10 text-white",
        black: "bg-black text-white hover:bg-black/90",
        yellow: "bg-[#f4f46a] text-black hover:bg-[#f4f46a]/90",
    };
    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    };
    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant] || variants.primary,
                sizes[size] || sizes.default,
                className
            )}
            {...props}
        />
    );
});
Button.displayName = "Button";

const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

function Pill({ children, className }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                "bg-white/5 border-white/10 text-white/80",
                className
            )}
        >
            {children}
        </span>
    );
}

function Section({ id, eyebrow, title, highlight, subtitle, children, className }) {
    return (
        <section id={id} className={cn("relative py-16 md:py-24", className)}>
            <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
                {(eyebrow || title) && (
                    <div className="mb-10 md:mb-14">
                        {eyebrow && (
                            <div className="mb-3">
                                <Pill className="bg-white/10 border-white/10 text-white/80">{eyebrow}</Pill>
                            </div>
                        )}
                        {title && (
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                                {title} {highlight && <span className="text-[#f4f46a]">{highlight}</span>}
                            </h2>
                        )}
                        {subtitle && <p className="mt-4 max-w-2xl text-base md:text-lg text-white/60">{subtitle}</p>}
                    </div>
                )}

                {children}
            </div>
        </section>
    );
}

function NavLink({ href, children }) {
    return (
        <a
            href={href}
            className={cn(
                "text-sm font-semibold text-white/70 hover:text-white transition-colors",
                "px-3 py-2 rounded-full hover:bg-white/5"
            )}
        >
            {children}
        </a>
    );
}

function DemoCard({ icon: Icon, label, title, lines = 2, accent = false, className, children }) {
    return (
        <Card
            className={cn(
                "rounded-[2rem] border",
                accent
                    ? "bg-[#f4f46a] text-black border-black/10"
                    : "bg-white/5 text-white border-white/10",
                "shadow-2xl",
                className
            )}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", accent ? "bg-black/10" : "bg-white/10")}>
                        <Icon className={cn("h-5 w-5", accent ? "text-black" : "text-white")} />
                    </div>
                    {label && (
                        <span className={cn("text-xs font-bold tracking-widest uppercase", accent ? "text-black/60" : "text-white/50")}>
                            {label}
                        </span>
                    )}
                </div>
                <div className="mt-5">
                    <div className={cn("text-lg font-extrabold", accent ? "text-black" : "text-white")}>{title}</div>
                    {children ? (
                        <div className={cn("mt-3", accent ? "text-black/70" : "text-white/60")}>{children}</div>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {Array.from({ length: lines }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-3 rounded-full",
                                        accent ? "bg-black/10" : "bg-white/10",
                                        i === 0 ? "w-4/5" : "w-3/5"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function GlassPanel({ className, children }) {
    return (
        <div
            className={cn(
                "rounded-[2.25rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl",
                className
            )}
        >
            {children}
        </div>
    );
}

function CommandKDemo({ open, onClose }) {
    useLockBodyScroll(open);

    const [q, setQ] = useState("standup");
    const results = useMemo(() => {
        const all = [
            { type: "event", title: "Weekly Standup", hint: "Dec 29 · 09:00", action: "Focus in Day view" },
            { type: "event", title: "React deep work", hint: "Dec 29 · 08:00", action: "Focus in Day view" },
            { type: "action", title: "Create event", hint: "Schedule or deadline", action: "Open create" },
            { type: "page", title: "Finance Tracker", hint: "Recurring bills", action: "Open page" },
        ];
        const qq = q.trim().toLowerCase();
        if (!qq) return all;
        return all.filter((r) => (r.title + " " + r.hint).toLowerCase().includes(qq)).slice(0, 5);
    }, [q]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[60]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-black/70" onClick={onClose} />

                    <motion.div
                        className="absolute left-1/2 top-20 w-[92vw] max-w-2xl -translate-x-1/2"
                        initial={{ y: 20, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 16, opacity: 0, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    >
                        <div className="rounded-[1.5rem] border border-white/10 bg-[#0f0f0f] shadow-2xl overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Command className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold tracking-widest uppercase text-white/50">Command Palette</div>
                                    <div className="text-sm font-semibold text-white">Search events, goals, pages</div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4 text-white/70" />
                                </button>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                    <span className="text-white/40 text-sm">⌘</span>
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30"
                                        placeholder="Type to search…"
                                        autoFocus
                                    />
                                    <span className="text-xs font-semibold text-white/40">Enter</span>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {results.map((r, idx) => (
                                        <button
                                            key={idx}
                                            onClick={onClose}
                                            className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-bold text-white">{r.title}</div>
                                                    <div className="text-xs text-white/50 mt-0.5">{r.hint}</div>
                                                </div>
                                                <div className="text-xs font-semibold text-white/60">{r.action}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-5 text-xs text-white/40">
                                    Tip: Press <span className="font-mono text-white/70">⌘K</span> anywhere.
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 text-center text-xs text-white/40">
                            This is a UI demo for landing. Wire it to your real command palette later.
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function FeatureGrid() {
    const features = [
        {
            icon: Calendar,
            title: "Smart Sync",
            desc: "Connect your university iCal once. School + Personal events unified in one timeline.",
            bullets: ["Normalized tags", "Always up to date", "Clean schedule view"],
        },
        {
            icon: Command,
            title: "Command ⌘K",
            desc: "Search events, goals, and pages. Jump to Day view and focus instantly.",
            bullets: ["Find anything", "Create events fast", "Keyboard-first flow"],
        },
        {
            icon: Sparkles,
            title: "Extra*Up Goals",
            desc: "Long-term goals with weekly rhythm. Get alerts when you're behind or overloaded.",
            bullets: ["Weekly commitment", "Progress tracking", "Rhythm alerts"],
        },
        {
            icon: Timer,
            title: "Deadline Timer",
            desc: "Countdown for your next milestone + next class countdown from your calendar.",
            bullets: ["Fast edits", "Location extraction", "Always visible"],
        },
        {
            icon: Bot,
            title: "HowieAI",
            desc: "Not a chatbot. An agent that schedules sessions and creates events.",
            bullets: ["Context-aware", "Action buttons", "Weekly planning"],
        },
        {
            icon: CreditCard,
            title: "Finance Tracker",
            desc: "Manual input + recurring bills. See what's coming and what's draining your month.",
            bullets: ["Recurring (weekly/monthly)", "Upcoming charges", "Budget alerts"],
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
                <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                >
                    <Card className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl h-full">
                        <CardContent className="p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <f.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-lg font-extrabold text-white">{f.title}</div>
                                    <div className="text-sm text-white/60 leading-tight">{f.desc}</div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-2 mt-auto pt-4">
                                {f.bullets.map((b) => (
                                    <div key={b} className="flex items-center gap-2 text-sm text-white/70">
                                        <span className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <Check className="h-3 w-3 text-white/80" />
                                        </span>
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

function Pricing() {
    const { login } = useAuth();

    const tiers = [
        {
            name: "Free",
            price: "$0",
            note: "For getting started",
            features: ["Smart Sync (basic)", "Schedules", "Deadline Timer", "Command ⌘K (basic search)"],
            cta: "Start for free",
            highlight: false,
        },
        {
            name: "Student Pro",
            price: "$6",
            note: "per month",
            features: [
                "HowieAI actions",
                "Finance Tracker (manual + recurring)",
                "Extra*Up rhythm alerts",
                "Advanced insights",
                "Priority roadmap access",
            ],
            cta: "Get Student Pro",
            highlight: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiers.map((t) => (
                <Card
                    key={t.name}
                    className={cn(
                        "rounded-[2rem] border shadow-2xl",
                        t.highlight ? "bg-[#f4f46a] text-black border-black/10" : "bg-white/5 text-white border-white/10"
                    )}
                >
                    <CardContent className="p-7 h-full flex flex-col">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className={cn("text-lg font-black", t.highlight ? "text-black" : "text-white")}>{t.name}</div>
                                <div className={cn("mt-1 text-sm", t.highlight ? "text-black/60" : "text-white/60")}>{t.note}</div>
                            </div>
                            <div className={cn("text-3xl font-black", t.highlight ? "text-black" : "text-white")}>{t.price}</div>
                        </div>

                        <div className="mt-6 space-y-2 mb-8">
                            {t.features.map((f) => (
                                <div key={f} className={cn("flex items-center gap-2 text-sm", t.highlight ? "text-black/80" : "text-white/70")}>
                                    <Check className={cn("h-4 w-4", t.highlight ? "text-black" : "text-white/80")} />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <Button
                                onClick={() => login()}
                                className={cn(
                                    "w-full rounded-2xl h-12 font-extrabold text-base",
                                    t.highlight ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"
                                )}
                            >
                                {t.cta}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <div className={cn("mt-3 text-xs text-center", t.highlight ? "text-black/60" : "text-white/40")}>
                                Student discount available · Cancel anytime
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function FAQ() {
    const faqs = [
        {
            q: "How does recurring billing work in Finance Tracker?",
            a: "Add a recurring item (weekly/monthly/yearly) with amount and next charge date. Pricilia surfaces upcoming charges so surprises disappear.",
        },
        {
            q: "Can I use Pricilia without connecting my university calendar?",
            a: "Yes. You can manually create events and still use goals, timers, ⌘K search, and Finance Tracker. Smart Sync is optional.",
        },
        {
            q: "What does ⌘K search include?",
            a: "It searches across events, goals, and pages. You can jump straight into Day view and focus an event.",
        },
        {
            q: "Is HowieAI just a chatbot?",
            a: "No. Howie returns actionable plans with buttons like create event, schedule session, and open schedule views.",
        },
        {
            q: "Do you support reminders?",
            a: "You can add reminders for recurring bills and key deadlines. Notifications can expand as the roadmap progresses.",
        },
        {
            q: "How do usage limits work for HowieAI?",
            a: "Set a weekly quota per user (e.g., 20 asks/week) to control costs and keep the assistant focused.",
        },
        {
            q: "Can I export my data later?",
            a: "Export/import is planned so you can back up events, goals, and finance entries.",
        },
        {
            q: "Do you sell or track user data?",
            a: "No. Privacy is a core principle: your data is yours.",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((f, idx) => (
                <Card key={idx} className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-6">
                        <div className="text-base font-extrabold text-white">{f.q}</div>
                        <div className="mt-2 text-sm text-white/60">{f.a}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black">
            <div className="mx-auto w-full max-w-6xl px-5 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div>
                        <div className="font-serif font-black text-xl text-white tracking-tight select-none">
                            Pricilia(Growth)
                            <span className="ml-1 align-top text-[10px] font-sans font-bold text-[#f4f46a]">™</span>
                        </div>
                        <p className="mt-3 text-sm text-white/50">
                            The all-in-one operating system for students and high achievers.
                        </p>
                    </div>

                    <div>
                        <div className="text-sm font-extrabold text-white">Product</div>
                        <div className="mt-3 space-y-2 text-sm text-white/50">
                            <a className="block hover:text-white" href="#overview">Daily Overview</a>
                            <a className="block hover:text-white" href="#howie">Howie AI</a>
                            <a className="block hover:text-white" href="#goals">Extra*Up Goals</a>
                            <a className="block hover:text-white" href="#finance">Finance Tracker</a>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-extrabold text-white">Company</div>
                        <div className="mt-3 space-y-2 text-sm text-white/50">
                            <a className="block hover:text-white" href="#">About</a>
                            <a className="block hover:text-white" href="#">Blog</a>
                            <a className="block hover:text-white" href="#">Careers</a>
                            <a className="block hover:text-white" href="#">Contact</a>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-extrabold text-white">Legal</div>
                        <div className="mt-3 space-y-2 text-sm text-white/50">
                            <a className="block hover:text-white" href="#">Privacy Policy</a>
                            <a className="block hover:text-white" href="#">Terms</a>
                            <a className="block hover:text-white" href="#">Security</a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="text-xs text-white/40">© {new Date().getFullYear()} Pricilia(Growth). All rights reserved.</div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <Shield className="h-4 w-4" />
                        <span>Private by default</span>
                        <span className="mx-1">·</span>
                        <Lock className="h-4 w-4" />
                        <span>No tracking</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// --- NEW HERO & UTILS (V3.2) ---

function useNow(tickMs = 1000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), tickMs);
        return () => clearInterval(id);
    }, [tickMs]);
    return now;
}

function formatHMS(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

function AnimatedNumber({ value, suffix = "", className }) {
    const reduce = useReducedMotion();
    const [display, setDisplay] = useState(value);

    useEffect(() => {
        if (reduce) {
            setDisplay(value);
            return;
        }
        const start = display;
        const end = value;
        const dur = 550;
        const t0 = performance.now();

        let raf = 0;
        const loop = (t) => {
            const p = clamp((t - t0) / dur, 0, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const next = start + (end - start) * eased;
            setDisplay(next);
            if (p < 1) raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const txt = Number.isFinite(display) ? Math.round(display) : value;

    return (
        <span className={cn("tabular-nums", className)}>
            {txt}
            {suffix}
        </span>
    );
}

function MetricPill({ label, value, hint, tone = "neutral" }) {
    const tones = {
        neutral: "bg-white/5 border-white/10 text-white/80",
        good: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
        warn: "bg-amber-500/10 border-amber-500/20 text-amber-200",
        bad: "bg-rose-500/10 border-rose-500/20 text-rose-200",
    };

    return (
        <div className={cn("rounded-full border px-3 py-2", tones[tone] || tones.neutral)}>
            <div className="flex items-baseline gap-2">
                <div className="text-[11px] font-bold tracking-widest uppercase opacity-70">{label}</div>
                <div className="text-sm font-extrabold">{value}</div>
            </div>
            {hint ? <div className="text-[11px] opacity-70 mt-0.5">{hint}</div> : null}
        </div>
    );
}

function StatusChip({ status }) {
    const map = {
        onTrack: { text: "ON TRACK", cls: "bg-emerald-500/15 border-emerald-500/25 text-emerald-200" },
        behind: { text: "BEHIND", cls: "bg-amber-500/15 border-amber-500/25 text-amber-200" },
        overloaded: { text: "OVERLOADED", cls: "bg-rose-500/15 border-rose-500/25 text-rose-200" },
    };
    const s = map[status] || map.onTrack;
    return (
        <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold tracking-widest", s.cls)}>
            {s.text}
        </span>
    );
}

function Hero({ onPrimary, onDemo }) {
    const reduce = useReducedMotion();

    // 你之後接真資料：把這裡換成從 schedule_events / goals / finance 聚合的值即可
    const today = useMemo(() => {
        // fake but believable
        const focusBlocks = 2;
        const schoolHours = 3.5;
        const recoveryMins = 520;
        const loadScore = 68; // 0~100
        return { focusBlocks, schoolHours, recoveryMins, loadScore };
    }, []);

    const todayStatus = useMemo(() => {
        // 你的規則：onTrack | behind | overloaded
        if (today.loadScore >= 82) return "overloaded";
        if (today.loadScore <= 45) return "behind";
        return "onTrack";
    }, [today.loadScore]);

    // Upcoming ticker demo：假設下一堂在 14:00
    const now = useNow(1000);
    const nextStart = useMemo(() => {
        const d = new Date();
        d.setHours(14, 0, 0, 0);
        const t = d.getTime();
        // 如果現在已過 14:00，就顯示明天 14:00
        return t <= now ? t + 24 * 3600 * 1000 : t;
    }, [now]);

    const msLeft = nextStart - now;
    const ticker = formatHMS(msLeft);

    // Parallax header glow
    const { scrollYProgress } = useScroll();
    const glowY = useTransform(scrollYProgress, [0, 0.12], [0, 40]);
    const glowOpacity = useTransform(scrollYProgress, [0, 0.12], [0.55, 0]);

    return (
        <section className="relative overflow-hidden">
            {/* background */}
            <div className="absolute inset-0">
                <motion.div
                    style={{ y: glowY, opacity: glowOpacity }}
                    className="absolute -top-32 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
                />
                <div className="absolute -bottom-40 left-[12%] h-[420px] w-[420px] rounded-full bg-[#f4f46a]/18 blur-3xl opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-5 md:px-8 pt-14 md:pt-20 pb-14 md:pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* left */}
                    <div className="lg:col-span-7">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusChip status={todayStatus} />
                            <Pill className="bg-white/10 border-white/10 text-white/80">
                                <span className="h-2 w-2 rounded-full bg-[#f4f46a]" /> DAILY COMMAND CENTER
                            </Pill>
                            <Pill className="bg-white/10 border-white/10 text-white/70">Plan: FREE</Pill>
                        </div>

                        <motion.h1
                            initial={reduce ? false : { opacity: 0, y: 10 }}
                            animate={reduce ? undefined : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-[0.95]"
                        >
                            Today is manageable.
                            <br />
                            Make it <span className="text-[#f4f46a]">inevitable</span>.
                        </motion.h1>

                        <div className="mt-5 text-base md:text-lg text-white/60 max-w-2xl leading-relaxed">
                            No marketing fluff. Just numbers you can act on — load, focus, school hours, recovery windows, and what’s next.
                        </div>

                        {/* daily score strip */}
                        <motion.div
                            initial={reduce ? false : { opacity: 0, y: 12 }}
                            animate={reduce ? undefined : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.06 }}
                            className="mt-7 flex flex-wrap gap-2"
                        >
                            <MetricPill
                                label="Today load"
                                value={<AnimatedNumber value={today.loadScore} suffix="%" className="font-extrabold" />}
                                hint={todayStatus === "overloaded" ? "Protect energy" : todayStatus === "behind" ? "Start small" : "Keep momentum"}
                                tone={todayStatus === "overloaded" ? "bad" : todayStatus === "behind" ? "warn" : "good"}
                            />
                            <MetricPill
                                label="Focus blocks"
                                value={
                                    <span className="font-extrabold">
                                        <AnimatedNumber value={today.focusBlocks} /> blocks
                                    </span>
                                }
                                hint="Deep work units"
                            />
                            <MetricPill
                                label="School hours"
                                value={
                                    <span className="font-extrabold tabular-nums">
                                        {today.schoolHours.toFixed(1)}h
                                    </span>
                                }
                                hint="From schedule"
                            />
                            <MetricPill
                                label="Recovery"
                                value={
                                    <span className="font-extrabold tabular-nums">
                                        {Math.floor(today.recoveryMins / 60)}h {String(today.recoveryMins % 60).padStart(2, "0")}m
                                    </span>
                                }
                                hint="Best gap today"
                                tone={today.recoveryMins >= 360 ? "good" : "neutral"}
                            />
                        </motion.div>

                        {/* actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={onPrimary}
                                className="rounded-full h-12 px-7 bg-[#f4f46a] text-black hover:bg-[#f4f46a]/90 font-extrabold text-base"
                            >
                                Start for free <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                className="rounded-full h-12 px-7 bg-white/10 text-white hover:bg-white/15 border border-white/10 font-bold"
                                onClick={onDemo}
                            >
                                Watch 45s demo
                            </Button>
                        </div>

                        {/* micro trust row */}
                        <div className="mt-10 flex flex-wrap gap-2">
                            <Pill><Zap className="h-4 w-4" /> Fast capture</Pill>
                            <Pill><Shield className="h-4 w-4" /> Private by default</Pill>
                            <Pill><Bell className="h-4 w-4" /> Recurring alerts</Pill>
                            <Pill><Command className="h-4 w-4" /> ⌘K navigation</Pill>
                        </div>
                    </div>

                    {/* right: command center preview */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
                            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 240, damping: 22 }}
                            className="relative"
                        >
                            {/* outer glow frame */}
                            <div className="absolute -inset-3 rounded-[2.25rem] bg-[#f4f46a]/20 blur-2xl opacity-70" />

                            <Card className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-xs font-bold tracking-widest uppercase text-white/50">Next Up</div>
                                            <div className="mt-1 text-lg font-extrabold text-white">Managerial Accounting</div>
                                            <div className="mt-1 text-sm text-white/60">Today · 14:00 · Amphithéâtre</div>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                                            <div className="text-[10px] font-bold tracking-widest uppercase text-white/40">Starts in</div>

                                            {/* ticker: tabular-nums, no layout shift */}
                                            <div className="mt-0.5 text-xl font-black text-white tabular-nums leading-none">
                                                <AnimatePresence mode="popLayout">
                                                    <motion.span
                                                        key={ticker}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -6 }}
                                                        transition={{ duration: 0.18 }}
                                                        className="inline-block"
                                                    >
                                                        {ticker}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    {/* actionable strip */}
                                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Bot size={14} className="text-[#f4f46a]" />
                                            <div className="text-xs text-white/50">Howie suggests</div>
                                        </div>
                                        <div className="text-sm font-semibold text-white">
                                            Schedule a 90 min focus block before class.
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button
                                                variant="black"
                                                className="rounded-xl h-10 px-4 text-sm font-extrabold"
                                                onClick={onPrimary}
                                            >
                                                Start focus <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="rounded-xl h-10 px-4 text-sm font-bold bg-white/10 text-white border border-white/10"
                                                onClick={onDemo}
                                            >
                                                Ask HowieAI
                                            </Button>
                                        </div>
                                    </div>

                                    {/* mini timeline */}
                                    <div className="mt-5 space-y-2">
                                        {[
                                            { t: "09:00", name: "Deep work", done: true },
                                            { t: "14:00", name: "Managerial Accounting", active: true },
                                            { t: "18:30", name: "Gym", tag: "Personal" },
                                        ].map((x, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition",
                                                    "hover:bg-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn("text-xs font-mono tabular-nums", x.active ? "text-[#f4f46a]" : "text-white/60")}>
                                                        {x.t}
                                                    </div>
                                                    <div className={cn("text-sm font-semibold truncate", x.done ? "text-white/40 line-through" : "text-white")}>
                                                        {x.name}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {x.tag ? (
                                                        <span className="text-[11px] font-bold rounded-full px-2 py-1 bg-white/10 border border-white/10 text-white/70">
                                                            {x.tag}
                                                        </span>
                                                    ) : null}
                                                    {x.active ? (
                                                        <span className="text-[11px] font-extrabold rounded-full px-2 py-1 bg-[#f4f46a]/20 border border-[#f4f46a]/25 text-[#f4f46a]">
                                                            NOW
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                {/* footer micro detail */}
                                <div className="px-6 py-4 border-t border-white/10 bg-black/20">
                                    <div className="flex items-center justify-between text-xs text-white/50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
                                            <span>Synced 2 calendars · Updated 1m ago</span>
                                        </div>
                                        <span className="tabular-nums">Latency 82ms</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                <div className="mt-14 border-t border-white/10 pt-8 text-white/50 text-sm font-medium">
                    Trusted by students juggling lectures, projects, and life — with a dashboard that actually tells you what to do next.
                </div>
            </div>
        </section>
    );
}

// --- MAIN PAGE ---
export default function LandingPage() {
    const [demoOpen, setDemoOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            await login();
        } catch (e) {
            console.error("Login failed", e);
        }
    };

    const nav = [
        { label: "Product", href: "#product" },
        { label: "Methodology", href: "#workflow" },
        { label: "Pricing", href: "#pricing" },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#f4f46a] selection:text-black">
            <CommandKDemo open={demoOpen} onClose={() => setDemoOpen(false)} />

            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
                <div className="mx-auto w-full max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="#" className="font-serif font-black text-xl tracking-tight select-none">
                            Pricilia(Growth)
                            <span className="ml-1 align-top text-[10px] font-sans font-bold text-[#f4f46a]">™</span>
                        </a>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        {nav.map((n) => (
                            <NavLink key={n.href} href={n.href}>
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => setDemoOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
                        >
                            <Command className="h-4 w-4" />
                            ⌘K Demo
                        </button>
                        <Button onClick={handleLogin} variant="ghost" className="rounded-full text-white/80 hover:text-white hover:bg-white/5">
                            Log in
                        </Button>
                        <Button onClick={handleLogin} className="rounded-full bg-white text-black hover:bg-white/90 font-extrabold">Sign up</Button>
                        <button
                            className="h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            aria-label="Language"
                            title="Language"
                        >
                            <Globe className="h-4 w-4 text-white/70" />
                        </button>
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setDemoOpen(true)}
                            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                            aria-label="Command demo"
                        >
                            <Command className="h-4 w-4 text-white/80" />
                        </button>
                        <button
                            onClick={() => setMobileNavOpen((v) => !v)}
                            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                            aria-label="Menu"
                        >
                            {mobileNavOpen ? <X className="h-4 w-4 text-white/80" /> : <Menu className="h-4 w-4 text-white/80" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileNavOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-white/10 overflow-hidden"
                        >
                            <div className="mx-auto w-full max-w-6xl px-5 py-4 flex flex-col gap-2">
                                {nav.map((n) => (
                                    <a
                                        key={n.href}
                                        href={n.href}
                                        onClick={() => setMobileNavOpen(false)}
                                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80"
                                    >
                                        {n.label}
                                    </a>
                                ))}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Button onClick={handleLogin} variant="secondary" className="rounded-xl">Log in</Button>
                                    <Button onClick={handleLogin} className="rounded-xl bg-white text-black hover:bg-white/90 font-extrabold">Sign up</Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <Hero onPrimary={handleLogin} onDemo={() => setDemoOpen(true)} />

            <Section
                id="product"
                eyebrow="WHY PRICILIA"
                title="Your life isn’t messy."
                highlight="Your tools are."
                subtitle="Calendar split across platforms, goals without rhythm, money leaking from subscriptions. Pricilia turns all of it into a weekly system you can actually follow."
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { icon: Calendar, title: "Calendar chaos", desc: "School iCal here. Personal events there. Nothing feels complete." },
                        { icon: Sparkles, title: "Goals with no rhythm", desc: "You plan big, but weekly execution falls apart under real schedules." },
                        { icon: CreditCard, title: "Money leaks", desc: "Small daily spends + recurring subscriptions quietly drain your month." },
                    ].map((c, idx) => (
                        <Card key={idx} className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl h-full">
                            <CardContent className="p-6">
                                <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <c.icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="mt-4 text-lg font-extrabold text-white">{c.title}</div>
                                <div className="mt-2 text-sm text-white/60 leading-relaxed">{c.desc}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section
                id="overview"
                eyebrow="MODULES"
                title="Everything you need"
                highlight="to get ahead."
                subtitle="Schedules, goals, deadlines, an action-first AI, and a Finance Tracker designed for recurring life."
            >
                <FeatureGrid />
            </Section>

            <Section
                id="finance"
                eyebrow="FINANCE TRACKER"
                title="Manual input + recurring"
                highlight="Finance Tracker."
                subtitle="Track subscriptions, rent, phone plans, and weekly spends with predictable visibility."
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <DemoCard icon={CreditCard} label="NEW" title="Finance Tracker" accent className="lg:col-span-5 h-full">
                        <div className="text-sm">Fast entries and recurring rules.</div>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <div className="rounded-2xl bg-black/10 border border-black/10 p-4">
                                <div className="text-xs font-bold tracking-widest uppercase text-black/60">Upcoming</div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm font-extrabold">Phone plan</span>
                                    <span className="text-sm font-extrabold">$19</span>
                                </div>
                                <div className="mt-1 text-xs text-black/60">Renews tomorrow · Monthly</div>
                            </div>
                            <div className="rounded-2xl bg-black/10 border border-black/10 p-4">
                                <div className="text-xs font-bold tracking-widest uppercase text-black/60">This month</div>
                                <div className="mt-2 text-3xl font-black">$248</div>
                                <div className="mt-3 h-2 rounded-full bg-black/10 overflow-hidden">
                                    <div className="h-full w-[62%] bg-black/30" />
                                </div>
                                <div className="mt-2 text-xs text-black/60 flex justify-between">
                                    <span>Food · Transport · Study</span>
                                    <span>62% of budget</span>
                                </div>
                            </div>
                        </div>
                    </DemoCard>

                    <GlassPanel className="lg:col-span-7 p-7 h-full flex flex-col">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-xs font-bold tracking-widest uppercase text-white/50">What you get</div>
                                <div className="mt-1 text-2xl font-black text-white">Recurring-first system</div>
                                <div className="mt-3 text-sm text-white/60 max-w-xl leading-relaxed">
                                    Enter once, reuse forever. See upcoming charges and get soft budget alerts. A system designed to catch leaks before they happen.
                                </div>
                            </div>
                            <Pill className="bg-white/10 border-white/10">Alerts</Pill>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            {[
                                { icon: CreditCard, t: "Recurring items", d: "Weekly / monthly / yearly with next charge date." },
                                { icon: Bell, t: "Upcoming charges", d: "Next 7/30 days list so surprises disappear." },
                                { icon: LineChart, t: "Budget signals", d: "Soft warnings when you’re about to exceed a category." },
                                { icon: Shield, t: "Student-friendly", d: "Simple categories, clean summaries, fast add." },
                            ].map((x, i) => (
                                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <x.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-extrabold text-white">{x.t}</div>
                                        <div className="text-xs text-white/50 mt-1 leading-snug">{x.d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            </Section>

            <Section id="workflow" eyebrow="WORKFLOW" title="Life OS" highlight="as it should be." subtitle="Sync, plan, execute, repeat.">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <Card className="lg:col-span-5 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl h-full">
                        <CardContent className="p-7">
                            <div className="text-xs font-bold tracking-widest uppercase text-white/50">4 steps</div>
                            <div className="mt-2 text-2xl font-black text-white">How it works</div>
                            <div className="mt-6 space-y-3">
                                {["Connect your calendar", "Set goals + weekly commitment", "Track recurring expenses", "Use ⌘K or Howie to execute"].map((s, i) => (
                                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-extrabold shrink-0">{i + 1}</div>
                                        <div className="text-sm font-semibold text-white/80">{s}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-7 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl h-full">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold tracking-widest uppercase text-white/50">Principles</div>
                                    <div className="mt-2 text-2xl font-black text-white">Designed for execution</div>
                                </div>
                                <Pill className="bg-[#f4f46a]/10 border-[#f4f46a]/20 text-[#f4f46a]">Student-first</Pill>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: Zap, t: "Frictionless", d: "Capture tasks in seconds." },
                                    { icon: Command, t: "Time-saving", d: "Keyboard-first navigation." },
                                    { icon: Shield, t: "Private", d: "Your data is yours." },
                                    { icon: Bell, t: "Automation", d: "Recurring bills reduce mental load." },
                                ].map((x, i) => (
                                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                                <x.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-extrabold text-white">{x.t}</div>
                                                <div className="text-xs text-white/50 mt-1">{x.d}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Section>

            <Section id="pricing" eyebrow="PRICING" title="Ready to upgrade" highlight="your life?" subtitle="Start free. Upgrade when you want Howie actions and Finance insights.">
                <Pricing />
            </Section>

            <Section id="faq" eyebrow="FAQ" title="Questions," highlight="answered." subtitle="Clear answers for students who want a serious system.">
                <FAQ />
            </Section>

            <section className="relative py-20 md:py-28 border-t border-white/10 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f46a]/15 blur-3xl opacity-50" />
                </div>
                <div className="relative mx-auto w-full max-w-6xl px-5 md:px-8">
                    <div className="text-center">
                        <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white">Ready to upgrade your life?</h3>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={handleLogin} className="rounded-full h-12 px-8 bg-[#f4f46a] text-black hover:bg-[#f4f46a]/90 font-extrabold text-base transform hover:scale-105 transition-transform duration-200">Start for free</Button>
                            <Button
                                variant="secondary"
                                className="rounded-full h-12 px-8 bg-white/10 text-white hover:bg-white/15 border border-white/10 font-bold"
                                onClick={() => setDemoOpen(true)}
                            >
                                Try ⌘K demo
                            </Button>
                        </div>
                        <div className="mt-4 text-xs text-white/40 font-medium">No credit card required · Free for students</div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

import React, { useMemo, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import {
    LayoutGrid,
    CalendarDays,
    Target,
    Wallet,
    Home,
    Search,
    Settings,
    CreditCard,
    LogOut,
    ChevronDown,
    User,
} from "lucide-react";

import { useAuth } from '../context/AuthContext';
import { useHowieAI } from '../hooks/useHowieAI';
import HowieAIPanel from '../components/HowieAI/HowieAIPanel';
// import useSubscription from '../hooks/useSubscription'; 
import { usePlan } from '../hooks/usePlan';

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [params, setParams] = useSearchParams();

    // Integrated Hook Data
    const { currentUser, logout } = useAuth();
    // const sub = useSubscription(currentUser);
    const { plan: currentPlan } = usePlan();
    const howie = useHowieAI(currentUser);

    // Derived State
    const planLabel = (currentPlan === 'pro' || currentPlan === 'plus') ? currentPlan.toUpperCase() : "FREE";

    // Checkout Toast Logic
    useEffect(() => {
        const s = params.get("checkout");
        if (s === "success") {
            toast.success("Unlocked Plus Plan!");
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

    const onOpenCmdk = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));

    const nav = useMemo(
        () => [
            { label: "Overview", icon: LayoutGrid, to: "/overview" },
            { label: "Schedule", icon: CalendarDays, to: "/schedule" },
            { label: "Goals", icon: Target, to: "/goals" },
            { label: "Finance", icon: Wallet, to: "/finance", badge: "Beta" },
            { label: "Chores", icon: Home, to: "/chores", badge: "Soon" },
        ],
        []
    );

    const account = useMemo(
        () => [
            { label: "Settings", icon: Settings, to: "/settings" },
            { label: "Billing", icon: CreditCard, to: "/billing" },
        ],
        []
    );

    const activePath = normalizePath(location.pathname);

    const title = useMemo(() => {
        const all = [...nav, ...account];
        const hit = all.find((x) => normalizePath(x.to) === activePath);
        return hit?.label ?? "Dashboard";
    }, [activePath, nav, account]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster position="top-center" richColors />

            <div className="grid grid-cols-[280px_1fr] min-h-screen">
                {/* Sidebar */}
                <aside className="bg-[#0b0f16] border-r border-white/5 hidden lg:block sticky top-0 h-screen overflow-y-auto">
                    <div className="h-full flex flex-col">
                        {/* Brand */}
                        <div className="px-5 pt-6 pb-5">
                            <div className="text-white font-semibold tracking-tight text-lg cursor-pointer" onClick={() => navigate('/')}>
                                Pricilia<span className="opacity-70">(Growth)</span>
                            </div>
                            <div className="mt-1 text-[11px] text-white/50 font-semibold tracking-[0.16em] uppercase">
                                Life OS
                            </div>
                        </div>

                        {/* Nav */}
                        <div className="flex-1 px-3 pb-4">
                            <SectionLabel text="Core" />
                            <div className="mt-2 space-y-1">
                                {nav.map((item) => (
                                    <NavItem
                                        key={item.to}
                                        active={normalizePath(item.to) === activePath}
                                        icon={item.icon}
                                        label={item.label}
                                        badge={item.badge}
                                        onClick={() => navigate(item.to)}
                                    />
                                ))}
                            </div>

                            <div className="mt-6" />

                            <SectionLabel text="Account" />
                            <div className="mt-2 space-y-1">
                                {account.map((item) => (
                                    <NavItem
                                        key={item.to}
                                        active={normalizePath(item.to) === activePath}
                                        icon={item.icon}
                                        label={item.label}
                                        onClick={() => navigate(item.to)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Plan Card */}
                        <div className="px-3 pb-4">
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-white/50">
                                        Plan
                                    </div>
                                    <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-white">
                                        {planLabel}
                                    </div>
                                </div>

                                <div className="mt-2 text-sm font-semibold text-white/80 leading-snug">
                                    Finance + Recurring bills
                                </div>

                                <button
                                    onClick={() => navigate("/pricing")}
                                    className="mt-3 w-full rounded-xl bg-white text-black text-[11px] font-extrabold uppercase tracking-[0.18em] py-2.5 hover:opacity-90 transition"
                                >
                                    Upgrade
                                </button>

                                <button
                                    onClick={() => navigate("/billing")}
                                    className="mt-2 w-full rounded-xl border border-white/10 text-white/80 text-[11px] font-extrabold uppercase tracking-[0.18em] py-2.5 hover:bg-white/5 transition"
                                >
                                    Manage billing
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <div className="min-h-screen flex flex-col w-full min-w-0">
                    {/* Floating Topbar */}
                    <div className="sticky top-0 z-40">
                        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 pt-5">
                            <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                                <div className="h-14 px-4 flex items-center justify-between gap-4">
                                    {/* Title */}
                                    <div className="min-w-0 flex items-center gap-3">
                                        {/* Mobile Menu Toggle (can add later if needed, for now desktop focus) */}
                                        <div className="lg:hidden">
                                            {/* Placeholder for hamburger if we want mobile support, or just simple title */}
                                        </div>
                                        <div>
                                            <div className="text-sm font-extrabold text-slate-900 truncate">
                                                {title}
                                            </div>
                                            <div className="text-[11px] font-semibold text-slate-500 truncate hidden md:block">
                                                {activePath}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Utilities */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={onOpenCmdk}
                                            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            <Search size={16} />
                                            Search
                                            <span className="ml-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-extrabold text-slate-500">
                                                ⌘K
                                            </span>
                                        </button>

                                        {/* Howie Trigger (Optional visual) */}
                                        {/* <button onClick={howie.toggle} ... /> */}

                                        {/* Avatar Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setMenuOpen((v) => !v)}
                                                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 hover:bg-slate-50 transition"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-extrabold">
                                                    {currentUser?.email?.[0].toUpperCase() || 'H'}
                                                </div>
                                                <ChevronDown size={16} className="text-slate-500" />
                                            </button>

                                            {menuOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-[80]"
                                                        onClick={() => setMenuOpen(false)}
                                                    />
                                                    <div className="absolute right-0 mt-2 z-[90] w-56 rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
                                                        <MenuItem
                                                            icon={User}
                                                            label="Profile"
                                                            onClick={() => {
                                                                setMenuOpen(false);
                                                                navigate("/settings");
                                                            }}
                                                        />
                                                        <MenuItem
                                                            icon={CreditCard}
                                                            label="Billing"
                                                            onClick={() => {
                                                                setMenuOpen(false);
                                                                navigate("/billing");
                                                            }}
                                                        />
                                                        <MenuItem
                                                            icon={Settings}
                                                            label="Settings"
                                                            onClick={() => {
                                                                setMenuOpen(false);
                                                                navigate("/settings");
                                                            }}
                                                        />
                                                        <div className="h-px bg-slate-100" />
                                                        <MenuItem
                                                            icon={LogOut}
                                                            label="Logout"
                                                            danger
                                                            onClick={() => {
                                                                setMenuOpen(false);
                                                                logout();
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page body */}
                    <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
                        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 pb-20">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            <HowieAIPanel
                isOpen={howie.isOpen}
                onClose={howie.close}
                controller={howie}
            />
        </div>
    );
}

/* helpers */
function normalizePath(p) {
    if (!p) return "/";
    const s = p.split("?")[0].split("#")[0];
    return s.endsWith("/") && s !== "/" ? s.slice(0, -1) : s;
}

function SectionLabel({ text }) {
    return (
        <div className="px-3">
            <div className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-white/35">
                {text}
            </div>
        </div>
    );
}

function NavItem({ active, icon: Icon, label, badge, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition",
                active
                    ? "bg-white/8 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/5",
            ].join(" ")}
        >
            <span
                className={[
                    "w-[2px] h-5 rounded-full",
                    active ? "bg-white" : "bg-transparent",
                ].join(" ")}
            />
            <Icon size={18} className={active ? "opacity-95" : "opacity-70"} />
            <span className="text-sm font-semibold">{label}</span>
            {badge && (
                <span className="ml-auto text-[10px] font-extrabold uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-white/10 text-white/75">
                    {badge}
                </span>
            )}
        </button>
    );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
    return (
        <button
            onClick={onClick}
            className={[
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition",
                danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50",
            ].join(" ")}
        >
            <Icon size={16} className={danger ? "opacity-90" : "opacity-75"} />
            {label}
        </button>
    );
}

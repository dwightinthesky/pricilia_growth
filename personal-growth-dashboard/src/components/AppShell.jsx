import React, { useMemo, useState } from "react";
import {
    LayoutGrid,
    CalendarDays,
    Target,
    Wallet,
    Home,
    Settings,
    CreditCard,
    Search,
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";

/**
 * AppShell
 * - Sidebar: primary navigation (CORE + ACCOUNT)
 * - TopBar: page title + cmdk + avatar menu
 * - Main: scroll container
 *
 * Props:
 * - children
 * - activeKey: string (e.g. "overview", "schedule", ...)
 * - title: string (TopBar title)
 * - subtitle: string (optional)
 * - planLabel: string (e.g. "FREE", "PLUS", "PRO")
 * - onUpgrade: () => void
 * - onNavigate: (key) => void
 * - onSearch: () => void
 * - onOpenProfile/onOpenSettings/onOpenBilling/onLogout: callbacks
 */
export default function AppShell({
    children,
    activeKey = "overview",
    title = "Overview",
    subtitle,
    planLabel = "FREE",
    onUpgrade,
    onNavigate,
    onSearch,
    onOpenProfile,
    onOpenSettings,
    onOpenBilling,
    onLogout,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const nav = useMemo(
        () => ({
            core: [
                { key: "overview", label: "Overview", icon: LayoutGrid },
                { key: "schedule", label: "Schedule", icon: CalendarDays },
                { key: "goals", label: "Goals", icon: Target },
                { key: "finance", label: "Finance", icon: Wallet, badge: "Beta" },
                { key: "chores", label: "Chores", icon: Home, badge: "Soon" },
            ],
            account: [
                { key: "settings", label: "Settings", icon: Settings },
                { key: "billing", label: "Billing", icon: CreditCard },
            ],
        }),
        []
    );

    const handleNav = (key) => {
        onNavigate?.(key);
        setMobileOpen(false);
    };

    const SidebarContent = (
        <div className="h-full flex flex-col">
            {/* Brand */}
            <div className="px-5 pt-6 pb-5">
                <div className="text-white font-semibold tracking-tight text-lg">
                    Pricilia<span className="opacity-70">(Growth)</span>
                </div>
                <div className="mt-1 text-[11px] text-white/50 font-semibold tracking-[0.16em] uppercase">
                    Life OS
                </div>
            </div>

            {/* Sections */}
            <div className="flex-1 px-3 pb-4">
                <SectionLabel text="Core" />
                <nav className="mt-2 space-y-1">
                    {nav.core.map((item) => (
                        <NavItem
                            key={item.key}
                            active={activeKey === item.key}
                            icon={item.icon}
                            label={item.label}
                            badge={item.badge}
                            onClick={() => handleNav(item.key)}
                        />
                    ))}
                </nav>

                <div className="mt-6" />
                <SectionLabel text="Account" />
                <nav className="mt-2 space-y-1">
                    {nav.account.map((item) => (
                        <NavItem
                            key={item.key}
                            active={activeKey === item.key}
                            icon={item.icon}
                            label={item.label}
                            onClick={() => handleNav(item.key)}
                        />
                    ))}
                </nav>
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
                        Unlock Finance + Recurring
                    </div>

                    <button
                        onClick={onUpgrade}
                        className="mt-3 w-full rounded-xl bg-white text-black text-[11px] font-extrabold uppercase tracking-[0.18em] py-2.5 hover:opacity-90 transition"
                    >
                        Upgrade
                    </button>

                    <button
                        onClick={onOpenBilling}
                        className="mt-2 w-full rounded-xl border border-white/10 text-white/80 text-[11px] font-extrabold uppercase tracking-[0.18em] py-2.5 hover:bg-white/5 transition"
                    >
                        Manage billing
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop grid */}
            <div className="hidden lg:grid lg:grid-cols-[280px_1fr] min-h-screen">
                {/* Sidebar */}
                <aside className="bg-[#0b0f16] border-r border-white/5">
                    {SidebarContent}
                </aside>

                {/* Main */}
                <div className="min-h-screen flex flex-col">
                    <TopBar
                        title={title}
                        subtitle={subtitle}
                        onSearch={onSearch}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                        onOpenBilling={onOpenBilling}
                        onLogout={onLogout}
                    />
                    <main className="flex-1 overflow-y-auto">
                        <div className="mx-auto w-full max-w-6xl px-6 py-6">{children}</div>
                    </main>
                </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden min-h-screen flex flex-col">
                <div className="bg-white border-b border-slate-200">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]"
                        >
                            Menu
                        </button>
                        <div className="text-sm font-extrabold text-slate-900">Pricilia</div>
                        <button
                            onClick={onSearch}
                            className="rounded-xl border border-slate-200 px-3 py-2"
                            aria-label="Search"
                        >
                            <Search size={16} />
                        </button>
                    </div>
                </div>

                <TopBar
                    title={title}
                    subtitle={subtitle}
                    onSearch={onSearch}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    onOpenProfile={onOpenProfile}
                    onOpenSettings={onOpenSettings}
                    onOpenBilling={onOpenBilling}
                    onLogout={onLogout}
                    compact
                />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-6xl px-4 py-5">{children}</div>
                </main>

                {/* Mobile drawer */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-[100]">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setMobileOpen(false)}
                        />
                        <div className="absolute left-0 top-0 bottom-0 w-[82%] max-w-[320px] bg-[#0b0f16] shadow-2xl">
                            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                                <div className="text-white font-semibold">
                                    Pricilia<span className="opacity-70">(Growth)</span>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="text-white/60 text-xs font-extrabold uppercase tracking-[0.18em]"
                                >
                                    Close
                                </button>
                            </div>
                            {SidebarContent}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
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
            <span className={["w-[2px] h-5 rounded-full", active ? "bg-white" : "bg-transparent"].join(" ")} />
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

function TopBar({
    title,
    subtitle,
    onSearch,
    menuOpen,
    setMenuOpen,
    onOpenProfile,
    onOpenSettings,
    onOpenBilling,
    onLogout,
    compact = false,
}) {
    return (
        <header className="bg-white border-b border-slate-200">
            <div className={["mx-auto w-full max-w-6xl", compact ? "px-4" : "px-6"].join(" ")}>
                <div className="h-16 flex items-center justify-between gap-4">
                    {/* Left: Title */}
                    <div className="min-w-0">
                        <div className="text-lg font-extrabold text-slate-900 truncate">
                            {title}
                        </div>
                        {subtitle ? (
                            <div className="text-xs font-semibold text-slate-500 truncate">
                                {subtitle}
                            </div>
                        ) : null}
                    </div>

                    {/* Right: Search + Avatar */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onSearch}
                            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50 transition"
                        >
                            <Search size={16} />
                            <span>Search</span>
                            <span className="ml-2 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-extrabold text-slate-500">
                                ⌘K
                            </span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 hover:bg-slate-50 transition"
                            >
                                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-extrabold">
                                    H
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
                                                onOpenProfile?.();
                                            }}
                                        />
                                        <MenuItem
                                            icon={CreditCard}
                                            label="Billing"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onOpenBilling?.();
                                            }}
                                        />
                                        <MenuItem
                                            icon={Settings}
                                            label="Settings"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onOpenSettings?.();
                                            }}
                                        />
                                        <div className="h-px bg-slate-100" />
                                        <MenuItem
                                            icon={LogOut}
                                            label="Logout"
                                            danger
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onLogout?.();
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
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

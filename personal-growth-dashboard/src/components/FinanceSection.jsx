import React, { useMemo, useState } from "react";
import { ArrowRight, Repeat2, PencilLine, Sparkles, Wallet, BadgeEuro } from "lucide-react";

function formatMoney(n, currency = "EUR") {
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
    } catch {
        return `€${n.toFixed(2)}`;
    }
}

function Pill({ children }) {
    return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            {children}
        </span>
    );
}

function Card({ className = "", children }) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-white/95 shadow-card ${className}`}>
            {children}
        </div>
    );
}

/** ---- Demo Data (Static) ---- **/
const DEMO = {
    currency: "EUR",
    entries: [
        { id: "e1", title: "Lunch", amount: 12.5, date: "Today" },
        { id: "e2", title: "Metro", amount: 2.15, date: "Today" },
        { id: "e3", title: "Groceries", amount: 34.2, date: "Yesterday" },
    ],
    recurring: [
        { id: "r1", title: "Rent", amount: 650, cadence: "Monthly", next: "Jan 1" },
        { id: "r2", title: "Spotify", amount: 9.99, cadence: "Monthly", next: "Jan 3" },
        { id: "r3", title: "Phone", amount: 25, cadence: "Monthly", next: "Jan 6" },
        { id: "r4", title: "Gym", amount: 39, cadence: "Monthly", next: "Jan 10" },
    ],
};

function calcMonthlyFixed(recurring) {
    // demo 先只做 monthly；之後你加 weekly/yearly 可以換算成 monthly
    return recurring.reduce((sum, x) => sum + (x.amount || 0), 0);
}

function calcMonthlyBurn(monthlyFixed, recentDailyAvg) {
    // 簡化：月固定 + 日均*30
    return monthlyFixed + recentDailyAvg * 30;
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

/** ---- UI Blocks ---- **/
function FinanceHeader() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <Pill>✅ Manual input</Pill>
                <Pill>🔁 Recurring bills</Pill>
                <Pill>📊 Monthly burn rate</Pill>
                <Pill>🤖 Howie-aware</Pill>
            </div>

            <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    Finance Tracker
                    <span className="block text-white/50 text-base md:text-lg font-semibold mt-2">
                        Clarity over your money — without spreadsheets.
                    </span>
                </h2>
                <p className="mt-4 text-white/60 leading-relaxed">
                    For students, professionals, and anyone with recurring bills.
                    Track spending, recurring costs, and your monthly burn rate — so you always know where you stand.
                </p>
            </div>
        </div>
    );
}

function ManualInputDemo({ currency }) {
    const [text, setText] = useState("Lunch - 12.50");
    const [added, setAdded] = useState(false);

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <PencilLine size={16} />
                        Log anything in seconds
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                        No category anxiety. Just type, press Enter, done.
                    </p>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Frictionless</span>
                    <span className="h-2 w-2 rounded-full bg-slate-900/20" />
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Quick entry
                        </div>
                        <input
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setAdded(false);
                            }}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                            placeholder="e.g. Coffee - 3.20"
                        />
                        <button
                            onClick={() => setAdded(true)}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                        >
                            Add entry <ArrowRight size={14} />
                        </button>

                        {added && (
                            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                                Added ✔ — shows up in your monthly burn rate automatically.
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Examples
                        </div>
                        <div className="space-y-2">
                            {DEMO.entries.map((x) => (
                                <div
                                    key={x.id}
                                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-200"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-900 truncate">{x.title}</div>
                                        <div className="text-[11px] font-semibold text-slate-500">{x.date}</div>
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">
                                        {formatMoney(x.amount, currency)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-[11px] font-semibold text-slate-500">
                            Tip: import bank statements later (roadmap).
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/** ✅ 2) Recurring Bills：可 demo 的 UI（核心） */
function RecurringBillsDemo({ currency }) {
    const [items, setItems] = useState(DEMO.recurring);

    const monthlyFixed = useMemo(() => calcMonthlyFixed(items), [items]);

    const addRecurring = () => {
        const id = `r-${Math.random().toString(16).slice(2)}`;
        setItems((prev) => [
            ...prev,
            { id, title: "New bill", amount: 12, cadence: "Monthly", next: "Jan 15" },
        ]);
    };

    const update = (id, patch) => {
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    };

    const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Repeat2 size={16} />
                        Recurring bills (the real money story)
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                        Rent, subscriptions, tuition — counted automatically every month. No re-entry.
                    </p>
                </div>

                <button
                    onClick={addRecurring}
                    className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                    + Add recurring
                </button>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8">
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                                Recurring list
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500">
                                Monthly fixed: <span className="text-slate-900 font-extrabold">{formatMoney(monthlyFixed, currency)}</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-200">
                            {items.map((x) => (
                                <div key={x.id} className="px-4 py-3 flex items-center gap-3">
                                    <input
                                        value={x.title}
                                        onChange={(e) => update(x.id, { title: e.target.value })}
                                        className="w-44 md:w-56 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">{currency === "EUR" ? "€" : ""}</span>
                                        <input
                                            value={x.amount}
                                            onChange={(e) => update(x.id, { amount: Number(e.target.value || 0) })}
                                            type="number"
                                            step="0.01"
                                            className="w-28 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                                        />
                                    </div>

                                    <select
                                        value={x.cadence}
                                        onChange={(e) => update(x.id, { cadence: e.target.value })}
                                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-semibold text-slate-900 bg-white outline-none"
                                    >
                                        <option>Monthly</option>
                                        <option>Weekly</option>
                                        <option>Yearly</option>
                                    </select>

                                    <div className="ml-auto flex items-center gap-3">
                                        <div className="text-xs font-semibold text-slate-500 hidden md:block">
                                            Next: <span className="text-slate-900 font-bold">{x.next}</span>
                                        </div>
                                        <button
                                            onClick={() => remove(x.id)}
                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-500 font-semibold">
                        Demo mode: this is purely UI now — later you’ll persist to your storage / DB.
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                            <BadgeEuro size={16} />
                            Why this matters
                        </div>
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900/40" />
                                Fixed costs are what actually decide your runway.
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900/40" />
                                Your burn rate becomes predictable — less money anxiety.
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900/40" />
                                Works for everyone: students, professionals, families.
                            </li>
                        </ul>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                                One-line promise
                            </div>
                            <div className="mt-2 text-sm font-bold text-slate-900">
                                Know how long your money lasts — before it’s too late.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function BurnRateDemo({ currency }) {
    // demo: 假設最近日均支出 18
    const [dailyAvg, setDailyAvg] = useState(18);

    const monthlyFixed = useMemo(() => calcMonthlyFixed(DEMO.recurring), []);
    const burn = useMemo(() => calcMonthlyBurn(monthlyFixed, dailyAvg), [monthlyFixed, dailyAvg]);

    // demo: 假設 current balance 1800
    const balance = 1800;
    const runwayMonths = burn > 0 ? balance / burn : 0;
    const runwayDays = Math.floor(runwayMonths * 30);

    const bar = clamp(Math.round((runwayMonths / 3) * 100), 6, 100); // 0–3 months normalized

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Wallet size={16} />
                        Monthly burn rate & runway
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                        Not “what you spent yesterday” — but how long your balance survives.
                    </p>
                </div>

                <div className="hidden md:flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    Demo balance: <span className="text-slate-900 font-extrabold">{formatMoney(balance, currency)}</span>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                        Your numbers
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="text-[11px] font-bold text-slate-500">Monthly fixed</div>
                            <div className="mt-1 text-lg font-extrabold text-slate-900">
                                {formatMoney(monthlyFixed, currency)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="text-[11px] font-bold text-slate-500">Monthly burn</div>
                            <div className="mt-1 text-lg font-extrabold text-slate-900">
                                {formatMoney(burn, currency)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 col-span-2">
                            <div className="flex items-center justify-between">
                                <div className="text-[11px] font-bold text-slate-500">Runway</div>
                                <div className="text-[11px] font-semibold text-slate-500">
                                    ≈ <span className="text-slate-900 font-extrabold">{runwayDays} days</span>
                                </div>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div className="h-full bg-slate-900/70" style={{ width: `${bar}%` }} />
                            </div>
                            <div className="mt-2 text-[11px] text-slate-500 font-semibold">
                                Based on recurring + recent daily average.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                        Adjust the model (demo)
                    </div>
                    <div className="mt-3">
                        <label className="text-sm font-bold text-slate-900">Recent daily average</label>
                        <div className="mt-2 flex items-center gap-3">
                            <input
                                type="range"
                                min={5}
                                max={60}
                                value={dailyAvg}
                                onChange={(e) => setDailyAvg(Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="w-24 text-right text-sm font-extrabold text-slate-900">
                                {formatMoney(dailyAvg, currency)}/day
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                            <Sparkles size={16} />
                            Howie insight (preview)
                        </div>
                        <p className="mt-2 text-sm text-slate-700">
                            If you cut <span className="font-extrabold">subscriptions by €20</span>, your runway increases by{" "}
                            <span className="font-extrabold">~12 days</span>.
                        </p>
                        <button className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity">
                            Ask Howie about my runway <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/** ✅ 主入口：FinanceSection */
export default function FinanceSection() {
    const currency = DEMO.currency;

    return (
        <section className="mt-16 mb-24 space-y-8">
            <FinanceHeader />
            <div className="grid grid-cols-1 gap-12">
                <ManualInputDemo currency={currency} />
                <RecurringBillsDemo currency={currency} />
                <BurnRateDemo currency={currency} />
            </div>
        </section>
    );
}

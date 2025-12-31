import React, { useEffect, useMemo, useState } from "react";
import { Plus, Repeat, Lock, Sparkles, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { usePlan } from "../hooks/usePlan";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
    "Income",
    "Food and drink",
    "Shopping",
    "Transport",
    "Housing",
    "Bills and utilities",
    "Entertainment",
    "Health",
    "Education",
    "Travel",
    "Transfers",
    "Fees",
    "Other",
];

function monthRange(d = new Date()) {
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { from, to };
}

function toDateOnly(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function FinancePage() {
    const { plan, loading: planLoading } = usePlan();
    const canRecurring = plan === "plus" || plan === "pro";
    const { currentUser } = useAuth();

    const [tab, setTab] = useState("transactions"); // transactions | recurring

    const [tx, setTx] = useState([]);
    const [rec, setRec] = useState([]);
    const [loading, setLoading] = useState(true);

    // add tx modal
    const [openTx, setOpenTx] = useState(false);
    const [txForm, setTxForm] = useState({
        type: "expense",
        amount: "",
        category: "Food and drink",
        merchant: "",
        note: "",
        occurredAt: new Date().toISOString().slice(0, 16),
    });

    // add recurring modal
    const [openRec, setOpenRec] = useState(false);
    const [recForm, setRecForm] = useState({
        type: "expense",
        amount: "",
        category: "Bills and utilities",
        merchant: "",
        note: "",
        frequency: "monthly", // weekly | monthly
        byweekday: 1, // Monday
        bymonthday: 1,
        startDate: toDateOnly(new Date()),
        enabled: true,
    });

    const [generating, setGenerating] = useState(false);

    // Keep date range stable to avoid infinite loops if depended on
    // But we use it in 'refresh' and initial load
    // Actually initial load uses dynamic new Date(), we should store the view range in state if we want to change months later
    // For MVP, just current month is fine.
    const { from, to } = useMemo(() => monthRange(new Date()), []);

    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        for (const t of tx) {
            const cents = Number(t.amount_cents || 0);
            if (t.type === "income") income += cents;
            else expense += cents;
        }
        return { income, expense, net: income - expense };
    }, [tx]);

    useEffect(() => {
        if (!currentUser) return;
        (async () => {
            setLoading(true);

            const fromISO = new Date(from.getFullYear(), from.getMonth(), from.getDate()).toISOString();
            const toISO = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).toISOString();

            const [{ data: txData }, { data: recData }] = await Promise.all([
                supabase
                    .from("finance_transactions")
                    .select("*")
                    .gte("occurred_at", fromISO)
                    .lte("occurred_at", toISO)
                    .order("occurred_at", { ascending: false }),
                supabase
                    .from("finance_recurring")
                    .select("*")
                    .order("created_at", { ascending: false }),
            ]);

            setTx(txData || []);
            setRec(recData || []);
            setLoading(false);
        })();
    }, [currentUser, from, to]);

    const formatEUR = (cents) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((cents || 0) / 100);

    async function refresh() {
        // Re-calc month range (or use state if editable)
        const { from, to } = monthRange(new Date());
        const fromISO = new Date(from.getFullYear(), from.getMonth(), from.getDate()).toISOString();
        const toISO = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).toISOString();

        const [{ data: txData }, { data: recData }] = await Promise.all([
            supabase
                .from("finance_transactions")
                .select("*")
                .gte("occurred_at", fromISO)
                .lte("occurred_at", toISO)
                .order("occurred_at", { ascending: false }),
            supabase.from("finance_recurring").select("*").order("created_at", { ascending: false }),
        ]);

        setTx(txData || []);
        setRec(recData || []);
    }

    async function createTransaction() {
        const amountFloat = Number(String(txForm.amount).replace(",", "."));
        if (!amountFloat || amountFloat <= 0) return;

        const amount_cents = Math.round(amountFloat * 100);

        const payload = {
            type: txForm.type,
            amount_cents,
            currency: "EUR",
            category: txForm.category,
            merchant: txForm.merchant || null,
            note: txForm.note || null,
            occurred_at: new Date(txForm.occurredAt).toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const { error } = await supabase.from("finance_transactions").insert(payload);
        if (error) return alert(error.message);

        setOpenTx(false);
        await refresh();
    }

    async function deleteTransaction(id) {
        const ok = window.confirm("Delete this transaction?");
        if (!ok) return;
        const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
        if (error) return alert(error.message);
        await refresh();
    }

    async function createRecurring() {
        if (!canRecurring) return;

        // amount
        const amountFloat = Number(String(recForm.amount).replace(",", "."));
        if (!amountFloat || amountFloat <= 0) return;

        // Plan limits
        if (plan === "plus" && rec.length >= 5) {
            alert("Plus plan is limited to 5 recurring bills. Upgrade to Pro for unlimited.");
            return;
        }

        try {
            // get supabase access token
            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;
            if (!token) throw new Error("No session token");

            // Clean payload for API
            const apiBody = {
                type: recForm.type,
                amount_cents: Math.round(amountFloat * 100),
                currency: "EUR",
                category: recForm.category,
                merchant: recForm.merchant || null,
                note: recForm.note || null,
                frequency: recForm.frequency,
                byweekday: recForm.frequency === "weekly" ? Number(recForm.byweekday) : null,
                bymonthday: recForm.frequency === "monthly" ? Number(recForm.bymonthday) : null,
                start_date: recForm.startDate,
                enabled: !!recForm.enabled,
            };

            const res = await fetch("/api/finance/recurring/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(apiBody),
            });

            const json = await res.json();

            if (!res.ok) {
                if (json.error === "RECURRING_LIMIT_REACHED") {
                    alert(`Plus plan Limit Reached (${json.limit} items). Upgrade to Pro for unlimited.`);
                } else if (json.error === "RECURRING_LOCKED_FREE") {
                    alert("Recurring bills are locked on Free plan.");
                } else {
                    alert(json.error || "Failed to create recurring rule");
                }
                return;
            }

            setOpenRec(false);
            await refresh();
        } catch (e) {
            alert("Network error: " + (e?.message || "Unknown"));
        }
    }

    async function toggleRecurring(id, enabled) {
        if (!canRecurring) return;
        const { error } = await supabase.from("finance_recurring").update({ enabled }).eq("id", id);
        if (error) return alert(error.message);
        await refresh();
    }

    async function generateNext30Days() {
        if (!canRecurring) return;
        setGenerating(true);
        try {
            // get supabase access token
            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;
            if (!token) throw new Error("No session token");

            const now = new Date();
            const body = {
                from: toDateOnly(now),
                to: toDateOnly(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30)),
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timeOfDay: "09:00",
            };

            const r = await fetch("/api/finance/recurring/generate", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const out = await r.json();
            if (!r.ok) throw new Error(out?.error || "Generate failed");

            await refresh();
            alert(`Generated: ${out.created}, Skipped: ${out.skipped}`);
        } catch (e) {
            alert(e.message);
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="rounded-2xl2 border border-slate-200 bg-white/95 shadow-card p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">
                            Finance
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                            Track money like a habit
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Manual entries + Revolut-style categories + recurring bills.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setOpenTx(true)}
                            className="rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-extrabold uppercase tracking-widest hover:opacity-90 flex items-center gap-2"
                        >
                            <Plus size={16} /> Add
                        </button>

                        <button
                            onClick={() => setOpenRec(true)}
                            className={[
                                "rounded-xl border px-4 py-3 text-xs font-extrabold uppercase tracking-widest flex items-center gap-2",
                                canRecurring
                                    ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                                    : "border-slate-200 bg-slate-50 text-slate-400",
                            ].join(" ")}
                            title={canRecurring ? "Add recurring" : "Upgrade to enable recurring"}
                            disabled={!canRecurring}
                        >
                            <Repeat size={16} /> Recurring
                            {!canRecurring && <Lock size={14} className="ml-1" />}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-5 flex items-center gap-2">
                    {[
                        { id: "transactions", label: "Transactions" },
                        { id: "recurring", label: "Recurring" },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={[
                                "rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-widest border transition-all",
                                tab === t.id
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                            ].join(" ")}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Income (this month)" value={formatEUR(summary.income)} hint="EUR only" />
                <SummaryCard title="Expenses (this month)" value={formatEUR(summary.expense)} hint="EUR only" />
                <SummaryCard
                    title="Net"
                    value={formatEUR(summary.net)}
                    hint={summary.net >= 0 ? "Positive" : "Negative"}
                    accent={summary.net >= 0 ? "ok" : "bad"}
                />
            </div>

            {/* Main */}
            <div className="rounded-2xl2 border border-slate-200 bg-white/95 shadow-card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-slate-500 text-sm font-semibold">Loading…</div>
                ) : tab === "transactions" ? (
                    <div className="p-6">
                        {tx.length === 0 ? (
                            <EmptyState title="No transactions yet" subtitle="Add your first entry to see your monthly rhythm." />
                        ) : (
                            <div className="space-y-3">
                                {tx.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-extrabold text-slate-900 truncate">
                                                    {t.merchant || t.category}
                                                </div>
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                                    {t.category}
                                                </span>
                                                {t.recurring_id ? (
                                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        recurring
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="text-xs font-semibold text-slate-500 mt-1">
                                                {new Date(t.occurred_at).toLocaleString()}
                                                {t.note ? ` • ${t.note}` : ""}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={t.type === "income" ? "text-emerald-700 font-extrabold" : "text-slate-900 font-extrabold"}>
                                                {t.type === "income" ? "+" : "-"}
                                                {formatEUR(t.amount_cents)}
                                            </div>
                                            <button
                                                onClick={() => deleteTransaction(t.id)}
                                                className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Recurring header */}
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                                <div className="text-sm font-extrabold text-slate-900">Recurring bills</div>
                                <div className="text-xs font-semibold text-slate-500">
                                    Weekly / Monthly rules. Generate transactions with one click.
                                </div>
                            </div>
                            <button
                                onClick={generateNext30Days}
                                disabled={!canRecurring || generating}
                                className={[
                                    "rounded-xl px-4 py-3 text-xs font-extrabold uppercase tracking-widest flex items-center gap-2",
                                    canRecurring
                                        ? "bg-slate-900 text-white hover:opacity-90"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed",
                                ].join(" ")}
                            >
                                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                Generate next 30 days
                                {!canRecurring && <Lock size={14} className="ml-1" />}
                            </button>
                        </div>

                        {!canRecurring ? (
                            <LockPanel />
                        ) : rec.length === 0 ? (
                            <EmptyState title="No recurring rules yet" subtitle="Create your first recurring bill (rent, subscriptions, salary)." />
                        ) : (
                            <div className="space-y-3">
                                {rec.map((r) => (
                                    <div key={r.id} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-extrabold text-slate-900 truncate">
                                                    {r.merchant || r.category}
                                                </div>
                                                <div className="mt-1 text-xs font-semibold text-slate-500">
                                                    {r.frequency === "weekly"
                                                        ? `Weekly • weekday ${r.byweekday}`
                                                        : `Monthly • day ${r.bymonthday}`}
                                                    {" • "}
                                                    {r.type === "income" ? "+" : "-"}
                                                    {formatEUR(r.amount_cents)}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleRecurring(r.id, !r.enabled)}
                                                className={[
                                                    "rounded-full px-3 py-2 text-xs font-extrabold uppercase tracking-widest border",
                                                    r.enabled
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : "bg-slate-50 text-slate-500 border-slate-200",
                                                ].join(" ")}
                                            >
                                                {r.enabled ? "Enabled" : "Disabled"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal: Add Transaction */}
            {openTx && (
                <Modal title="Add transaction" onClose={() => setOpenTx(false)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field label="Type">
                            <select
                                value={txForm.type}
                                onChange={(e) => setTxForm((p) => ({ ...p, type: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </Field>

                        <Field label="Amount (EUR)">
                            <input
                                value={txForm.amount}
                                onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))}
                                placeholder="12.99"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </Field>

                        <Field label="Category">
                            <select
                                value={txForm.category}
                                onChange={(e) => setTxForm((p) => ({ ...p, category: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Merchant">
                            <input
                                value={txForm.merchant}
                                onChange={(e) => setTxForm((p) => ({ ...p, merchant: e.target.value }))}
                                placeholder="Revolut / Carrefour / Rent"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </Field>

                        <div className="md:col-span-2">
                            <Field label="Note">
                                <input
                                    value={txForm.note}
                                    onChange={(e) => setTxForm((p) => ({ ...p, note: e.target.value }))}
                                    placeholder="Optional"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </Field>
                        </div>

                        <div className="md:col-span-2">
                            <Field label="Date & time">
                                <input
                                    type="datetime-local"
                                    value={txForm.occurredAt}
                                    onChange={(e) => setTxForm((p) => ({ ...p, occurredAt: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                        <button
                            onClick={() => setOpenTx(false)}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={createTransaction}
                            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-white hover:opacity-90"
                        >
                            Save
                        </button>
                    </div>
                </Modal>
            )}

            {/* Modal: Add Recurring */}
            {openRec && (
                <Modal title="Add recurring" onClose={() => setOpenRec(false)}>
                    {!canRecurring ? (
                        <LockPanel />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Type">
                                    <select
                                        value={recForm.type}
                                        onChange={(e) => setRecForm((p) => ({ ...p, type: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </Field>

                                <Field label="Amount (EUR)">
                                    <input
                                        value={recForm.amount}
                                        onChange={(e) => setRecForm((p) => ({ ...p, amount: e.target.value }))}
                                        placeholder="9.99"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </Field>

                                <Field label="Category">
                                    <select
                                        value={recForm.category}
                                        onChange={(e) => setRecForm((p) => ({ ...p, category: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Merchant">
                                    <input
                                        value={recForm.merchant}
                                        onChange={(e) => setRecForm((p) => ({ ...p, merchant: e.target.value }))}
                                        placeholder="Spotify / Rent / Salary"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </Field>

                                <div className="md:col-span-2">
                                    <Field label="Frequency">
                                        <select
                                            value={recForm.frequency}
                                            onChange={(e) => setRecForm((p) => ({ ...p, frequency: e.target.value }))}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        >
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </Field>
                                </div>

                                {recForm.frequency === "weekly" ? (
                                    <Field label="Weekday (0=Sun…6=Sat)">
                                        <input
                                            type="number"
                                            min={0}
                                            max={6}
                                            value={recForm.byweekday}
                                            onChange={(e) => setRecForm((p) => ({ ...p, byweekday: e.target.value }))}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </Field>
                                ) : (
                                    <Field label="Day of month (1…31)">
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            value={recForm.bymonthday}
                                            onChange={(e) => setRecForm((p) => ({ ...p, bymonthday: e.target.value }))}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </Field>
                                )}

                                <Field label="Start date">
                                    <input
                                        type="date"
                                        value={recForm.startDate}
                                        onChange={(e) => setRecForm((p) => ({ ...p, startDate: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </Field>

                                <div className="md:col-span-2">
                                    <Field label="Note">
                                        <input
                                            value={recForm.note}
                                            onChange={(e) => setRecForm((p) => ({ ...p, note: e.target.value }))}
                                            placeholder="Optional"
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    onClick={() => setOpenRec(false)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createRecurring}
                                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-white hover:opacity-90"
                                >
                                    Save
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
}

// ---------- UI atoms ----------
function SummaryCard({ title, value, hint, accent }) {
    const ring =
        accent === "ok" ? "border-emerald-100" : accent === "bad" ? "border-rose-100" : "border-slate-200";
    return (
        <div className={`rounded-2xl2 border ${ring} bg-white/95 shadow-card p-6`}>
            <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">{title}</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
            <div className="mt-2 text-xs font-semibold text-slate-500">{hint}</div>
        </div>
    );
}
function EmptyState({ title, subtitle }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <div className="text-sm font-extrabold text-slate-900">{title}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</div>
        </div>
    );
}
function LockPanel() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <Lock size={18} className="text-slate-500" />
            </div>
            <div>
                <div className="text-sm font-extrabold text-slate-900">Locked on Free</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                    Upgrade to Plus/Pro to add recurring bills and generate schedules.
                </div>
            </div>
        </div>
    );
}
function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl2 w-full max-w-xl border border-slate-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="text-sm font-extrabold text-slate-900">{title}</div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-extrabold">✕</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
function Field({ label, children }) {
    return (
        <div className="space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">{label}</div>
            {children}
        </div>
    );
}

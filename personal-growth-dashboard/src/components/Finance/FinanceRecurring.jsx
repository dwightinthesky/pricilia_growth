import React, { useEffect, useMemo, useState } from "react";
import { Lock, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FINANCE_CATEGORIES, WEEKDAYS } from "../../utils/financeCategories";
import {
    financeRecurringList,
    financeRecurringSubscribe,
    financeRecurringUpsert,
    financeRecurringRemove,
} from "../../services/dataClient/financeClient";

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_RULE = {
    type: "expense", // expense | income
    title: "",
    amount: "",
    currency: "EUR",
    category: "subscriptions",
    frequency: "monthly", // monthly | weekly
    weekday: 1, // Mon
    monthday: 1,
    startDateISO: new Date().toISOString().slice(0, 10),
    enabled: true,
    note: "",
};

export default function FinanceRecurring({ locked }) {
    const { currentUser: user } = useAuth();
    const [items, setItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    const [draft, setDraft] = useState(DEFAULT_RULE);

    useEffect(() => {
        if (!user) return;

        setItems(financeRecurringList(user.uid));
        const unsub = financeRecurringSubscribe(() => {
            setItems(financeRecurringList(user.uid));
        });

        return () => unsub && unsub();
    }, [user]);

    const categories = useMemo(() => {
        const list = draft.type === "income" ? FINANCE_CATEGORIES.income : FINANCE_CATEGORIES.expense;
        return list;
    }, [draft.type]);

    const resetDraft = () => setDraft(DEFAULT_RULE);

    const saveDraft = () => {
        if (!user) return;
        const title = draft.title.trim();
        const amount = Number(draft.amount);

        if (!title) return alert("Please enter a title.");
        if (!Number.isFinite(amount) || amount <= 0) return alert("Amount must be > 0.");

        const next = {
            id: uid(),
            userId: user.uid,
            enabled: Boolean(draft.enabled),
            type: draft.type,
            title,
            amount,
            currency: "EUR",
            category: draft.category,
            frequency: draft.frequency,
            weekday: draft.frequency === "weekly" ? Number(draft.weekday) : undefined,
            monthday: draft.frequency === "monthly" ? Number(draft.monthday) : undefined,
            startDateISO: draft.startDateISO,
            note: draft.note?.trim() || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        financeRecurringUpsert(next);
        setIsAdding(false);
        resetDraft();
    };

    const toggleEnabled = (r) => {
        financeRecurringUpsert({
            ...r,
            enabled: !r.enabled,
            updatedAt: new Date().toISOString(),
        });
    };

    const remove = (id) => {
        const ok = window.confirm("Delete this recurring item?");
        if (!ok) return;
        financeRecurringRemove(id);
    };

    if (locked) {
        return (
            <div className="rounded-2xl2 border border-slate-200 bg-white/70 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-extrabold tracking-[0.18em] text-slate-400 uppercase">Plus feature</div>
                        <h3 className="mt-2 text-lg font-extrabold text-slate-900">Recurring transactions</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                            Automate rent, subscriptions, salary. Generate monthly cashflow in one click.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500">
                        <Lock size={18} />
                    </div>
                </div>

                <button
                    onClick={() => (window.location.href = "/pricing")}
                    className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:opacity-95"
                >
                    Unlock Plus
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl2 border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">
                        Automations
                    </div>
                    <h3 className="mt-2 text-lg font-extrabold text-slate-900">Recurring transactions</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                        Add weekly or monthly items (rent, subscriptions). Next step: generate into ledger.
                    </p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:opacity-95"
                >
                    <Plus size={14} />
                    Add
                </button>
            </div>

            {/* List */}
            <div className="mt-5 space-y-2">
                {items.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                        No recurring items yet.
                    </div>
                ) : (
                    items.map((r) => (
                        <div
                            key={r.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleEnabled(r)}
                                        className={[
                                            "h-5 w-9 rounded-full border transition-all",
                                            r.enabled ? "bg-emerald-500/90 border-emerald-500/40" : "bg-slate-200 border-slate-200",
                                        ].join(" ")}
                                        aria-label="toggle"
                                    >
                                        <div
                                            className={[
                                                "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                                r.enabled ? "translate-x-4" : "translate-x-1",
                                            ].join(" ")}
                                        />
                                    </button>

                                    <div className="truncate text-sm font-extrabold text-slate-900">{r.title}</div>
                                    <div className="text-[11px] font-bold text-slate-400">
                                        {r.frequency === "weekly"
                                            ? `Weekly · ${WEEKDAYS.find((d) => d.id === r.weekday)?.label || "—"}`
                                            : `Monthly · Day ${r.monthday || 1}`}
                                    </div>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
                                    <span>{(FINANCE_CATEGORIES[r.type] || []).find((c) => c.id === r.category)?.label || r.category}</span>
                                    <span>·</span>
                                    <span>Starts {r.startDateISO}</span>
                                    {r.note ? (
                                        <>
                                            <span>·</span>
                                            <span className="truncate max-w-[280px]">{r.note}</span>
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-sm font-extrabold text-slate-900">€{Number(r.amount).toFixed(2)}</div>
                                    <div className="text-[11px] font-bold text-slate-400">{r.type === "income" ? "Income" : "Expense"}</div>
                                </div>

                                <button
                                    onClick={() => remove(r.id)}
                                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsAdding(false)}>
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">New recurring</div>
                                <h4 className="mt-2 text-lg font-extrabold text-slate-900">Add a recurring transaction</h4>
                                <div className="mt-1 text-sm font-semibold text-slate-500">
                                    Weekly or monthly. You’ll generate these into ledger next.
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Title</label>
                                <input
                                    value={draft.title}
                                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g., Rent, Spotify, Salary"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Type</label>
                                <select
                                    value={draft.type}
                                    onChange={(e) => {
                                        const nextType = e.target.value;
                                        const nextCat = (nextType === "income" ? FINANCE_CATEGORIES.income : FINANCE_CATEGORIES.expense)[0]?.id || "other";
                                        setDraft((p) => ({ ...p, type: nextType, category: nextCat }));
                                    }}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Amount (EUR)</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    value={draft.amount}
                                    onChange={(e) => setDraft((p) => ({ ...p, amount: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Category</label>
                                <select
                                    value={draft.category}
                                    onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Frequency</label>
                                <select
                                    value={draft.frequency}
                                    onChange={(e) => setDraft((p) => ({ ...p, frequency: e.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>

                            {draft.frequency === "weekly" ? (
                                <div>
                                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Weekday</label>
                                    <select
                                        value={draft.weekday}
                                        onChange={(e) => setDraft((p) => ({ ...p, weekday: Number(e.target.value) }))}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                    >
                                        {WEEKDAYS.map((d) => (
                                            <option key={d.id} value={d.id}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Day of month</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="28"
                                        value={draft.monthday}
                                        onChange={(e) => setDraft((p) => ({ ...p, monthday: Number(e.target.value) }))}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                    />
                                    <div className="mt-1 text-[11px] font-semibold text-slate-400">
                                        For MVP, we cap to 1–28 to avoid month-end edge cases.
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Start date</label>
                                <input
                                    type="date"
                                    value={draft.startDateISO}
                                    onChange={(e) => setDraft((p) => ({ ...p, startDateISO: e.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-6">
                                <input
                                    id="enabled"
                                    type="checkbox"
                                    checked={draft.enabled}
                                    onChange={(e) => setDraft((p) => ({ ...p, enabled: e.target.checked }))}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <label htmlFor="enabled" className="text-sm font-semibold text-slate-700">
                                    Enabled
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Note (optional)</label>
                                <input
                                    value={draft.note}
                                    onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))}
                                    placeholder="e.g., paid via Revolut, reimbursable, etc."
                                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    resetDraft();
                                }}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveDraft}
                                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:opacity-95"
                            >
                                Save recurring
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

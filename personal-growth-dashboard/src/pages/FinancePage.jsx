import React, { useEffect, useState } from "react";
import { usePlan } from "../hooks/usePlan";
import { storage, STORAGE_KEYS } from "../utils/storage";
import FinanceAddTransaction from "../components/finance/FinanceAddTransaction";
import FinanceRecurring from "../components/finance/FinanceRecurring";

export default function FinancePage() {
    const { plan, loading } = usePlan();
    const [txs, setTxs] = useState([]);

    useEffect(() => {
        // Initial load
        setTxs(storage.get(STORAGE_KEYS.FINANCE_TXS) || []);

        // Subscribe to updates
        const unsub = storage.subscribe(STORAGE_KEYS.FINANCE_TXS, (data) => {
            setTxs(data || []);
        });
        return unsub;
    }, []);

    // Calculate Month Total (Simple Expense Sum for MVP)
    const monthTotal = txs.reduce((sum, t) =>
        t.type === 'expense' ? sum + Number(t.amount) : sum, 0
    );

    if (loading) return <div className="p-10 text-center text-slate-400">Loading finance...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase mb-2">
                    Finance
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Finance Tracker
                </h1>
            </header>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Expenses (This Month)</div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">€{monthTotal.toFixed(2)}</div>
            </div>

            <FinanceAddTransaction />

            <FinanceRecurring locked={plan !== "plus" && plan !== "pro"} />

            {/* Transaction List MVP */}
            <div className="space-y-2">
                <h3 className="font-bold text-slate-900 px-1">Recent Transactions</h3>
                {txs.length === 0 && <div className="text-slate-400 text-sm px-1">No transactions found.</div>}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {txs.slice(0, 5).map(tx => (
                        <div key={tx.id} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50">
                            <span className="font-medium text-slate-700">{tx.title}</span>
                            <span className="font-bold text-slate-900">-€{Number(tx.amount).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

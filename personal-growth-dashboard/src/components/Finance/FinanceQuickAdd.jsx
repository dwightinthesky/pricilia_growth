import React, { useState } from 'react';
import { financeLedgerCreate } from '../../services/dataClient/financeClient';
import { FINANCE_CATEGORIES, DEFAULT_CURRENCY } from '../../utils/financeConstants';

export default function FinanceQuickAdd({ user }) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('groceries');
    const [note, setNote] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;

        financeLedgerCreate({
            id: Date.now().toString(),
            userId: user.uid,
            type,
            amount: Number(amount),
            currency: DEFAULT_CURRENCY,
            category,
            note,
            dateISO: new Date().toISOString().split('T')[0],
            source: 'manual'
        });

        setAmount('');
        setNote('');
        // Force refresh or use context in future. Simple reload for MVP or just rely on state if parent re-renders.
        // Usually we need callback or storage event listener. 
        // Since storage.js dispatches event, parent listing should update if it subscribes.
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card p-5">
            <div className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase mb-4">Quick Add</div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-2">
                    <button type="button" onClick={() => setType('expense')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${type === 'expense' ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}>Expense</button>
                    <button type="button" onClick={() => setType('income')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>Income</button>
                </div>

                <div className="flex gap-2">
                    <input autoFocus type="number" step="0.01" placeholder="0.00" className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-slate-400" value={amount} onChange={e => setAmount(e.target.value)} />
                    <select className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm font-medium outline-none focus:border-slate-400" value={category} onChange={e => setCategory(e.target.value)}>
                        {FINANCE_CATEGORIES[type].map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                <input placeholder="Note (optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-slate-400" value={note} onChange={e => setNote(e.target.value)} />

                <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide hover:shadow-lg hover:scale-[1.01] transition-all">
                    Add {type}
                </button>
            </form>
        </div>
    );
}

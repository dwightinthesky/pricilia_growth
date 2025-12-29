import React, { useMemo } from 'react';
import { financeLedgerGetAll } from '../../services/dataClient/financeClient';
import { DEFAULT_CURRENCY } from '../../utils/financeConstants';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function FinanceKPI({ user, month }) {
    // month string 'YYYY-MM'
    const ledger = financeLedgerGetAll(user?.uid);

    const stats = useMemo(() => {
        const [y, m] = month.split('-');
        const currentMonthTx = ledger.filter(tx => tx.dateISO.startsWith(`${y}-${m}`));

        const income = currentMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = currentMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        return { income, expense, net: income - expense };
    }, [ledger, month]);

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600/70">Income</span>
                </div>
                <div className="text-xl font-extrabold text-emerald-700">
                    {DEFAULT_CURRENCY === 'EUR' ? '€' : '$'}{stats.income.toLocaleString()}
                </div>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={14} className="text-rose-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600/70">Expense</span>
                </div>
                <div className="text-xl font-extrabold text-rose-700">
                    {DEFAULT_CURRENCY === 'EUR' ? '€' : '$'}{stats.expense.toLocaleString()}
                </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Wallet size={14} className="text-slate-400" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Net</span>
                </div>
                <div className={`text-xl font-extrabold ${stats.net >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                    {DEFAULT_CURRENCY === 'EUR' ? '€' : '$'}{stats.net.toLocaleString()}
                </div>
            </div>
        </div>
    );
}

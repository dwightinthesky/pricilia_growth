import React, { useEffect, useState } from 'react';
import { financeLedgerGetAll } from '../../services/dataClient/financeClient';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import { t } from 'i18next'; // Or useTranslation hook inside
import { useTranslation } from 'react-i18next';
import { FINANCE_CATEGORIES } from '../../utils/financeConstants';

export default function FinanceList({ user, month }) {
    const { t } = useTranslation();
    const [txs, setTxs] = useState([]);

    const load = () => {
        const all = financeLedgerGetAll(user?.uid);
        // Filter by month
        const [y, m] = month.split('-');
        const filtered = all
            .filter(t => t.dateISO.startsWith(`${y}-${m}`))
            .sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO) || b.id.localeCompare(a.id));
        setTxs(filtered);
    };

    useEffect(() => {
        load();
        const unsub = storage.subscribe(STORAGE_KEYS.FINANCE_LEDGER, load);
        return unsub;
    }, [user, month]);

    const getLabel = (type, catId) => {
        const list = FINANCE_CATEGORIES[type] || [];
        // Try i18n first
        // t(`finance.categories.${catId}`)
        // But for safe fallback, find label
        const found = list.find(x => x.id === catId);
        return t(`finance.categories.${catId}`, found?.label || catId);
    };

    if (txs.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white/50 p-12 text-center">
                <div className="text-slate-400 text-sm font-medium">No transactions this month</div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Transactions</div>
                <div className="text-xs font-bold text-slate-400">{month}</div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {txs.map(tx => (
                    <div key={tx.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                            <div>
                                <div className="text-sm font-bold text-slate-700">
                                    {getLabel(tx.type, tx.category)}
                                </div>
                                {tx.note && <div className="text-xs text-slate-400">{tx.note}</div>}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">{tx.dateISO.slice(5)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

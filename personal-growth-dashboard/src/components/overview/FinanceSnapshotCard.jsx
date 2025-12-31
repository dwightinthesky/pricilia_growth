import React from "react";
import { Lock, ArrowRight, CreditCard, Repeat, TrendingDown } from "lucide-react";

function eur(n) {
    if (typeof n !== "number") return "€0";
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);
    return `${sign}€${abs.toFixed(2)}`;
}

export default function FinanceSnapshotCard({
    plan = "free",
    snapshot = { monthNet: -312, recurringActive: 3, nextBill: "Spotify €11.99 in 2 days" },
    onUpgrade,
    onOpenFinance,
}) {
    const locked = plan === "free";

    return (
        <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-card">
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">Finance Snapshot</div>
                        <div className="mt-2 text-xl font-extrabold text-slate-900 tracking-tight">Know your numbers</div>
                        <div className="mt-1 text-sm text-slate-600">A tiny overview that keeps you on track.</div>
                    </div>

                    <div className="inline-flex items-center rounded-full bg-[#F3F27A] px-3 py-1 text-[11px] font-extrabold tracking-widest text-black">
                        BETA
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                            <TrendingDown size={14} /> This month
                        </div>
                        <div className="mt-2 text-lg font-extrabold text-slate-900">{eur(snapshot.monthNet)}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                            <Repeat size={14} /> Recurring
                        </div>
                        <div className="mt-2 text-lg font-extrabold text-slate-900">{snapshot.recurringActive ?? 0}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                            <CreditCard size={14} /> Next
                        </div>
                        <div className="mt-2 text-sm font-extrabold text-slate-900 truncate" title={snapshot.nextBill}>
                            {snapshot.nextBill || "None"}
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-700">
                        {locked ? (
                            <span className="inline-flex items-center gap-2">
                                <Lock size={14} className="text-slate-500" />
                                Recurring bills require Plus
                            </span>
                        ) : (
                            <span>Recurring bills enabled for your plan</span>
                        )}
                    </div>

                    {locked ? (
                        <button
                            onClick={onUpgrade}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-[11px] font-extrabold tracking-widest uppercase"
                        >
                            Upgrade <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={onOpenFinance}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-[11px] font-extrabold tracking-widest uppercase"
                        >
                            Open <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

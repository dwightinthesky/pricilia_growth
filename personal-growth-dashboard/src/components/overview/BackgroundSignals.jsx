import React from 'react';
import { Target, TrendingDown } from 'lucide-react';

function MiniGoalCard({ goals = [] }) {
    const activeGoals = goals.slice(0, 2);

    return (
        <div className="rounded-2xl bg-white border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-extrabold tracking-[0.12em] text-slate-400 uppercase">Goals</span>
            </div>
            {activeGoals.length === 0 ? (
                <div className="text-xs text-slate-500">No active goals</div>
            ) : (
                <div className="space-y-2">
                    {activeGoals.map((goal, idx) => (
                        <div key={idx} className="text-sm font-semibold text-slate-700">
                            {goal.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MiniFinanceCard({ snapshot }) {
    const monthNet = snapshot?.monthNet || 0;
    const recurringActive = snapshot?.recurringActive || 0;

    return (
        <div className="rounded-2xl bg-white border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-extrabold tracking-[0.12em] text-slate-400 uppercase">Finance</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="text-xs text-slate-500 mb-1">This Month</div>
                    <div className={`text-lg font-extrabold ${monthNet < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        €{Math.abs(monthNet).toFixed(0)}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-slate-500 mb-1">Recurring</div>
                    <div className="text-lg font-extrabold text-slate-900">
                        {recurringActive}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BackgroundSignals({ goals, financeSnapshot }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniGoalCard goals={goals} />
            <MiniFinanceCard snapshot={financeSnapshot} />
        </div>
    );
}

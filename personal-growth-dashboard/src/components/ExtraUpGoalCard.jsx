import React from 'react';
import { Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// GoCardless-style Progress Card
export default function ExtraUpGoalCard({ goal }) {
    const navigate = useNavigate();

    // goal contains: title, currentHours, targetHours, progressPercent, targetDate
    const { title, category, currentHours, targetHours, progressPercent, targetDate, id } = goal;

    const daysRemaining = Math.max(0, Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)));
    const isCompleted = progressPercent >= 100;

    return (
        <div className="group relative flex flex-col h-full rounded-2xl2 bg-white/95 backdrop-blur border border-slate-200/70 shadow-card hover:shadow-float hover:-translate-y-[2px] transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                        {category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                        Target: {new Date(targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ({daysRemaining} days left)
                    </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-1">{title}</h3>
            </div>

            {/* Progress Section */}
            <div className="px-6 py-4 flex-1">
                <div className="flex items-end justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Clock size={14} />
                        This week
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                        <span className={isCompleted ? "text-green-600" : ""}>{currentHours}h</span>
                        <span className="text-slate-300 mx-1">/</span>
                        {targetHours}h
                    </div>
                </div>

                {/* Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : 'bg-slate-900'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="mt-1 text-right text-[10px] font-bold text-slate-400">
                    {progressPercent}% completed
                </div>
            </div>

            {/* Footer / CTA */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-50 mt-auto">
                <button
                    onClick={() => navigate(`/schedule?intent=create&extraUpGoalId=${id}`)}
                    className="flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    + Add session
                </button>

                {/* Visual Flair */}
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
}

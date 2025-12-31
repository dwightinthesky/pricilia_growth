import React from 'react';

export default function TodayHero({ date, focusTitle, focusHint, onStartFocus }) {
    return (
        <div className="overview-hero-card">
            <div className="overview-section-title mb-4 text-xs tracking-[0.18em] text-slate-600">
                {date}
            </div>

            <h1 className="overview-hero-title mb-3 text-[32px] font-extrabold leading-tight text-slate-900">
                {focusTitle || "One thing that moves you forward"}
            </h1>

            <p className="overview-body mb-8 text-base text-slate-700 opacity-80">
                {focusHint || "You don't need to do everything. Just this."}
            </p>

            <button
                onClick={onStartFocus}
                className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-8 py-4 text-sm font-extrabold text-slate-900 shadow-lg transition-all hover:bg-yellow-300 hover:shadow-xl hover:-translate-y-0.5"
            >
                <span>Start 90-min focus</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
        </div>
    );
}

import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';

export default function ComingSoonCard({
    title,
    description,
    status = "Coming soon",
    actionLabel = "Notify me",
    icon: Icon
}) {
    return (
        <div className="group relative flex flex-col h-full rounded-2xl2 bg-white/95 backdrop-blur border border-slate-200/70 shadow-card hover:shadow-float hover:-translate-y-[2px] transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {Icon && <Icon size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />}
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-500 uppercase">
                            {title}
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-400 leading-relaxed pr-4">
                        {description}
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                        {status}
                    </span>
                </div>
            </div>

            {/* Skeleton Preview */}
            <div className="flex-1 px-6 py-2 opacity-40 group-hover:opacity-60 transition-opacity">
                <div className="space-y-3">
                    <div className="h-2 w-3/4 rounded-full bg-slate-100"></div>
                    <div className="h-2 w-1/2 rounded-full bg-slate-100"></div>
                    <div className="h-2 w-5/6 rounded-full bg-slate-100"></div>
                </div>
            </div>

            {/* Footer / CTA */}
            <div className="px-6 pb-6 pt-2">
                <button className="flex items-center gap-2 text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {actionLabel}
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Locked Overlay (Optional, for strictly locked feels) */}
            {/* <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Lock className="text-slate-300" size={24} />
            </div> */}
        </div>
    );
}

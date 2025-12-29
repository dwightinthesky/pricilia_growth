import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';

export default function ComingSoonCard({
    title,
    icon: Icon,
    description,
    status = "Coming soon",
    actionLabel = "Notify me",
    onClick,
    onAction // Support alias
}) {
    const handleClick = onAction || onClick;
    const clickable = typeof handleClick === "function";

    return (
        <div
            onClick={handleClick}
            className={[
                "group relative flex flex-col h-full rounded-2xl2 bg-white/95 backdrop-blur border border-slate-200/70 shadow-card p-6 overflow-hidden",
                clickable ? "cursor-pointer hover:shadow-float hover:-translate-y-[2px] transition-all duration-300" : ""
            ].join(" ")}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={(e) => {
                if (!clickable) return;
                if (e.key === "Enter" || e.key === " ") handleClick();
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {Icon && <Icon size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />}
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-500 uppercase">
                            {title}
                        </div>
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                        {status}
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="text-sm font-semibold text-slate-500 leading-relaxed pr-4 mb-4 flex-1">
                {description}
            </div>

            {/* Footer / CTA */}
            <div className="pt-2 mt-auto">
                <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                        if (!clickable) return;
                        e.stopPropagation();
                        handleClick();
                    }}
                >
                    {actionLabel}
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}

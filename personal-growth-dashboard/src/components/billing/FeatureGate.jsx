import React from "react";
import { Lock, ArrowRight } from "lucide-react";

export default function FeatureGate({
    allowed,
    title = "This feature is locked",
    desc = "Upgrade to unlock this feature.",
    cta = "View pricing",
    onUpgrade,
    children,
}) {
    if (allowed) return children;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-card overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <Lock size={16} />
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-slate-900">{title}</div>
                            <div className="mt-1 text-sm text-slate-600">{desc}</div>
                        </div>
                    </div>

                    <button
                        onClick={onUpgrade}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:opacity-90 transition-opacity"
                    >
                        {cta} <ArrowRight size={14} />
                    </button>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                        Preview
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                        You can still browse the UI, but actions are locked on Free.
                    </div>
                </div>
            </div>
        </div>
    );
}

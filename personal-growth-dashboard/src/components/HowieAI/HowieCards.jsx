import React from "react";
import { ArrowRight, CalendarPlus, Sparkles, AlertTriangle } from "lucide-react";

const STATUS = {
    on_track: {
        label: "On track",
        pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: Sparkles,
    },
    behind: {
        label: "Behind",
        pill: "bg-rose-50 text-rose-700 border-rose-100",
        icon: AlertTriangle,
    },
    overloaded: {
        label: "Overloaded",
        pill: "bg-amber-50 text-amber-700 border-amber-100",
        icon: AlertTriangle,
    },
};

function StatusPill({ status = "on_track" }) {
    const cfg = STATUS[status] || STATUS.on_track;
    const Icon = cfg.icon;

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.pill}`}>
            <Icon size={14} />
            {cfg.label}
        </div>
    );
}

function ActionButton({ variant = "primary", onClick, children, icon: Icon }) {
    const base =
        "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99]";
    const styles =
        variant === "primary"
            ? "bg-slate-900 text-white hover:opacity-90 shadow-md shadow-slate-900/10"
            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50";

    return (
        <button type="button" className={`${base} ${styles}`} onClick={onClick}>
            {Icon ? <Icon size={18} /> : null}
            {children}
        </button>
    );
}

export default function HowieCards({ howie, onRunAction }) {
    if (!howie) return null;

    const status = howie.status || "on_track";
    const summary = howie.summary || "";
    const recs = Array.isArray(howie.recommendations) ? howie.recommendations : [];

    return (
        <div className="space-y-4">
            {/* Summary bubble */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <StatusPill status={status} />
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis</div>
                </div>
                <div className="text-sm leading-relaxed text-slate-700 font-medium">{summary}</div>
            </div>

            {/* Recommendation cards */}
            {recs.map((r, idx) => {
                const title = r?.title || "Recommendation";
                const why = r?.why || "";
                const impact = r?.impact || "";
                const actions = Array.isArray(r?.actions) ? r.actions : [];

                // UI rule: Primary = schedule_session / create_event；Secondary = open_schedule
                const primary = actions.find((a) => a?.type === "schedule_session" || a?.type === "create_event");
                const secondary = actions.find((a) => a?.type === "open_schedule");

                return (
                    <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="text-lg font-extrabold tracking-tight text-slate-900 mb-2">{title}</div>

                        {why ? (
                            <div className="mb-4 text-xs font-medium text-slate-500 leading-relaxed">{why}</div>
                        ) : null}

                        {impact ? (
                            <div className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                                <Sparkles size={10} strokeWidth={3} />
                                <span>Impact: {impact}</span>
                            </div>
                        ) : null}

                        <div className="space-y-2 mt-2">
                            {primary ? (
                                <ActionButton
                                    variant="primary"
                                    icon={primary.type === "create_event" || primary.type === "schedule_session" ? CalendarPlus : Sparkles}
                                    onClick={() => onRunAction(primary)}
                                >
                                    {primary.label || "Apply"}
                                </ActionButton>
                            ) : null}

                            {secondary ? (
                                <ActionButton
                                    variant="secondary"
                                    icon={ArrowRight}
                                    onClick={() => onRunAction(secondary)}
                                >
                                    {secondary.label || "Open schedule"}
                                </ActionButton>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

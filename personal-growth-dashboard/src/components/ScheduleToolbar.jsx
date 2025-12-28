import React from "react";

function labelForRange(date, view) {
    const d = new Date(date);
    const base = d.toLocaleDateString([], { month: "long", year: "numeric" });
    if (view === "day") {
        return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    }
    return base;
}

export default function ScheduleToolbar(toolbar) {
    const { date, view, views, onNavigate, onView } = toolbar;

    const viewOptions = Array.isArray(views)
        ? views
        : Object.keys(views || { month: true, week: true, day: true });

    return (
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onNavigate("TODAY")}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                    >
                        Today
                    </button>

                    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <button
                            type="button"
                            onClick={() => onNavigate("PREV")}
                            className="px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                            Back
                        </button>
                        <div className="w-px bg-slate-200" />
                        <button
                            type="button"
                            onClick={() => onNavigate("NEXT")}
                            className="px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="min-w-0 flex-1 px-2 text-center">
                    <div className="truncate text-sm font-semibold text-slate-900">
                        {labelForRange(date, view)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">Schedule</div>
                </div>

                <div className="flex items-center">
                    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {viewOptions
                            .filter((v) => v === "month" || v === "week" || v === "day")
                            .map((v) => {
                                const active = v === view;
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => onView(v)}
                                        className={[
                                            "px-3 py-2 text-xs font-semibold",
                                            active ? "bg-slate-900 text-white" : "text-slate-900 hover:bg-slate-50",
                                        ].join(" ")}
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}

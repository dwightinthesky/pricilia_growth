import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useUnifiedEvents from "../hooks/useUnifiedEvents";

function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(date) {
    const d = new Date(date);
    return d.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function isSameDay(a, b) {
    const da = new Date(a);
    const db = new Date(b);
    return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
    );
}

export default function UpcomingScheduleWidget({ maxItems = 4 }) {
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const { events, loading } = useUnifiedEvents(user);

    const now = new Date();

    const upcoming = useMemo(() => {
        const sorted = [...events]
            .filter((e) => new Date(e.end) >= now)
            .sort((a, b) => new Date(a.start) - new Date(b.start));
        return sorted.slice(0, maxItems);
    }, [events, maxItems]);

    return (
        <div className="rounded-2xl2 bg-white/95 backdrop-blur border border-slate-200/70 shadow-card h-full flex flex-col">
            {/* Header */}
            <div className="px-7 pt-6 pb-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-500 uppercase">
                            Upcoming
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                            Today · {formatDateLabel(now)}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/schedule?intent=create")}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:opacity-90"
                    >
                        + Add event
                    </button>
                </div>
            </div>

            {/* Event List */}
            <div className="px-5 pb-6 space-y-2 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center">
                        <div className="text-xs font-semibold text-slate-500">Loading your schedule…</div>
                    </div>
                ) : upcoming.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                        <div className="text-sm font-extrabold text-slate-900">
                            No upcoming events
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                            Click + Add event to plan your first item.
                        </div>
                    </div>
                ) : (
                    upcoming.map((e) => {
                        const start = new Date(e.start);
                        const isToday = isSameDay(start, now);
                        const dot = e.resource === "Personal" ? "#10B981" : e.resource === "School" ? "#3B82F6" : "#8B5CF6";

                        return (
                            <button
                                key={e.id}
                                type="button"
                                onClick={() =>
                                    navigate(`/schedule?focus=${encodeURIComponent(e.id)}`)
                                }
                                className="
                                    group w-full text-left rounded-2xl px-4 py-4
                                    bg-white
                                    border border-slate-200/60
                                    shadow-soft
                                    hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]
                                    hover:-translate-y-[1px]
                                    transition
                                "
                            >
                                <div className="flex gap-3">
                                    <div
                                        className="mt-1 h-10 w-[4px] rounded-full"
                                        style={{ backgroundColor: dot }}
                                        aria-hidden="true"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="truncate text-sm font-extrabold text-slate-900">
                                                {e.title}
                                            </div>
                                            <div className="shrink-0 text-xs font-semibold text-slate-500">
                                                {formatTime(e.start)}–{formatTime(e.end)}
                                            </div>
                                        </div>

                                        <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500">
                                            <div className="truncate">
                                                {isToday ? "Today" : formatDateLabel(e.start)}
                                            </div>
                                            {e.location ? (
                                                <div className="truncate">{e.location}</div>
                                            ) : null}
                                        </div>

                                        <div className="mt-3">
                                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-extrabold text-slate-600">
                                                {e.resource}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="px-7 pb-5 pt-3 border-t border-slate-200/50">
                <button
                    type="button"
                    onClick={() => navigate("/schedule")}
                    className="text-xs font-semibold text-slate-900 hover:underline"
                >
                    View full schedule →
                </button>
            </div>
        </div>
    );
}

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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-slate-900">Upcoming</div>
                    <div className="mt-1 text-xs text-slate-500">
                        Today · {formatDateLabel(now)}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/schedule?intent=create")}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                    + Add event
                </button>
            </div>

            <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                        Loading your schedule…
                    </div>
                ) : upcoming.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">
                            No upcoming events
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                            Click + Add event to plan your first item.
                        </div>
                    </div>
                ) : (
                    upcoming.map((e) => {
                        const start = new Date(e.start);
                        const isToday = isSameDay(start, now);
                        const dot = e.resource === "Personal" ? "#10B981" : "#3B82F6";

                        return (
                            <button
                                key={e.id}
                                type="button"
                                onClick={() =>
                                    navigate(`/schedule?focus=${encodeURIComponent(e.id)}`)
                                }
                                className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="mt-1 h-10 w-1.5 rounded-full"
                                        style={{ backgroundColor: dot }}
                                        aria-hidden="true"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="truncate text-sm font-semibold text-slate-900">
                                                {e.title}
                                            </div>
                                            <div className="shrink-0 text-xs text-slate-500">
                                                {formatTime(e.start)}–{formatTime(e.end)}
                                            </div>
                                        </div>

                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-slate-500">
                                                {isToday ? "Today" : formatDateLabel(e.start)}
                                            </span>

                                            {e.location ? (
                                                <span className="text-xs text-slate-500">
                                                    · {e.location}
                                                </span>
                                            ) : null}

                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                                {e.resource}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
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

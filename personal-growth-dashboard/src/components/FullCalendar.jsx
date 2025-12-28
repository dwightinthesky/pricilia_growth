import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

import { expandRecurringEvents } from "../utils/recurrence";

import {
    eventsCreate,
    eventsGetAll,
    eventsSubscribe,
    eventsUpdate,
    eventsRemove,
} from "../services/dataClient/eventsClient";
import { goalsGetAll, goalsCreate } from "../services/dataClient/goalsClient";
import { getSchoolEventsForUser } from "../services/dataClient/calendarSourceClient";
import { useAuth } from "../context/AuthContext";
import { normalizeEvents } from "../utils/calendarHelpers";

import ScheduleToolbar from "./ScheduleToolbar";
import CalendarEventCard from "./CalendarEventCard";
import { X } from "lucide-react";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const DnDCalendar = withDragAndDrop(Calendar);

// Color palette
const PALETTE = {
    School: { accent: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
    Personal: { accent: "#10B981", bg: "rgba(16,185,129,0.12)" },
    Work: { accent: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
    Study: { accent: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
    Health: { accent: "#F59E0B", bg: "rgba(245,158,11,0.14)" },
};

function pickEventColors(event) {
    const key = event.category || event.resource || "Personal";
    return PALETTE[key] || { accent: "#0f172a", bg: "rgba(15,23,42,0.08)" };
}

function toLocalInputValue(date) {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromLocalInputValue(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

const ensureValidRange = (nextStart, nextEnd) => {
    if (!nextStart || !nextEnd) return { start: nextStart, end: nextEnd };
    if (nextEnd.getTime() <= nextStart.getTime()) {
        return { start: nextStart, end: new Date(nextStart.getTime() + 60 * 60000) };
    }
    return { start: nextStart, end: nextEnd };
};

const addMinutes = (date, minutes) => {
    if (!date) return null;
    return new Date(date.getTime() + minutes * 60000);
};

export default function FullCalendar({ height = "100%" }) {
    const { currentUser: user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Controlled Calendar State
    const [activeDate, setActiveDate] = useState(new Date());
    const [activeView, setActiveView] = useState(Views.WEEK);
    const [focusedEventId, setFocusedEventId] = useState(null);
    const [scrollToTime, setScrollToTime] = useState(new Date());

    // Events
    const [rawEvents, setRawEvents] = useState([]);
    const [events, setEvents] = useState([]);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: "", start: null, end: null });
    const [editingEventId, setEditingEventId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Extra*up Goals
    const [goals, setGoals] = useState([]);

    // Quick Goal Creation State
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [newGoalCategory, setNewGoalCategory] = useState("Study");
    const [newGoalWeekly, setNewGoalWeekly] = useState(6);
    const [newGoalTargetDate, setNewGoalTargetDate] = useState(() => {
        const d = new Date(Date.now() + 90 * 86400000);
        return d.toISOString().slice(0, 10);
    });

    // Visible range for recurring event expansion
    const [visibleRange, setVisibleRange] = useState(() => {
        const start = new Date();
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        return { start, end };
    });

    // Helper functions for occurrence handling
    const toDayKey = (d) => {
        const x = new Date(d);
        const y = x.getFullYear();
        const m = String(x.getMonth() + 1).padStart(2, "0");
        const day = String(x.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const parseOccurrenceId = (id) => {
        const s = String(id || "");
        const idx = s.indexOf("::");
        if (idx === -1) return null;
        return { parentId: s.slice(0, idx), occStartISO: s.slice(idx + 2) };
    };

    const getBaseEventById = (id) => {
        return (rawEvents || []).find((e) => String(e.id) === String(id));
    };

    // Query strings: intent=create & focus=eventId
    useEffect(() => {
        const intent = searchParams.get("intent");
        const focus = searchParams.get("focus");

        if (intent === "create") {
            const now = new Date();
            const later = new Date(now.getTime() + 60 * 60 * 1000);

            setEditingEventId(null);
            setNewEvent({ title: "", start: now, end: later });
            setIsModalOpen(true);

            setSearchParams((prev) => {
                const p = new URLSearchParams(prev);
                p.delete("intent");
                return p;
            });
        }

        if (focus) setFocusedEventId(focus);
        if (focus) setFocusedEventId(focus);

        // Pre-select goal if present in URL
        const goalId = searchParams.get("extraUpGoalId");
        if (goalId) {
            setNewEvent(prev => ({ ...prev, extraUpGoalId: goalId }));
            // If intent=create was also passed, this will be handled but we might want to confirm it's captured
        }
    }, [searchParams, setSearchParams]);

    // Load School + subscribe Personal + Load Goals
    useEffect(() => {
        if (!user) return;

        let unsub = () => { };

        const run = async () => {
            // 0. Load Goals
            const startGoals = (goalsGetAll() || []).filter(g => g.userId === user.uid);
            setGoals(startGoals);

            // A) School
            let schoolEvents = [];
            try {
                schoolEvents = await getSchoolEventsForUser(user);
            } catch (e) {
                console.error("Failed to load school calendar", e);
            }

            // B) Personal from dataClient
            const project = (allEvents) => {
                const personal = (allEvents || [])
                    .filter((ev) => ev.userId === user.uid)
                    .map((data) => {
                        const startDate = new Date(data.start);
                        const endDate = new Date(startDate.getTime() + (data.duration || 60) * 60000);

                        return {
                            id: data.id,
                            title: data.title,
                            start: startDate,
                            end: endDate,
                            resource: "Personal",
                            location: "",
                            category: data.category || "Personal",
                            allDay: false,
                            extraUpGoalId: data.extraUpGoalId || null,
                        };
                    });

                const combined = [...schoolEvents, ...personal];
                setRawEvents(combined);

                const normalized = normalizeEvents(combined);
                setEvents(normalized);

                // Focus handling once events are ready
                const focusId = searchParams.get("focus");
                if (focusId) {
                    const target = normalized.find((e) => String(e.id) === String(focusId));
                    if (target?.start) {
                        setActiveDate(new Date(target.start));
                        setActiveView(Views.DAY);
                        setScrollToTime(new Date(target.start));
                        setFocusedEventId(focusId);

                        setSearchParams((prev) => {
                            const p = new URLSearchParams(prev);
                            p.delete("focus");
                            return p;
                        });
                    }
                }
            };

            project(eventsGetAll());
            unsub = eventsSubscribe((all) => project(all));
        };

        run();
        return () => unsub();
    }, [user, searchParams, setSearchParams]);

    // Auto-fade focused event after 2 seconds (product-grade UX)
    useEffect(() => {
        if (!focusedEventId) return;

        const timer = setTimeout(() => {
            setFocusedEventId(null);
        }, 2000);

        return () => clearTimeout(timer);
    }, [focusedEventId]);

    // Expand recurring events based on visible range + Optional Goal Filter
    const displayEvents = useMemo(() => {
        const goalFilterId = searchParams.get("extraUp");
        let sourceEvents = events;

        if (goalFilterId) {
            sourceEvents = events.filter((e) => String(e.extraUpGoalId) === String(goalFilterId));
        }

        return expandRecurringEvents(sourceEvents, visibleRange.start, visibleRange.end);
    }, [events, visibleRange, searchParams]);

    const eventStyleGetter = (event) => {
        const isFocused = String(event.id) === String(focusedEventId);
        const { accent, bg } = pickEventColors(event);

        return {
            style: {
                backgroundColor: bg,
                color: "rgba(15, 23, 42, 0.92)",
                border: isFocused ? "1px solid rgba(15, 23, 42, 0.22)" : "1px solid rgba(15, 23, 42, 0.08)",
                borderLeft: `4px solid ${accent}`,
                borderRadius: "12px",
                boxShadow: isFocused ? "0 14px 35px rgba(15, 23, 42, 0.18)" : "0 6px 18px rgba(15, 23, 42, 0.10)",
                padding: "6px 8px",
                overflow: "hidden",
            },
        };
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewEvent({ title: "", start: null, end: null });
        setEditingEventId(null);
    };

    const handleSelectSlot = ({ start, end }) => {
        setEditingEventId(null);
        // Preserve extraUpGoalId if it was set via URL param
        setNewEvent(prev => ({ ...prev, title: "", start, end }));
        setIsModalOpen(true);
    };

    const handleSaveEvent = async () => {
        if (!newEvent.title.trim() || !user || !newEvent.start || !newEvent.end) return;

        setIsSaving(true);
        try {
            const duration = (newEvent.end.getTime() - newEvent.start.getTime()) / 60000;

            const payload = {
                userId: user.uid,
                title: newEvent.title.trim(),
                start: newEvent.start.toISOString(),
                duration: Math.max(15, Math.round(duration)),
                category: "Personal",
                updatedAt: new Date().toISOString(),
                extraUpGoalId: newEvent.extraUpGoalId || null,
            };

            if (editingEventId) {
                eventsUpdate(editingEventId, payload);
            } else {
                eventsCreate({ ...payload, createdAt: new Date().toISOString() });
            }

            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!editingEventId) return;
        const ok = window.confirm("Delete this event?");
        if (!ok) return;

        setIsSaving(true);
        try {
            eventsRemove(editingEventId);
            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkipOccurrence = async () => {
        // Only recurring occurrences can be skipped
        if (!newEvent._isOccurrence || !newEvent._parentId || !newEvent._occurrenceDayKey) return;

        const parentId = newEvent._parentId;
        const dayKey = newEvent._occurrenceDayKey;

        const parent = getBaseEventById(parentId);
        if (!parent) return;

        const nextExceptions = Array.from(new Set([...(parent.exceptions || []), dayKey]));

        setIsSaving(true);
        try {
            eventsUpdate(parentId, {
                exceptions: nextExceptions,
                updatedAt: new Date().toISOString(),
            });
            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditOnlyThisOccurrence = async () => {
        if (!newEvent._isOccurrence || !newEvent._parentId || !newEvent._occurrenceDayKey) return;

        const parentId = newEvent._parentId;
        const dayKey = newEvent._occurrenceDayKey;

        const parent = getBaseEventById(parentId);
        if (!parent) return;

        const nextOverrides = {
            ...(parent.overrides || {}),
            [dayKey]: {
                title: newEvent.title?.trim() || parent.title,
                start: newEvent.start?.toISOString(),
                duration: Math.max(15, Math.round((newEvent.end.getTime() - newEvent.start.getTime()) / 60000)),
            },
        };

        setIsSaving(true);
        try {
            eventsUpdate(parentId, {
                overrides: nextOverrides,
                updatedAt: new Date().toISOString(),
            });
            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    // DnD: only Personal can move/resize
    const updatePersonalEventTime = (eventId, nextStart, nextEnd) => {
        const duration = Math.max(15, Math.round((nextEnd.getTime() - nextStart.getTime()) / 60000));
        eventsUpdate(eventId, {
            start: nextStart.toISOString(),
            duration,
            updatedAt: new Date().toISOString(),
        });
    };

    const handleEventDrop = ({ event, start, end }) => {
        if (event.resource !== "Personal") return;
        updatePersonalEventTime(event.id, new Date(start), new Date(end));
    };

    const handleEventResize = ({ event, start, end }) => {
        if (event.resource !== "Personal") return;
        updatePersonalEventTime(event.id, new Date(start), new Date(end));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3" style={{ height }}>
            {searchParams.get("extraUp") && (
                <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-indigo-50/50 px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            <div className="text-xs font-extrabold text-slate-700">
                                Filtering: Goal related sessions
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSearchParams((prev) => {
                                    const p = new URLSearchParams(prev);
                                    p.delete("extraUp");
                                    return p;
                                });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Clear filter
                        </button>
                    </div>

                    {/* Contextual Hint */}
                    {(() => {
                        const gid = searchParams.get("extraUp");
                        const g = goals.find(g => String(g.id) === String(gid));
                        if (!g) return null;

                        // Quick calc for this week
                        const now = new Date();
                        const startOfWeek = new Date(now);
                        const day = startOfWeek.getDay();
                        const diff = (day === 0 ? -6 : 1) - day;
                        startOfWeek.setDate(startOfWeek.getDate() + diff);
                        startOfWeek.setHours(0, 0, 0, 0);

                        const weekMinutes = events
                            .filter(e => String(e.extraUpGoalId) === String(gid))
                            .filter(e => new Date(e.start) >= startOfWeek)
                            .reduce((sum, e) => sum + (Number(e.duration) || 60), 0);

                        const expected = (g.weeklyCommitment || 0) * 60;
                        const ratio = expected > 0 ? weekMinutes / expected : 1;

                        if (ratio < 0.8) {
                            return (
                                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                                    <span>⚠️</span>
                                    <span>
                                        This week you’re behind on "{g.title}". Consider scheduling one more session.
                                    </span>
                                </div>
                            );
                        }
                        if (ratio > 1.4) {
                            return (
                                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                                    <span>🧊</span>
                                    <span>
                                        You’re pushing hard on "{g.title}". Make sure to rest.
                                    </span>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            )}

            {displayEvents.length === 0 ? (
                <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div className="text-sm font-extrabold text-slate-900">No schedules yet</div>
                    <div className="mt-2 text-xs font-semibold text-slate-600">
                        Press <span className="rounded-lg bg-slate-100 px-2 py-1">⌘K</span> to create your first event,
                        or click any empty slot to add one.
                    </div>

                    <div className="mt-4 flex justify-center">
                        <button
                            type="button"
                            onClick={() => {
                                setEditingEventId(null);
                                setNewEvent({
                                    title: "",
                                    start: new Date(),
                                    end: new Date(Date.now() + 60 * 60 * 1000),
                                    repeat: "none",
                                    repeatUntil: null,
                                    exceptions: []
                                });
                                setIsModalOpen(true);
                            }}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:opacity-90"
                        >
                            Create an event
                        </button>
                    </div>
                </div>
            ) : null}
            <DnDCalendar
                localizer={localizer}
                events={displayEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                date={activeDate}
                view={activeView}
                onNavigate={(date) => setActiveDate(date)}
                onView={(v) => setActiveView(v)}
                onRangeChange={(range) => {
                    if (Array.isArray(range) && range.length) {
                        setVisibleRange({ start: range[0], end: range[range.length - 1] });
                    } else if (range?.start && range?.end) {
                        setVisibleRange({ start: range.start, end: range.end });
                    }
                }}
                defaultView={Views.WEEK}
                views={["month", "week", "day"]}
                step={activeView === Views.DAY ? 30 : 60}
                timeslots={activeView === Views.DAY ? 2 : 1}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={(event) => {
                    setFocusedEventId(String(event.id));

                    // only allow edit Personal
                    if (event.resource !== "Personal") return;

                    const occ = parseOccurrenceId(event.id);
                    const base = occ ? getBaseEventById(occ.parentId) : getBaseEventById(event.id);

                    setEditingEventId(String(base?.id || event.id));

                    setNewEvent({
                        title: base?.title || event.title || "",
                        start: new Date(event.start),
                        end: new Date(event.end),
                        repeat: base?.repeat || "none",
                        repeatUntil: base?.repeatUntil || null,
                        exceptions: base?.exceptions || [],
                        _occurrenceDayKey: occ ? toDayKey(new Date(occ.occStartISO)) : null,
                        _isOccurrence: Boolean(occ),
                        _parentId: occ ? occ.parentId : null,
                        extraUpGoalId: base?.extraUpGoalId || event.extraUpGoalId || null,
                    });

                    setIsModalOpen(true);
                }}
                scrollToTime={scrollToTime}
                eventPropGetter={(event) => {
                    const base = eventStyleGetter(event, focusedEventId);
                    const isFocused = String(event.id) === String(focusedEventId);
                    return {
                        ...base,
                        className: isFocused ? "rbc-event--focusPulse" : "",
                    };
                }}
                components={{
                    toolbar: ScheduleToolbar,
                    event: CalendarEventCard,
                }}
                draggableAccessor={(e) => e.resource === "Personal" && !e.isOccurrence}
                resizableAccessor={(e) => e.resource === "Personal" && !e.isOccurrence}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                resizable
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">{editingEventId ? "Edit Event" : "Create Event"}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Enter event name..."
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300"
                                    autoFocus
                                />
                            </div>

                            {/* Link to Goal */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Link to Extra*up
                                </label>

                                <div className="flex gap-2">
                                    <select
                                        value={newEvent.extraUpGoalId || ""}
                                        onChange={(e) => setNewEvent({ ...newEvent, extraUpGoalId: e.target.value || null })}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    >
                                        <option value="">None</option>
                                        {goals.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.title}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => setShowNewGoal((v) => !v)}
                                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        + New
                                    </button>
                                </div>

                                {showNewGoal && (
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-extrabold text-slate-600">
                                                    Goal title
                                                </label>
                                                <input
                                                    value={newGoalTitle}
                                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                                    placeholder="Microsoft SQL Certification"
                                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-600">
                                                    Category
                                                </label>
                                                <select
                                                    value={newGoalCategory}
                                                    onChange={(e) => setNewGoalCategory(e.target.value)}
                                                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                >
                                                    <option>Study</option>
                                                    <option>Career</option>
                                                    <option>Exam</option>
                                                    <option>Health</option>
                                                    <option>Personal</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-600">
                                                    Weekly (h)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={newGoalWeekly}
                                                    onChange={(e) => setNewGoalWeekly(e.target.value)}
                                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-600">
                                                    Target date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newGoalTargetDate}
                                                    onChange={(e) => setNewGoalTargetDate(e.target.value)}
                                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewGoal(false)}
                                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!newGoalTitle.trim()}
                                                onClick={() => {
                                                    const now = new Date();
                                                    const goal = {
                                                        id: crypto.randomUUID?.() || String(Date.now()),
                                                        userId: user.uid,
                                                        title: newGoalTitle.trim(),
                                                        category: newGoalCategory,
                                                        startDate: now.toISOString(),
                                                        targetDate: new Date(newGoalTargetDate).toISOString(),
                                                        weeklyCommitment: Number(newGoalWeekly) || 0,
                                                        status: "active",
                                                        createdAt: now.toISOString(),
                                                        updatedAt: now.toISOString(),
                                                    };

                                                    goalsCreate(goal);

                                                    // auto-select using existing newEvent state
                                                    setNewEvent(prev => ({ ...prev, extraUpGoalId: goal.id }));

                                                    // reset mini form
                                                    setNewGoalTitle("");
                                                    setShowNewGoal(false);
                                                }}
                                                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                                            >
                                                Create & link
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start</label>
                                    <input
                                        type="datetime-local"
                                        step={300}
                                        value={toLocalInputValue(newEvent.start)}
                                        onChange={(e) => {
                                            const nextStart = fromLocalInputValue(e.target.value);
                                            const fixed = ensureValidRange(nextStart, newEvent.end);
                                            setNewEvent((prev) => ({ ...prev, start: fixed.start, end: fixed.end }));
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">End</label>
                                    <input
                                        type="datetime-local"
                                        step={300}
                                        value={toLocalInputValue(newEvent.end)}
                                        onChange={(e) => {
                                            const nextEnd = fromLocalInputValue(e.target.value);
                                            const fixed = ensureValidRange(newEvent.start, nextEnd);
                                            setNewEvent((prev) => ({ ...prev, start: fixed.start, end: fixed.end }));
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300 text-sm"
                                    />
                                    <div className="mt-2 flex gap-2">
                                        {[15, 30, 60].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => {
                                                    const base = newEvent.end || newEvent.start;
                                                    const nextEnd = addMinutes(base, m);
                                                    const fixed = ensureValidRange(newEvent.start, nextEnd);
                                                    setNewEvent((prev) => ({ ...prev, end: fixed.end }));
                                                }}
                                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                +{m}m
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={closeModal}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                {editingEventId ? (
                                    <button
                                        onClick={handleDeleteEvent}
                                        disabled={isSaving}
                                        className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                ) : null}

                                <button
                                    onClick={handleSaveEvent}
                                    disabled={isSaving || !newEvent.title.trim()}
                                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "Saving..." : editingEventId ? "Save changes" : "Create"}
                                </button>
                            </div>

                            <div className="text-[11px] text-slate-500">
                                Tip: Drag & resize is enabled for Personal events only.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

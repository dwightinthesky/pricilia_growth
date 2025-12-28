import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchUserCalendar } from '../utils/calendarUtils';
import { normalizeEvents } from '../utils/calendarHelpers';
import ScheduleToolbar from './ScheduleToolbar';
import CalendarEventCard from './CalendarEventCard';
import { X } from 'lucide-react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Color palette for auto-coloring events
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

const FullCalendar = ({ height = '100%' }) => {
    const { currentUser: user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Controlled Calendar State
    const [activeDate, setActiveDate] = useState(new Date());
    const [activeView, setActiveView] = useState(Views.WEEK);
    const [focusedEventId, setFocusedEventId] = useState(null);

    const [events, setEvents] = useState([]);
    const [rawEvents, setRawEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', start: null, end: null });
    const [editingEventId, setEditingEventId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Handle query strings: intent=create & focus=eventId
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

        if (focus) {
            setFocusedEventId(focus);
            // Don't delete focus yet - wait for events to load
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (!user) return;

        let unsubStorage = () => { };

        const loadData = async () => {
            // A. School Events
            let schoolEvents = [];
            try {
                const configs = storage.get(STORAGE_KEYS.USER_CONFIG);
                const userConfig = configs.find(c => c.id === user.uid);

                if (userConfig && userConfig.calendarSource) {
                    const rawEvents = await fetchUserCalendar(userConfig);
                    schoolEvents = rawEvents.map(ev => ({
                        id: `school-${ev.start}`,
                        title: ev.title.split(' - ')[0],
                        start: ev.start,
                        end: ev.end,
                        resource: 'School',
                        location: ev.location || '',
                        allDay: false
                    }));
                }
            } catch (err) {
                console.error("Failed to load school calendar", err);
            }

            // B. Personal Events
            const loadPersonalEvents = (allEvents) => {
                const personalEvents = allEvents
                    .filter(ev => ev.userId === user.uid)
                    .map(data => {
                        const startDate = new Date(data.start);
                        const endDate = new Date(startDate.getTime() + (data.duration || 60) * 60000);

                        return {
                            id: data.id,
                            title: data.title,
                            start: startDate,
                            end: endDate,
                            resource: 'Personal',
                            location: '',
                            category: 'Personal',
                            allDay: false
                        };
                    });

                const combined = [...schoolEvents, ...personalEvents];
                setRawEvents(combined);

                const normalized = normalizeEvents(combined);
                setEvents(normalized);

                // Focus handling (after events are ready)
                const focusId = searchParams.get("focus");
                if (focusId) {
                    const target = normalized.find((e) => String(e.id) === String(focusId));
                    if (target?.start) {
                        setActiveDate(new Date(target.start));
                        setActiveView(Views.DAY);
                        setFocusedEventId(focusId);

                        setSearchParams((prev) => {
                            const p = new URLSearchParams(prev);
                            p.delete("focus");
                            return p;
                        });
                    }
                }
            };

            const storedEvents = storage.get(STORAGE_KEYS.EVENTS);
            loadPersonalEvents(storedEvents);

            unsubStorage = storage.subscribe(STORAGE_KEYS.EVENTS, (allEvents) => {
                loadPersonalEvents(allEvents);
            });
        };

        loadData();
        return () => unsubStorage();
    }, [user, searchParams, setSearchParams]);

    const eventStyleGetter = (event, focusedId) => {
        const isFocused = String(event.id) === String(focusedId);
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

    const handleSelectSlot = ({ start, end }) => {
        setEditingEventId(null);
        setNewEvent({ title: "", start, end });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewEvent({ title: "", start: null, end: null });
        setEditingEventId(null);
    };

    const handleSaveEvent = async () => {
        if (!newEvent.title.trim() || !user || !newEvent.start || !newEvent.end) return;

        setIsSaving(true);

        const duration = (newEvent.end.getTime() - newEvent.start.getTime()) / (1000 * 60);

        const payload = {
            userId: user.uid,
            title: newEvent.title.trim(),
            start: newEvent.start.toISOString(),
            duration: Math.max(15, Math.round(duration)),
            updatedAt: new Date().toISOString(),
        };

        try {
            if (editingEventId) {
                const all = storage.get(STORAGE_KEYS.EVENTS) || [];
                const next = all.map((e) => {
                    if (String(e.id) !== String(editingEventId)) return e;
                    return { ...e, ...payload };
                });
                storage.set(STORAGE_KEYS.EVENTS, next);
            } else {
                storage.add(STORAGE_KEYS.EVENTS, {
                    ...payload,
                    createdAt: new Date().toISOString(),
                });
            }

            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!editingEventId || !user) return;

        const ok = window.confirm("Delete this event?");
        if (!ok) return;

        setIsSaving(true);

        try {
            const all = storage.get(STORAGE_KEYS.EVENTS) || [];
            const next = all.filter((e) => String(e.id) !== String(editingEventId));
            storage.set(STORAGE_KEYS.EVENTS, next);
            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    // Time editing helpers
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

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3" style={{ height }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                date={activeDate}
                view={activeView}
                onNavigate={(date) => setActiveDate(date)}
                onView={(v) => setActiveView(v)}
                defaultView={Views.WEEK}
                views={['month', 'week', 'day']}
                step={60}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={(event) => {
                    setFocusedEventId(String(event.id));
                    setEditingEventId(String(event.id));
                    setNewEvent({
                        title: event.title || "",
                        start: new Date(event.start),
                        end: new Date(event.end),
                    });
                    setIsModalOpen(true);
                }}
                eventPropGetter={(event) => eventStyleGetter(event, focusedEventId)}
                components={{
                    toolbar: ScheduleToolbar,
                    event: CalendarEventCard,
                }}
            />

            {/* Premium Event Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingEventId ? "Edit Event" : "Create Event"}
                            </h3>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FullCalendar;

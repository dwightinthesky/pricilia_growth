import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, ArrowRight, Calendar } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchUserCalendar } from '../utils/calendarUtils';
import { format, isToday, isTomorrow } from 'date-fns';

const UpcomingAgenda = () => {
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let unsubStorage = () => { };

        const loadEvents = async () => {
            setLoading(true);
            let allEvents = [];

            // Load School Events
            try {
                const configs = storage.get(STORAGE_KEYS.USER_CONFIG);
                const userConfig = configs.find(c => c.id === user.uid);

                if (userConfig && userConfig.calendarSource) {
                    const rawEvents = await fetchUserCalendar(userConfig);
                    const schoolEvents = rawEvents.map(ev => ({
                        title: ev.title.split(' - ')[0],
                        start: new Date(ev.start),
                        end: new Date(ev.end),
                        type: 'School',
                        location: ev.location || 'TBA'
                    }));
                    allEvents = [...allEvents, ...schoolEvents];
                }
            } catch (err) {
                console.error("Failed to load school calendar", err);
            }

            // Load Personal Events
            const loadPersonalEvents = (personalData) => {
                const personalEvents = personalData
                    .filter(ev => ev.userId === user.uid)
                    .map(data => ({
                        title: data.title,
                        start: new Date(data.start),
                        end: new Date(new Date(data.start).getTime() + (data.duration || 60) * 60000),
                        type: 'Personal',
                        location: ''
                    }));

                // Combine and sort
                const combined = [...allEvents, ...personalEvents];
                const now = new Date();
                const upcoming = combined
                    .filter(ev => ev.start >= now)
                    .sort((a, b) => a.start - b.start)
                    .slice(0, 5);

                setUpcomingEvents(upcoming);
                setLoading(false);
            };

            const storedEvents = storage.get(STORAGE_KEYS.EVENTS);
            loadPersonalEvents(storedEvents);

            unsubStorage = storage.subscribe(STORAGE_KEYS.EVENTS, loadPersonalEvents);
        };

        loadEvents();
        return () => unsubStorage();
    }, [user]);

    const getDateLabel = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'MMM d');
    };

    return (
        <div className="bg-white rounded-3xl p-6 h-full flex flex-col border border-stone-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 text-stone-500 mb-1">
                        <Calendar size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Upcoming</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">{getDateLabel(new Date())}</h3>
                </div>
            </div>

            {/* Event List */}
            <div className="flex-1 space-y-3 overflow-y-auto">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-stone-100 rounded-xl"></div>
                        ))}
                    </div>
                ) : upcomingEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                            <Calendar size={20} className="text-stone-400" />
                        </div>
                        <p className="text-sm text-stone-500 mb-1">No upcoming events</p>
                        <p className="text-xs text-stone-400">Your schedule is clear</p>
                    </div>
                ) : (
                    upcomingEvents.map((event, index) => (
                        <div
                            key={index}
                            className="group p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer"
                            onClick={() => navigate('/schedule')}
                        >
                            <div className="flex items-start gap-3">
                                {/* Left Color Bar */}
                                <div className={`w-1 h-full rounded-full ${event.type === 'Personal' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

                                <div className="flex-1 min-w-0">
                                    {/* Time */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock size={12} className="text-stone-400" />
                                        <span className="text-xs font-semibold text-stone-500">
                                            {format(event.start, 'HH:mm')} – {format(event.end, 'HH:mm')}
                                        </span>
                                        <span className="text-xs text-stone-400">{getDateLabel(event.start)}</span>
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-semibold text-stone-900 mb-1 text-sm truncate group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h4>

                                    {/* Meta */}
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${event.type === 'Personal'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-blue-50 text-blue-700'
                                            }`}>
                                            {event.type}
                                        </span>
                                        {event.location && (
                                            <span className="text-xs text-stone-500 truncate">{event.location}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-stone-200 space-y-2">
                <button
                    onClick={() => navigate('/schedule')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm"
                >
                    <Plus size={16} />
                    Add event
                </button>
                <button
                    onClick={() => navigate('/schedule')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors font-medium text-sm"
                >
                    View full schedule
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default UpcomingAgenda;

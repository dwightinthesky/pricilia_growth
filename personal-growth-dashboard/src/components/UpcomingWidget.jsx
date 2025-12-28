import React, { useEffect, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, MapPin, User, Clock, Settings } from 'lucide-react';
import CalendarOnboarding from './CalendarOnboarding';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchUserCalendar } from '../utils/calendarUtils';

import { useTranslation } from 'react-i18next';

const UpcomingWidget = () => {
    const { t } = useTranslation();
    const { currentUser: user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [displayDate, setDisplayDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const DEFAULT_CALENDAR_URL = "https://orbit.escp.eu/api/calendars/getSpecificCalendar/2f6b7c9855f563b1ad9d3f5e221a2d60f3f3fdb2";

    useEffect(() => {
        const loadEvents = async (sourceData) => {
            try {
                setLoading(true);
                const events = await fetchUserCalendar(sourceData);
                if (Array.isArray(events)) {
                    processEvents(events);
                }
            } catch (err) {
                console.error("Widget Load Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!user) {
            loadEvents({ calendarType: 'url', calendarSource: DEFAULT_CALENDAR_URL });
            return;
        }

        // Initial Load
        const configs = storage.get(STORAGE_KEYS.USER_CONFIG);
        const userConfig = configs.find(c => c.id === user.uid);

        if (userConfig && userConfig.calendarSource) {
            loadEvents(userConfig);
        } else {
            loadEvents({ calendarType: 'url', calendarSource: DEFAULT_CALENDAR_URL });
        }

        // Subscribe
        const unsub = storage.subscribe(STORAGE_KEYS.USER_CONFIG, (allConfigs) => {
            const updatedConfig = allConfigs.find(c => c.id === user.uid);
            if (updatedConfig && updatedConfig.calendarSource) {
                loadEvents(updatedConfig);
            }
        });

        return () => unsub();
    }, [user]);

    const processEvents = (events) => {
        try {
            const now = new Date();
            const allEvents = events
                .filter(ev => {
                    return ev.start && !isNaN(new Date(ev.start)) && new Date(ev.start) > new Date(now.getTime() - 24 * 60 * 60 * 1000);
                })
                .sort((a, b) => new Date(a.start) - new Date(b.start));

            let targetEvents = allEvents.filter(ev => isSameDay(new Date(ev.start), now));
            let targetDateVal = now;

            if (targetEvents.length === 0 && allEvents.length > 0) {
                targetDateVal = new Date(allEvents[0].start);
                targetEvents = allEvents.filter(ev => isSameDay(new Date(ev.start), targetDateVal));
            }

            setSchedule(targetEvents);
            setDisplayDate(targetDateVal);
        } catch (e) {
            console.error("Process Events Error:", e);
        }
    };

    const getProfName = (desc) => {
        const safeDesc = String(desc || "");
        if (safeDesc.length < 3) return "Unknown";

        try {
            const regex = /(?:Professor|Enseignant|Teacher|Instructor).*?(?:&#58;|:)\s*(.*?)(?:<br|\n|$)/i;
            const match = safeDesc.match(regex);

            if (match && match[1] && match[1].trim().length > 0) {
                return match[1].replace(/<[^>]*>/g, '').trim();
            }

            const cleanText = safeDesc.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
            const lines = cleanText.split('\n')
                .map(l => l.trim())
                .filter(l =>
                    l.length > 2 &&
                    !l.includes('http') &&
                    !l.includes('zoom.us') &&
                    !l.startsWith('Course')
                );

            return lines.length > 0 ? lines[0] : "Unknown";
        } catch (e) {
            return "Unknown";
        }
    };

    const cleanLocation = (rawLoc) => {
        const safeLoc = String(rawLoc || "TBA");
        try {
            const match = safeLoc.match(/CHP_([^\/]+)/);
            if (match) return match[1];

            return safeLoc
                .replace(/Paris|Champerret|Montparnasse|Campus/gi, '')
                .replace(/^[-\s,]+/, '')
                .trim();
        } catch (e) {
            return safeLoc;
        }
    };

    return (
        <div className="bg-white p-6 h-full flex flex-col rounded-[2rem] overflow-hidden group border-0">

            <div className="flex justify-between items-center mb-6 h-5">
                <div className="flex items-center space-x-2 text-neutral-500">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5">
                        {isSameDay(displayDate, new Date()) ? t('upcoming.today') : `${t('upcoming.upcoming')} (${format(displayDate, 'MMM d')})`}
                    </span>
                </div>
                <button onClick={() => setShowSettings(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-black">
                    <Settings size={14} />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col justify-center space-y-3 animate-pulse">
                    <div className="h-4 bg-stone-100 rounded w-1/3"></div>
                    <div className="h-12 bg-stone-50 rounded"></div>
                    <div className="h-12 bg-stone-50 rounded"></div>
                </div>
            ) : schedule.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
                    <p className="text-sm">{t('upcoming.no_classes')}</p>
                    <button onClick={() => setShowSettings(true)} className="text-xs mt-2 underline hover:text-black">{t('upcoming.check_settings')}</button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                    {schedule.map((ev, index) => (
                        <div key={index} className="group relative pl-4 border-l-2 border-stone-100 hover:border-black transition-colors py-1">

                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center text-xs font-mono text-stone-500 font-medium">
                                    <Clock size={10} className="mr-1" />
                                    {ev.start && !isNaN(new Date(ev.start))
                                        ? `${format(new Date(ev.start), 'HH:mm')} - ${format(new Date(ev.end), 'HH:mm')}`
                                        : "--:--"}
                                </div>
                                {/* 🔥 教授名稱欄位加大 */}
                                <div className="flex items-center text-[10px] font-bold text-stone-400 uppercase bg-stone-50 px-2 py-0.5 rounded group-hover:bg-stone-100 transition-colors">
                                    <User size={10} className="mr-1" />
                                    <span className="truncate max-w-[150px]"> {/* 改成 150px */}
                                        {getProfName(ev.description)}
                                    </span>
                                </div>
                            </div>

                            <h4 className="text-sm font-bold text-stone-800 leading-tight mb-1 group-hover:text-black">
                                {ev.title}
                            </h4>

                            <div className="flex items-center text-[11px] text-stone-500 font-medium group-hover:text-stone-700 transition-colors">
                                <MapPin size={10} className="mr-1.5" />
                                <span className="truncate">{cleanLocation(ev.location)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CalendarOnboarding
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={() => { }}
            />
        </div>
    );
};

export default UpcomingWidget;

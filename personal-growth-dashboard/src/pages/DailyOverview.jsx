import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchUserCalendar } from '../utils/calendarUtils';
import { normalizeEvents } from '../utils/calendarHelpers';

import UpcomingScheduleWidget from '../components/UpcomingScheduleWidget';
import ComingSoonCard from '../components/ComingSoonCard';
import ExtraUpGoalsWidget from '../components/ExtraUpGoalsWidget';
import DeadlineTimer from '../components/DeadlineTimer';

import { Sparkles, Home, Bot, Plus, Command, ArrowRight } from 'lucide-react';

export default function DailyOverview() {
    const { t, i18n } = useTranslation();
    const tt = (key, fallback) => t(key, { defaultValue: fallback });
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const [allEvents, setAllEvents] = useState([]);

    useEffect(() => {
        if (!user) return;
        let unsubStorage = () => { };

        const loadData = async () => {
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
                        category: 'School',
                        location: ev.location || '',
                        color: '#3b82f6'
                    }));
                }
            } catch (err) {
                console.error("Failed to load school calendar", err);
            }

            const loadPersonalEvents = (personalData) => {
                const personalEvents = (personalData || [])
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
                            category: 'Personal',
                            color: '#10b981',
                            location: ''
                        };
                    });

                const combined = [...schoolEvents, ...personalEvents];
                setAllEvents(normalizeEvents(combined));
            };

            loadPersonalEvents(storage.get(STORAGE_KEYS.EVENTS));

            unsubStorage = storage.subscribe(STORAGE_KEYS.EVENTS, (allEvs) => {
                loadPersonalEvents(allEvs);
            });
        };

        loadData();
        return () => unsubStorage();
    }, [user]);

    const today = new Date();

    return (
        <div className="max-w-[1200px] mx-auto pb-10">

            {/* 1. Hero Grid Section - Fixed Height (Above the Fold) */}
            <section
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12"
                style={{ height: "calc(100vh - 64px - 48px)" }}
            >

                {/* A. Left (3): Greeting + Goal Stack - min-h-0 for scrolling if needed */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 min-h-0">
                    <div className="shrink-0 rounded-2xl bg-white/80 border border-slate-200/70 shadow-sm p-5">
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase mb-2">
                            {tt('overview.todayOverview', "Today's Overview")}
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            {today.toLocaleDateString(i18n.language === 'zh-TW' ? 'zh-TW' : 'en-US', { weekday: 'long' })}
                        </h1>
                        <div className="text-sm font-semibold text-slate-500">
                            {today.toLocaleDateString(i18n.language === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="mt-6 text-xs font-medium text-slate-400 leading-relaxed">
                            “One habit at a time.”
                        </div>
                    </div>

                    {/* Fills remaining height in left col */}
                    <div className="flex-1 min-h-0">
                        <ExtraUpGoalsWidget />
                    </div>
                </div>

                {/* B. Center (5): Upcoming Calendar - min-h-0 for internal scroll */}
                <div className="col-span-12 lg:col-span-5 min-h-0">
                    {/* H-full to fill column, internal widget handles scroll */}
                    <div className="h-full">
                        <UpcomingScheduleWidget events={allEvents} maxItems={20} />
                    </div>
                </div>

                {/* C. Right (4): Actions + Timer - min-h-0 */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
                    {/* Fixed height items */}
                    <button
                        onClick={() => navigate('/schedule?intent=create')}
                        className="shrink-0 group w-full text-left rounded-2xl bg-slate-900 p-5 shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-[1px] transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-lg bg-white/10 text-white">
                                <Plus size={18} strokeWidth={3} />
                            </div>
                            <ArrowRight size={16} className="text-white/40 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="text-sm font-extrabold text-white">
                            {tt('overview.quickActions.createEvent.title', "Create event")}
                        </div>
                        <div className="text-[11px] font-medium text-white/60">
                            {tt('overview.quickActions.createEvent.subtitle', "Schedule or deadline")}
                        </div>
                    </button>

                    <div className="shrink-0 rounded-2xl bg-white/80 border border-slate-200/70 p-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Command size={16} />
                            <span className="text-xs font-semibold">
                                {tt('overview.quickActions.commandHint', "Press")}
                                {" "}
                                <kbd className="font-sans px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-800 text-[10px] font-bold">
                                    ⌘K
                                </kbd>
                                {" "}
                                {tt('overview.quickActions.commandHintEnd', "to search")}
                            </span>
                        </div>
                    </div>

                    {/* Timer fills remaining space and handles its own size */}
                    <div className="flex-1 min-h-0">
                        <DeadlineTimer />
                    </div>
                </div>
            </section>

            {/* 2. Secondary Content (Scroll to see) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ComingSoonCard
                    title={tt("modules.chores.title", "Chores")}
                    icon={Home}
                    description={tt("modules.chores.description", "Household tasks, without mental load.")}
                    status={tt("modules.status.inProgress", "In progress")}
                    actionLabel={tt("modules.actions.viewRoadmap", "View roadmap")}
                />

                <ComingSoonCard
                    title={tt("common.howieAI", "HowieAI")}
                    icon={Bot}
                    description={tt("modules.howie.description", "Ask anything. Get a plan in seconds.")}
                    status={tt("modules.status.betaSoon", "Beta soon")}
                    actionLabel={tt("modules.actions.learnMore", "Learn more")}
                />

                <ComingSoonCard
                    title={tt("modules.focus.title", "Focus Mode")}
                    icon={Sparkles}
                    description={tt("modules.focus.description", "Block distractions and deep dive.")}
                    status={tt("modules.status.planned", "Planned")}
                    actionLabel={tt("modules.actions.notifyMe", "Notify me")}
                />
            </section>
        </div>
    );
}

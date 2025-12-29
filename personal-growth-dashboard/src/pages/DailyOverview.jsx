import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchUserCalendar } from '../utils/calendarUtils';
import { normalizeEvents } from '../utils/calendarHelpers';

import UpcomingScheduleWidget from '../components/UpcomingScheduleWidget';
import ComingSoonCard from '../components/ComingSoonCard';
import DeadlineTimer from '../components/DeadlineTimer'; // Restored

import { Sparkles, Home, Bot, Plus, Command, ArrowRight } from 'lucide-react';

export default function DailyOverview() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const [allEvents, setAllEvents] = useState([]);

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
                        category: 'School',
                        location: ev.location || '',
                        color: '#3b82f6'
                    }));
                }
            } catch (err) {
                console.error("Failed to load school calendar", err);
            }

            // B. Personal Events
            const loadPersonalEvents = (personalData) => {
                const personalEvents = personalData
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

            const storedEvents = storage.get(STORAGE_KEYS.EVENTS);
            loadPersonalEvents(storedEvents);

            unsubStorage = storage.subscribe(STORAGE_KEYS.EVENTS, (allEvs) => {
                loadPersonalEvents(allEvs);
            });
        };

        loadData();
        return () => unsubStorage();
    }, [user]);

    const today = new Date();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">

            {/* Row 1: Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1A: Quick Greeting & Date (Left) */}
                <div className="lg:col-span-3 flex flex-col justify-between py-2">
                    <div>
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase mb-2">
                            {t("overview.todayOverview")}
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            {today.toLocaleDateString('en-US', { weekday: 'long' })}
                        </h1>
                        <div className="text-sm font-semibold text-slate-500">
                            {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="text-xs font-medium text-slate-400 leading-relaxed">
                            "One habit at a time."
                        </div>
                    </div>
                </div>

                {/* 1B: Main Upcoming Widget (Center - Hero) */}
                <div className="lg:col-span-6 h-[400px]">
                    <UpcomingScheduleWidget events={allEvents} maxItems={4} />
                </div>

                {/* 1C: Quick Actions (Right) & Countdown */}
                <div className="lg:col-span-3 space-y-4">
                    <button
                        onClick={() => navigate('/schedule?intent=create')}
                        className="group w-full text-left rounded-2xl2 bg-slate-900 p-5 shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-[1px] transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-lg bg-white/10 text-white">
                                <Plus size={18} strokeWidth={3} />
                            </div>
                            <ArrowRight size={16} className="text-white/40 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="text-sm font-extrabold text-white">{t("overview.quickActions.createEvent.title")}</div>
                        <div className="text-[11px] font-medium text-white/60">{t("overview.quickActions.createEvent.subtitle")}</div>
                    </button>

                    <div className="rounded-2xl2 bg-white/60 border border-slate-200/50 p-5">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Command size={16} />
                            <span className="text-xs font-semibold">
                                {t("overview.quickActions.commandK", "Press ⌘K to search")}
                            </span>
                        </div>
                    </div>

                    {/* Restored Countdown */}
                    <div className="rounded-2xl2 border border-slate-100 bg-white p-1 shadow-sm">
                        <DeadlineTimer />
                    </div>
                </div>
            </div>

            {/* Row 2: Coming Soon Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ComingSoonCard
                    title={t("modules.extraUp.title")}
                    icon={Sparkles}
                    description={t("modules.extraUp.description")}
                    status={t("modules.status.comingSoon")}
                    actionLabel={t("modules.actions.joinWaitlist")}
                />

                <ComingSoonCard
                    title={t("modules.chores.title")}
                    icon={Home}
                    description={t("modules.chores.description")}
                    status={t("modules.status.inProgress")}
                    actionLabel={t("modules.actions.viewRoadmap")}
                />

                <ComingSoonCard
                    title={t("common.howieAI")}
                    icon={Bot}
                    description={t("modules.howie.description")}
                    status={t("modules.status.betaSoon")}
                    actionLabel="Learn more"
                />
            </div>
        </div>
    );
}


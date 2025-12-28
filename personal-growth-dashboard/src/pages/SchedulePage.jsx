import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchUserCalendar } from '../utils/calendarUtils'; // 🔥

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

import { useTranslation } from 'react-i18next';

const SchedulePage = () => {
    const { t } = useTranslation();
    const { currentUser: user } = useAuth();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!user) return;

        let unsubStorage = () => { };

        const loadData = async () => {
            // A. 取得學校課表 (User Config)
            let schoolEvents = [];
            try {
                const configs = storage.get(STORAGE_KEYS.USER_CONFIG);
                const userConfig = configs.find(c => c.id === user.uid);

                if (userConfig && userConfig.calendarSource) {
                    const rawEvents = await fetchUserCalendar(userConfig);
                    schoolEvents = rawEvents.map(ev => ({
                        title: ev.title.split(' - ')[0],
                        start: ev.start,
                        end: ev.end,
                        resource: 'School', // 標記來源
                        allDay: false
                    }));
                }
            } catch (err) {
                console.error("Failed to load school calendar", err);
            }

            // B. 訂閱 storage 的私人行程
            // Initial load
            const loadPersonalEvents = (allEvents) => {
                const personalEvents = allEvents
                    .filter(ev => ev.userId === user.uid) // Filter by user
                    .map(data => {
                        const startDate = new Date(data.start);
                        const endDate = new Date(startDate.getTime() + (data.duration || 60) * 60000);

                        return {
                            title: data.title + " (Personal)",
                            start: startDate,
                            end: endDate,
                            resource: 'Personal',
                            allDay: false
                        };
                    });
                setEvents([...schoolEvents, ...personalEvents]);
            };

            const storedEvents = storage.get(STORAGE_KEYS.EVENTS);
            loadPersonalEvents(storedEvents);

            unsubStorage = storage.subscribe(STORAGE_KEYS.EVENTS, (allEvents) => {
                loadPersonalEvents(allEvents);
            });
        };

        loadData();
        return () => unsubStorage();
    }, [user]);

    // 樣式設定
    const eventStyleGetter = (event) => {
        const isPersonal = event.resource === 'Personal';
        return {
            style: {
                backgroundColor: isPersonal ? '#10B981' : '#3B82F6', // 私人綠色，學校藍色
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px'
            }
        };
    };

    return (
        <div className="p-8 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-stone-800">{t('schedule.title')}</h1>
            </div>
            <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    defaultView={Views.WEEK}
                    views={['month', 'week', 'day']}
                    step={60}
                    eventPropGetter={eventStyleGetter}
                />
            </div>
        </div>
    );
};

export default SchedulePage;

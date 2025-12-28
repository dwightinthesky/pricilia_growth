import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchUserCalendar } from '../utils/calendarUtils';
import { normalizeEvents } from '../utils/calendarHelpers';
import TaskWidget from '../components/TaskWidget';
import UpcomingWidget from '../components/UpcomingWidget';
import DeadlineTimer from '../components/DeadlineTimer';
import UpcomingScheduleWidget from '../components/UpcomingScheduleWidget';

export default function DailyOverview() {
    const { t } = useTranslation();
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

    return (
        <div className="space-y-6">
            {/* Top Row: 3 Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-[500px]">
                    <TaskWidget />
                </div>
                <div className="h-[500px]">
                    <UpcomingScheduleWidget events={allEvents} maxItems={5} />
                </div>
                <div className="h-[500px]">
                    <DeadlineTimer />
                </div>
            </div>
        </div>
    );
}

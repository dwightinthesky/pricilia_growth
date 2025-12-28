import { useEffect, useState } from "react";
import { storage, STORAGE_KEYS } from "../utils/storage";
import { fetchUserCalendar } from "../utils/calendarUtils";
import { normalizeEvents } from "../utils/calendarHelpers";

export default function useUnifiedEvents(user) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        let unsubStorage = () => { };

        const loadData = async () => {
            setLoading(true);

            // A. School Events
            let schoolEvents = [];
            try {
                const configs = storage.get(STORAGE_KEYS.USER_CONFIG) || [];
                const userConfig = configs.find((c) => c.id === user.uid);

                if (userConfig && userConfig.calendarSource) {
                    const rawSchool = await fetchUserCalendar(userConfig);

                    schoolEvents = rawSchool.map((ev) => ({
                        id: `school-${ev.start}`, // 之後可改成 hash
                        title: ev.title.split(" - ")[0],
                        start: ev.start,
                        end: ev.end,
                        resource: "School",
                        location: ev.location || "",
                        category: "School",
                        allDay: false,
                    }));
                }
            } catch (err) {
                console.error("Failed to load school calendar", err);
            }

            // B. Personal Events (from storage)
            const loadPersonal = (allEvents) => {
                const personalEvents = (allEvents || [])
                    .filter((ev) => ev.userId === user.uid)
                    .map((data) => {
                        const startDate = new Date(data.start);
                        const endDate = new Date(
                            startDate.getTime() + (data.duration || 60) * 60000
                        );

                        return {
                            id: data.id,
                            title: data.title,
                            start: startDate,
                            end: endDate,
                            resource: "Personal",
                            location: "",
                            category: "Personal",
                            allDay: false,
                        };
                    });

                const combined = [...schoolEvents, ...personalEvents];
                setEvents(normalizeEvents(combined));
                setLoading(false);
            };

            const storedEvents = storage.get(STORAGE_KEYS.EVENTS) || [];
            loadPersonal(storedEvents);

            unsubStorage = storage.subscribe(STORAGE_KEYS.EVENTS, (allEvents) => {
                loadPersonal(allEvents);
            });
        };

        loadData();
        return () => unsubStorage();
    }, [user]);

    return { events, loading };
}

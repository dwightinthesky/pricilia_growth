import { useEffect, useState } from "react";
import { eventsSubscribe, eventsGetAll } from "../services/dataClient/eventsClient";
import { getSchoolEventsForUser } from "../services/dataClient/calendarSourceClient";
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
                schoolEvents = await getSchoolEventsForUser(user);
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

            const storedEvents = eventsGetAll();
            loadPersonal(storedEvents);

            unsubStorage = eventsSubscribe((allEvents) => {
                loadPersonal(allEvents);
            });
        };

        loadData();
        return () => unsubStorage();
    }, [user]);

    return { events, loading };
}

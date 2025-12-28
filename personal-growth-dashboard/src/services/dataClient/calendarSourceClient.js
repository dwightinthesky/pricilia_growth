import { storage, STORAGE_KEYS } from "../../utils/storage";
import { fetchUserCalendar } from "../../utils/calendarUtils";

export async function getSchoolEventsForUser(user) {
    const configs = storage.get(STORAGE_KEYS.USER_CONFIG) || [];
    const userConfig = configs.find((c) => c.id === user.uid);

    if (!userConfig || !userConfig.calendarSource) return [];

    const raw = await fetchUserCalendar(userConfig);
    return raw.map((ev) => ({
        id: `school-${ev.start}`,
        title: ev.title.split(" - ")[0],
        start: ev.start,
        end: ev.end,
        resource: "School",
        location: ev.location || "",
        category: "School",
        allDay: false,
    }));
}

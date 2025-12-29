export function findFreeSlot({
    events,
    durationMin,
    startFrom = new Date(),
    days = 7,
    dayStartHour = 8,
    dayEndHour = 22,
}) {
    const durMs = durationMin * 60000;
    const toMs = (d) => new Date(d).getTime();

    // Normalize events to simplify comparison
    const busy = (events || [])
        .map((e) => ({ s: toMs(e.start), e: toMs(e.end) }))
        .filter((x) => Number.isFinite(x.s) && Number.isFinite(x.e))
        .sort((a, b) => a.s - b.s);

    for (let i = 0; i < days; i++) {
        const day = new Date(startFrom);
        day.setDate(day.getDate() + i);

        const dayStart = new Date(day);
        dayStart.setHours(dayStartHour, 0, 0, 0);

        const dayEnd = new Date(day);
        dayEnd.setHours(dayEndHour, 0, 0, 0);

        // Start looking from the later of: start of working hours OR right now
        let cursor = Math.max(toMs(dayStart), toMs(startFrom));

        // Find busy intervals that overlap with today's window
        const dayBusy = busy.filter((b) => b.e > toMs(dayStart) && b.s < toMs(dayEnd));

        for (const b of dayBusy) {
            // Check gap before this busy slot
            if (cursor + durMs <= b.s) {
                return { start: new Date(cursor), end: new Date(cursor + durMs) };
            }
            // Move cursor past this busy slot
            cursor = Math.max(cursor, b.e);
            // If cursor pushed past end of day, break to next day
            if (cursor + durMs > toMs(dayEnd)) break;
        }

        // Check gap after last busy slot of the day
        if (cursor + durMs <= toMs(dayEnd)) {
            return { start: new Date(cursor), end: new Date(cursor + durMs) };
        }
    }

    return null;
}

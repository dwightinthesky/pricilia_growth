import { addDays, addMonths } from "date-fns";

const toDayKey = (d) => {
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

export function expandRecurringEvents(events, rangeStart, rangeEnd) {
    const rs = new Date(rangeStart);
    const re = new Date(rangeEnd);

    const out = [];

    for (const e of events) {
        const repeat = e.repeat || "none";

        // non-recurring
        if (repeat === "none") {
            out.push(e);
            continue;
        }

        const until = e.repeatUntil ? new Date(e.repeatUntil) : null;
        const exceptions = new Set((e.exceptions || []).map(String));
        const overrides = e.overrides || {};

        // duration in ms
        const durMs = new Date(e.end).getTime() - new Date(e.start).getTime();

        let cursor = new Date(e.start);
        let guard = 0;

        while (guard++ < 600) {
            if (until && cursor.getTime() > until.getTime()) break;

            const occStart = new Date(cursor);
            const occEnd = new Date(cursor.getTime() + durMs);

            // only include if intersects visible range
            const intersects = occEnd.getTime() >= rs.getTime() && occStart.getTime() <= re.getTime();

            const dayKey = toDayKey(occStart);

            // Apply overrides for this occurrence
            const ov = overrides[dayKey] || null;

            if (intersects && !exceptions.has(dayKey)) {
                const finalStart = ov?.start ? new Date(ov.start) : occStart;
                const finalDurMs = ov?.duration != null ? ov.duration * 60000 : durMs;
                const finalEnd = new Date(finalStart.getTime() + finalDurMs);

                out.push({
                    ...e,
                    ...(ov?.title ? { title: ov.title } : {}),
                    ...(ov?.location ? { location: ov.location } : {}),
                    ...(ov?.category ? { category: ov.category } : {}),

                    parentId: e.parentId || e.id,
                    isOccurrence: true,
                    dayKey,
                    id: `${e.id}::${finalStart.toISOString()}`,
                    start: finalStart,
                    end: finalEnd,
                });
            }

            if (repeat === "weekly") cursor = addDays(cursor, 7);
            else if (repeat === "monthly") cursor = addMonths(cursor, 1);
            else break;

            // if cursor is far beyond range end + some buffer, we can stop early
            if (!until && cursor.getTime() > re.getTime() + 45 * 24 * 60 * 60 * 1000) break;
        }
    }

    return out;
}

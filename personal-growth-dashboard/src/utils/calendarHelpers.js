// Event Data Model
export function normalizeEvents(rawEvents = []) {
    return rawEvents.map((e) => ({
        ...e,
        id: e.id || `event-${Date.now()}-${Math.random()}`,
        start: e.start instanceof Date ? e.start : new Date(e.start),
        end: e.end instanceof Date ? e.end : new Date(e.end),
        color: e.color || (e.resource === 'Personal' ? '#10b981' : '#3b82f6'),
        category: e.category || e.resource || 'General',
    }));
}

export function denormalizeEvent(event) {
    return {
        ...event,
        start: event.start instanceof Date ? event.start.toISOString() : event.start,
        end: event.end instanceof Date ? event.end.toISOString() : event.end,
    };
}

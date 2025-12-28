
/**
 * @typedef {Object} CalendarEvent
 * @property {string} id
 * @property {string} title
 * @property {Date} start
 * @property {Date} end
 * @property {string} [resource] - "Personal", "School", etc.
 * @property {string} [category] - "Study", "Work", "Personal", "Health"
 * @property {string} [location]
 * @property {string} [notes]
 * @property {boolean} [isAllDay]
 * @property {string} [timezone]
 * @property {string} [color]
 * @property {string} [repeat] - "none" | "weekly" | "monthly"
 * @property {Date|null} [repeatUntil]
 * @property {string[]} [exceptions]
 * @property {Object} [overrides]
 * @property {string} source - "manual" | "import" | "escp"
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

const PALETTE = {
    Personal: { accent: "#10B981", bg: "rgba(16,185,129,0.12)" },
    School: { accent: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
    Work: { accent: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
    Study: { accent: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
    Health: { accent: "#F59E0B", bg: "rgba(245,158,11,0.14)" },
};

/**
 * Normalizes raw event data into a consistent CalendarEvent structure.
 * Ensures dates are Date objects and default fields are present.
 * @param {Array<Object>} rawEvents 
 * @returns {CalendarEvent[]}
 */
export function normalizeEvents(rawEvents = []) {
    if (!Array.isArray(rawEvents)) return [];

    return rawEvents.map((e) => {
        // Ensure dates are Date objects
        const start = e.start instanceof Date ? e.start : new Date(e.start);
        const end = e.end instanceof Date ? e.end : new Date(e.end);

        // Determine color based on resource/category if not provided
        let color = e.color;
        if (!color) {
            const key = e.category || e.resource || "Personal";
            const palette = PALETTE[key] || PALETTE.Personal;
            color = palette.accent;
        }

        return {
            ...e,
            id: e.id || `event-${Date.now()}-${Math.random()}`,
            start,
            end,

            // Defaults for stability (Schema Hardening)
            resource: e.resource || "Personal",
            category: e.category || e.resource || "Personal",
            isAllDay: Boolean(e.isAllDay || e.allDay), // Support both keys
            timezone: e.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            color,

            // Recurrence stability
            repeat: e.repeat || "none",
            exceptions: Array.isArray(e.exceptions) ? e.exceptions : [],
            overrides: e.overrides || {},

            // Metadata
            source: e.source || "manual",
        };
    });
}

/**
 * Prepares an event for storage/serialization (e.g. to Firestore or API).
 * Converts Dates to ISO strings.
 * @param {CalendarEvent} event 
 * @returns {Object}
 */
export function denormalizeEvent(event) {
    return {
        ...event,
        start: event.start instanceof Date ? event.start.toISOString() : event.start,
        end: event.end instanceof Date ? event.end.toISOString() : event.end,
        repeatUntil: event.repeatUntil instanceof Date ? event.repeatUntil.toISOString() : event.repeatUntil,
    };
}

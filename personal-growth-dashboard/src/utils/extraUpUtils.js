
/**
 * @typedef {Object} ExtraUpGoal
 * @property {string} id
 * @property {string} userId
 * @property {string} title
 * @property {string} category
 * @property {number} weeklyCommitment - Target hours per week
 * @property {string} targetDate - ISO Date string
 * @property {string} status - "active" | "paused" | "completed"
 * @property {string} createdAt
 */

/**
 * Calculates progress for a goal based on linked calendar events for the current week.
 * @param {ExtraUpGoal} goal 
 * @param {Array<import('./events').CalendarEvent>} events 
 * @returns {{ currentHours: number, targetHours: number, progressPercent: number }}
 */
export function calculateGoalProgress(goal, events) {
    if (!goal || !Array.isArray(events)) {
        return { currentHours: 0, targetHours: goal?.weeklyCommitment || 0, progressPercent: 0 };
    }

    const now = new Date();
    // Get start/end of current week (Sunday to Saturday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Filter events: linked to this goal + within current week + not cancelled
    const relevantEvents = events.filter(ev => {
        // Must be linked to goal
        if (ev.extraUpGoalId !== goal.id) return false;

        // Must be in current week
        const evStart = new Date(ev.start);
        if (evStart < startOfWeek || evStart >= endOfWeek) return false;

        return true;
    });

    // Sum duration in hours
    const totalMinutes = relevantEvents.reduce((sum, ev) => {
        const start = new Date(ev.start);
        const end = new Date(ev.end);
        const diffMs = end - start;
        return sum + (diffMs / (1000 * 60));
    }, 0);

    const currentHours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal
    const targetHours = goal.weeklyCommitment || 0;

    // Cap progress at 100% for display consumers, but return raw valid numbers
    const progressPercent = targetHours > 0
        ? Math.min(Math.round((currentHours / targetHours) * 100), 100)
        : 0;

    return {
        currentHours,
        targetHours,
        progressPercent
    };
}

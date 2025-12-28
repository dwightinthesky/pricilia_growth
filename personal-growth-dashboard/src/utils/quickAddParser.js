export function parseQuickAdd(input) {
    if (!input || !input.trim()) return null;

    const text = input.trim();

    // Parse "tomorrow" or "today"
    const isTomorrow = /\b(tom|tomorrow)\b/i.test(text);
    const isToday = /\b(today|now)\b/i.test(text);

    // Parse time (3pm, 19:30, etc)
    const timeMatch = text.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i);

    // Parse duration (1h, 2h, 30m, etc)
    const durationMatch = text.match(/\b(\d+)\s*(h|hour|hours|m|min|mins|minutes)\b/i);

    // Extract title (everything that's not a time/duration/date keyword)
    let title = text
        .replace(/\b(tom|tomorrow|today|now)\b/gi, '')
        .replace(/\b\d{1,2}:?\d{0,2}\s*(am|pm)?\b/gi, '')
        .replace(/\b\d+\s*(h|hour|hours|m|min|mins|minutes)\b/gi, '')
        .trim();

    if (!title) title = 'Untitled Event';

    // Calculate start date
    const now = new Date();
    let start = new Date(now);

    if (isTomorrow) {
        start.setDate(start.getDate() + 1);
    }

    // Set time if specified
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2] || '0');
        const meridiem = timeMatch[3]?.toLowerCase();

        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;

        start.setHours(hours, minutes, 0, 0);
    } else {
        // Default to next hour
        start.setMinutes(0, 0, 0);
        start.setHours(start.getHours() + 1);
    }

    // Calculate duration and end time
    let durationMinutes = 60; // default 1 hour

    if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();

        if (unit.startsWith('h')) {
            durationMinutes = value * 60;
        } else if (unit.startsWith('m')) {
            durationMinutes = value;
        }
    }

    return {
        title,
        start: start.toISOString(),
        duration: durationMinutes,
    };
}

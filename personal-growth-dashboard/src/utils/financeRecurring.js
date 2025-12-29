const toDate = (iso) => new Date(iso + "T00:00:00");
const ymd = (d) => d.toISOString().slice(0, 10);

export function expandRecurringToMonth(rule, monthYYYYMM) {
    const [Y, M] = monthYYYYMM.split("-").map(Number);
    const start = new Date(Y, M - 1, 1);
    const end = new Date(Y, M, 0); // last day

    const ruleStart = toDate(rule.startDateISO);
    const ruleEnd = rule.endDateISO ? toDate(rule.endDateISO) : null;

    const occurrences = [];

    // clamp start range
    const rangeStart = ruleStart > start ? ruleStart : start;
    const rangeEnd = ruleEnd && ruleEnd < end ? ruleEnd : end;

    if (rangeStart > rangeEnd) return [];

    if (rule.frequency === "weekly") {
        const targetWeekday = rule.weekday ?? 1; // default Monday
        let d = new Date(rangeStart);
        while (d.getDay() !== targetWeekday) d.setDate(d.getDate() + 1);

        while (d <= rangeEnd) {
            occurrences.push(ymd(d));
            d.setDate(d.getDate() + 7);
        }
    }

    if (rule.frequency === "monthly") {
        const day = Math.min(rule.monthday ?? 1, new Date(Y, M, 0).getDate());
        const d = new Date(Y, M - 1, day);
        if (d >= rangeStart && d <= rangeEnd) occurrences.push(ymd(d));
    }

    return occurrences;
}

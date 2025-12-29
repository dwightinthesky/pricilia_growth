const KEY = "howie_memory_v1";

const DEFAULT = {
    tone: "calm",
    preferred: {
        sessionsPerWeek: 3,
        dayStartHour: 9,
        dayEndHour: 22,
    },
    pinnedGoalIds: [],
    recent: [], // [{ type, label, payload, atISO }]
};

function read() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch {
        return DEFAULT;
    }
}

function write(next) {
    localStorage.setItem(KEY, JSON.stringify(next));
}

export function useHowieMemory() {
    const mem = read();

    function setTone(tone) {
        const next = { ...mem, tone };
        write(next);
        return next;
    }

    function setPreferred(patch) {
        const next = { ...mem, preferred: { ...mem.preferred, ...patch } };
        write(next);
        return next;
    }

    function pinGoal(goalId) {
        const uniq = [goalId, ...mem.pinnedGoalIds.filter((id) => id !== goalId)].slice(0, 3);
        const next = { ...mem, pinnedGoalIds: uniq };
        write(next);
        return next;
    }

    function pushRecent(action) {
        const item = { ...action, atISO: new Date().toISOString() };
        const next = { ...mem, recent: [item, ...mem.recent].slice(0, 5) };
        write(next);
        return next;
    }

    function clear() {
        localStorage.removeItem(KEY);
    }

    return {
        memory: mem,
        setTone,
        setPreferred,
        pinGoal,
        pushRecent,
        clear,
    };
}

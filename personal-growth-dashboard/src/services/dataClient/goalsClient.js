import { storage, STORAGE_KEYS } from "../../utils/storage";

// goals are stored like events: array in local storage, per user
export function goalsGetAll() {
    return storage.get(STORAGE_KEYS.GOALS) || [];
}

export function goalsSubscribe(cb) {
    return storage.subscribe(STORAGE_KEYS.GOALS, (all) => cb(all || []));
}

export function goalsCreate(goal) {
    return storage.add(STORAGE_KEYS.GOALS, goal);
}

export function goalsUpdate(goalId, patch) {
    const all = goalsGetAll();
    const next = all.map((g) => (String(g.id) === String(goalId) ? { ...g, ...patch } : g));
    storage.set(STORAGE_KEYS.GOALS, next);
}

export function goalsRemove(goalId) {
    const all = goalsGetAll();
    const next = all.filter((g) => String(g.id) !== String(goalId));
    storage.set(STORAGE_KEYS.GOALS, next);
}

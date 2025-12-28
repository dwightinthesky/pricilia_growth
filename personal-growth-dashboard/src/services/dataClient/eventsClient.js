import { storage, STORAGE_KEYS } from "../../utils/storage";

export function eventsSubscribe(cb) {
    return storage.subscribe(STORAGE_KEYS.EVENTS, (all) => cb(all || []));
}

export function eventsGetAll() {
    return storage.get(STORAGE_KEYS.EVENTS) || [];
}

export function eventsCreate(payload) {
    storage.add(STORAGE_KEYS.EVENTS, payload);
}

export function eventsReplaceAll(next) {
    storage.set(STORAGE_KEYS.EVENTS, next);
}

export function eventsUpdate(id, patch) {
    const all = eventsGetAll();
    const next = all.map((e) => (String(e.id) === String(id) ? { ...e, ...patch } : e));
    eventsReplaceAll(next);
}

export function eventsRemove(id) {
    const all = eventsGetAll();
    const next = all.filter((e) => String(e.id) !== String(id));
    eventsReplaceAll(next);
}

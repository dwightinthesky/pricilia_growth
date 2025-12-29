import { storage, STORAGE_KEYS } from "../../utils/storage";

const uidFilter = (arr, uid) => (arr || []).filter(x => x.userId === uid);

export function financeLedgerGetAll(uid) {
    const all = storage.get(STORAGE_KEYS.FINANCE_LEDGER) || [];
    return uidFilter(all, uid);
}

export function financeLedgerCreate(tx) {
    const all = storage.get(STORAGE_KEYS.FINANCE_LEDGER) || [];
    const next = [{ ...tx }, ...all];
    storage.set(STORAGE_KEYS.FINANCE_LEDGER, next);
    return tx;
}

const getAllRecurring = () => storage.get(STORAGE_KEYS.FINANCE_RECURRING) || [];

export function financeRecurringList(userId) {
    return getAllRecurring().filter((x) => x.userId === userId);
}

export function financeRecurringSubscribe(cb) {
    return storage.subscribe(STORAGE_KEYS.FINANCE_RECURRING, () => cb(getAllRecurring()));
}

export function financeRecurringUpsert(rule) {
    const all = getAllRecurring();
    const idx = all.findIndex((x) => String(x.id) === String(rule.id));
    const next = idx >= 0 ? all.map((x) => (String(x.id) === String(rule.id) ? rule : x)) : [rule, ...all];
    storage.set(STORAGE_KEYS.FINANCE_RECURRING, next);
    return rule;
}

export function financeRecurringRemove(id) {
    const all = getAllRecurring();
    const next = all.filter((x) => String(x.id) !== String(id));
    storage.set(STORAGE_KEYS.FINANCE_RECURRING, next);
}

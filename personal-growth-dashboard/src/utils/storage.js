export const STORAGE_KEYS = {
    TASKS: 'pgd_tasks',
    EVENTS: 'pgd_events',
    CHORES: 'pgd_chores',
    GOALS: 'pgd_goals',
    USER_CONFIG: 'pgd_user_config',
    FINANCE_LEDGER: "FINANCE_LEDGER", // Keep for compatibility if used
    FINANCE_TXS: "finance_transactions",
    FINANCE_RECURRING: "finance_recurring",
};

const dispatchEvent = (key) => {
    window.dispatchEvent(new Event(`storage_${key}`));
};

export const storage = {
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            if (!data) return [];

            try {
                return JSON.parse(data);
            } catch (parseError) {
                // If parse fails (e.g. raw string "pro"), return the raw value
                return data;
            }
        } catch (e) {
            console.error('Error reading from storage', e);
            return [];
        }
    },

    add: (key, item) => {
        try {
            const items = storage.get(key);
            // Safety measure: if items isn't an array (e.g. raw string data), force it to array
            const safeItems = Array.isArray(items) ? items : [];
            const newItem = { ...item, id: Date.now().toString() };
            safeItems.push(newItem);
            localStorage.setItem(key, JSON.stringify(safeItems));
            dispatchEvent(key);
            return newItem;
        } catch (e) {
            console.error('Error adding to storage', e);
        }
    },

    update: (key, id, updates) => {
        try {
            const items = storage.get(key);
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) {
                items[index] = { ...items[index], ...updates };
                localStorage.setItem(key, JSON.stringify(items));
                dispatchEvent(key);
            }
        } catch (e) {
            console.error('Error updating storage', e);
        }
    },

    set: (key, value) => {
        try {
            // Always stringify to ensure consistent JSON format, even for strings
            localStorage.setItem(key, JSON.stringify(value));
            dispatchEvent(key);
        } catch (e) {
            console.error('Error setting storage', e);
        }
    },

    upsert: (key, item) => {
        try {
            const items = storage.get(key);
            const index = items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                items[index] = { ...items[index], ...item };
            } else {
                items.push(item);
            }
            localStorage.setItem(key, JSON.stringify(items));
            dispatchEvent(key);
        } catch (e) {
            console.error('Error upserting storage', e);
        }
    },

    remove: (key, id) => {
        try {
            const items = storage.get(key);
            const filtered = items.filter(i => i.id !== id);
            localStorage.setItem(key, JSON.stringify(filtered));
            dispatchEvent(key);
        } catch (e) {
            console.error('Error removing from storage', e);
        }
    },

    subscribe: (key, callback) => {
        const handler = () => {
            callback(storage.get(key));
        };
        window.addEventListener(`storage_${key}`, handler);
        return () => window.removeEventListener(`storage_${key}`, handler);
    }
};

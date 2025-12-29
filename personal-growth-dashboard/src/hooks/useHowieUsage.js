const DAILY_LIMIT = 10;

function getTodayKey() {
    const today = new Date().toISOString().slice(0, 10);
    return `howie_usage_${today}`;
}

export function useHowieUsage(limitOverride) {
    const key = getTodayKey();
    const limit = Number(limitOverride || DAILY_LIMIT);

    // Initialize if not present
    let data = { count: 0 };
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            data = JSON.parse(raw);
        }
    } catch (e) {
        console.error("Failed to parse howie usage", e);
    }

    // Calculate remaining
    const remaining = Math.max(0, limit - data.count);
    const exhausted = remaining === 0;

    function consume() {
        const next = {
            count: data.count + 1,
            lastUsedAt: new Date().toISOString(),
        };
        localStorage.setItem(key, JSON.stringify(next));
    }

    function refund() {
        if (data.count > 0) {
            const next = {
                count: Math.max(0, data.count - 1),
                lastUsedAt: data.lastUsedAt
            };
            localStorage.setItem(key, JSON.stringify(next));
        }
    }

    return {
        remaining,
        exhausted,
        consume,
        refund,
        limit,
    };
}

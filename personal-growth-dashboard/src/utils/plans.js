export const PLANS = {
    free: {
        id: "free",
        name: "Free",
        price: 0,
        tagline: "Try the basics",
        limits: {
            howieDaily: 5,
            financeEntriesPerDay: 10,
            recurringItems: 3,
        },
        features: {
            finance: false,         // 🔒 Free does not get Finance
            financeRecurring: false,
            extraUp: true,
            schedule: true,
            howie: true,
        },
    },
    plus: {
        id: "plus",
        name: "Plus",
        price: 9,
        tagline: "For students & busy workers",
        limits: {
            howieDaily: 30,
            financeEntriesPerDay: 200,
            recurringItems: 50,
        },
        features: {
            finance: true,          // ✅ Unlocks Finance
            financeRecurring: true,
            extraUp: true,
            schedule: true,
            howie: true,
        },
    },
    pro: {
        id: "pro",
        name: "Pro",
        price: 19,
        tagline: "Power user mode",
        limits: {
            howieDaily: 200,
            financeEntriesPerDay: 9999,
            recurringItems: 9999,
        },
        features: {
            finance: true,
            financeRecurring: true,
            extraUp: true,
            schedule: true,
            howie: true,
        },
    },
};

export const DEFAULT_PLAN_ID = "free";

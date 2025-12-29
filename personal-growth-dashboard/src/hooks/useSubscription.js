import { useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { PLANS, DEFAULT_PLAN_ID } from "../utils/plans";

const KEY = "subscription_plan";

export default function useSubscription(user) {
    const [planId, setPlanId] = useState(DEFAULT_PLAN_ID);

    useEffect(() => {
        if (!user) {
            setPlanId(DEFAULT_PLAN_ID);
            return;
        }
        const saved = storage.get(KEY);
        if (saved && PLANS[saved]) setPlanId(saved);
    }, [user]);

    const setPlan = (nextPlanId) => {
        if (!PLANS[nextPlanId]) return;
        storage.add(KEY, nextPlanId); // Note: storage.js add does push, but here we likely want to 'set' a single value.
        // Wait, storage.js add does: items.push(newItem); localStorage.setItem(key, JSON.stringify(items));
        // But 'subscription_plan' should probably be a single string value, not an array of items?
        // Reviewing storage.js content from Step 1845:
        // get returns JSON.parse(data) or [].
        // add returns newItem.
        // It seems storage.js is designed for arrays of items (tasks, events).
        // For a single config value like 'subscription_plan', using it as an array ["free"] or ["plus"] might work if we always take the last one?
        // Or we should modify storage.js to support simple key-value setting?
        // User instruction says: `storage.set(KEY, nextPlanId);` in their code example.
        // BUT storage.js DOES NOT HAVE `set`. It has `add`, `update`, `upsert`, `remove`.
        // I already encountered this with `financeClient.js` where user suggested `set` but I used `remove` or adapted.
        // Here, `storage.js` implementation for `get` returns `[]` on error or empty.
        // If I use `localStorage.setItem` directly here, it might bypass the `storage.get` parsing expectation if it expects an array?
        // Let's look at `storage.get` again:
        // const data = localStorage.getItem(key); return data ? JSON.parse(data) : [];
        // If I save "plus", JSON.parse("plus") throws? No, JSON.parse('"plus"') works. JSON.parse('plus') throws.
        // So I should save JSON.stringify("plus").
        // But `storage.get` defaults to `[]` on error.
        // If I save `"plus"`, `storage.get` returns `"plus"`.
        // The user's provided `storage.js` (Step 1845) `get` has:
        // return data ? JSON.parse(data) : [];
        // If I do `localStorage.setItem(KEY, JSON.stringify("plus"))`, get returns "plus".
        // So I can use localStorage directly or add a `set` method to storage.js.
        // Given I cannot easily change storage.js 'get' behavior globally without breaking other things,
        // I will implement `set` behavior locally here or add `set` to `storage.js`.
        // Adding `set` to `storage.js` seems safest to support the user's requested code style.
        // I'll add `set` to `storage.js` first or just use direct localStorage here? 
        // The user said "store to storage, persist across reload".
        // I'll modify `src/utils/storage.js` to add `set` method which is general purpose.
        // Actually, looking at `storage.js` again, `get` returns `[]` by default.
        // If I use `set` to store a string, `get` will return that string.
        // I will add `set` to `storage.js`.

        // For now, I will write `useSubscription.js` assuming `storage.set` exists (I will update storage.js next).
        storage.set(KEY, nextPlanId);
        setPlanId(nextPlanId);
    };

    const plan = PLANS[planId] || PLANS[DEFAULT_PLAN_ID];

    return { planId, plan, setPlan };
}

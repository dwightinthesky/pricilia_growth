import { useEffect, useMemo, useState } from "react";
import {
    financeEntriesGetAll,
    financeEntriesSubscribe,
    financeRecurringGetAll,
    financeRecurringSubscribe,
} from "../services/dataClient/financeClient";

export default function useFinanceData(user) {
    const [entries, setEntries] = useState([]);
    const [recurring, setRecurring] = useState([]);

    useEffect(() => {
        if (!user) {
            setEntries([]);
            setRecurring([]);
            return;
        }

        const load = () => {
            const eAll = financeEntriesGetAll().filter((x) => x.userId === user.uid);
            const rAll = financeRecurringGetAll().filter((x) => x.userId === user.uid);
            setEntries(eAll);
            setRecurring(rAll);
        };

        load();

        const unsubE = financeEntriesSubscribe(() => load());
        const unsubR = financeRecurringSubscribe(() => load());

        return () => {
            unsubE && unsubE();
            unsubR && unsubR();
        };
    }, [user]);

    const stats = useMemo(() => {
        const monthlyFixed = recurring.reduce((sum, r) => {
            const amt = Number(r.amount || 0);
            const cadence = String(r.cadence || "monthly").toLowerCase();
            if (cadence === "weekly") return sum + amt * 4.33; // 52 weeks / 12 months = 4.333...
            if (cadence === "yearly") return sum + amt / 12;
            return sum + amt; // monthly
        }, 0);

        const now = new Date();
        const last14 = entries
            .map((e) => ({ ...e, _d: new Date(e.occurredAtISO || e.createdAtISO) }))
            .filter((e) => now - e._d <= 14 * 24 * 60 * 60 * 1000);

        const total14 = last14.reduce((s, e) => s + Number(e.amount || 0), 0);
        const dailyAvg = total14 / 14;

        const monthlyBurn = monthlyFixed + dailyAvg * 30;

        return {
            monthlyFixed,
            dailyAvg,
            monthlyBurn,
        };
    }, [entries, recurring]);

    return { entries, recurring, stats };
}

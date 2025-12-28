import { useEffect, useMemo, useState } from "react";
import { goalsGetAll, goalsSubscribe } from "../services/dataClient/goalsClient";
import useUnifiedEvents from "./useUnifiedEvents";

function minutesBetween(a, b) {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(0, Math.round(ms / 60000));
}

function startOfWeek(d) {
    const x = new Date(d);
    const day = x.getDay(); // 0 Sun
    const diff = (day === 0 ? -6 : 1) - day; // Monday start
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
}

export default function useExtraUpGoals(user) {
    const { events, loading: eventsLoading } = useUnifiedEvents(user);

    const [goals, setGoals] = useState([]);
    const [goalsLoading, setGoalsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setGoalsLoading(true);

        const load = () => {
            const all = goalsGetAll();
            const mine = (all || []).filter((g) => g.userId === user.uid);
            setGoals(mine);
            setGoalsLoading(false);
        };

        load();
        const unsub = goalsSubscribe(() => load());
        return () => unsub();
    }, [user]);

    const computed = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now);

        const byGoalId = new Map();

        for (const ev of events || []) {
            if (!ev.extraUpGoalId) continue; // Only count events linked to a goal
            const k = String(ev.extraUpGoalId);
            const cur = byGoalId.get(k) || { totalMinutes: 0, weekMinutes: 0 };
            const dur = minutesBetween(ev.start, ev.end);
            cur.totalMinutes += dur;

            if (new Date(ev.start).getTime() >= weekStart.getTime()) {
                cur.weekMinutes += dur;
            }

            byGoalId.set(k, cur);
        }

        return (goals || []).map((g) => {
            const start = new Date(g.createdAt || g.startDate || now); // Fallback to now if missing
            const target = new Date(g.targetDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)); // Default 90 days

            const totalWeeks = Math.max(
                1,
                Math.ceil((target.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
            );

            const expectedTotalMinutes = Math.max(1, totalWeeks * Number(g.weeklyCommitment || 0) * 60);

            const agg = byGoalId.get(String(g.id)) || { totalMinutes: 0, weekMinutes: 0 };

            // Progress is based on "This week's commitment" roughly or "Total progress"? 
            // The prompt snippet says: progress = "actual / expected".
            // Let's assume progress bar is "Total Progress towards Goal" if we had milestones, 
            // but for a "weekly engine", maybe the user wants Weekly Progress?
            // The prompt code uses `agg.totalMinutes / expectedTotalMinutes`. This implies "total lifetime progress".
            // Let's stick to the prompt's logic:

            const progress = Math.min(100, Math.round((agg.totalMinutes / expectedTotalMinutes) * 100));

            const daysLeft = Math.ceil((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

            return {
                ...g,
                progress,
                totalMinutes: agg.totalMinutes,
                weekMinutes: agg.weekMinutes,
                expectedTotalMinutes,
                daysLeft,
            };
        });
    }, [goals, events]);

    return {
        goals: computed,
        loading: goalsLoading || eventsLoading,
    };
}

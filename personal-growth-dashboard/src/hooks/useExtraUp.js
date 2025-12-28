import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import useUnifiedEvents from './useUnifiedEvents';
import { calculateGoalProgress } from '../utils/extraUpUtils';

export default function useExtraUp(user) {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // subscribe to events (already unified: school + personal)
    const { events: allEvents, loading: eventsLoading } = useUnifiedEvents(user);

    useEffect(() => {
        if (!user) {
            setGoals([]);
            setLoading(false);
            return;
        }

        const loadGoals = () => {
            const rawGoals = storage.get(STORAGE_KEYS.GOALS) || [];
            // Filter by user
            const userGoals = rawGoals.filter(g => g.userId === user.uid);
            setGoals(userGoals);
            setLoading(false);
        };

        loadGoals();

        // Subscribe to changes
        const unsub = storage.subscribe(STORAGE_KEYS.GOALS, (data) => {
            const userGoals = (data || []).filter(g => g.userId === user.uid);
            setGoals(userGoals);
        });

        return () => unsub();
    }, [user]);

    // Computed goals with live progress
    const goalsWithProgress = goals.map(goal => {
        const stats = calculateGoalProgress(goal, allEvents);
        return {
            ...goal,
            ...stats // adds { currentHours, targetHours, progressPercent }
        };
    });

    return {
        goals: goalsWithProgress,
        loading: loading || eventsLoading,
        addGoal: (goalData) => storage.add(STORAGE_KEYS.GOALS, { ...goalData, userId: user.uid, createdAt: new Date().toISOString() }),
        updateGoal: (id, updates) => storage.update(STORAGE_KEYS.GOALS, id, updates),
        deleteGoal: (id) => storage.remove(STORAGE_KEYS.GOALS, id),
    };
}

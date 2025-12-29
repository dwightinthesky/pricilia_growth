import { useState } from 'react';
import useUnifiedEvents from './useUnifiedEvents';
import useExtraUpGoals from './useExtraUpGoals';
import { eventsCreate } from '../services/dataClient/eventsClient';
import { findFreeSlot } from '../utils/findFreeSlot';
import { useNavigate } from 'react-router-dom';

export function useHowieAI(user) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [tone, setTone] = useState("calm"); // calm | strict | coach

    const { events } = useUnifiedEvents(user);
    const { goals } = useExtraUpGoals(user);
    const navigate = useNavigate();

    const toggle = () => setIsOpen(prev => !prev);
    const close = () => setIsOpen(false);

    const askHowie = async (intent = "Plan my week") => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            // Build Context
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

            // Filter upcoming events (next 7 days) to save tokens
            const upcomingEvents = (events || [])
                .filter(e => new Date(e.end) > now)
                .slice(0, 30) // cap at 30 events
                .map(e => ({
                    id: e.id,
                    title: e.title,
                    start: e.start,
                    end: e.end,
                    extraUpGoalId: e.extraUpGoalId
                }));

            // Simplify goals
            const simpleGoals = (goals || []).map(g => ({
                id: g.id,
                title: g.title,
                weeklyCommitment: g.weeklyCommitment,
                progress: g.progress, // %
                weekMinutes: g.weekMinutes,
                alert: g.alert ? g.alert.type : 'on_track'
            }));

            const payload = {
                intent,
                tone,
                context: {
                    now: now.toISOString(),
                    startOfDay,
                    upcomingEvents,
                    goals: simpleGoals
                }
            };

            const res = await fetch('/api/howie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                if (res.status === 429) {
                    throw new Error("Howie is thinking too hard. Try again in a minute.");
                }
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to reach HowieAI");
            }

            const data = await res.json();
            // Backend now returns the parsed JSON directly
            setResponse(data);

        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const executeAction = async (action) => {
        if (!action) return;

        try {
            if (action.type === 'open_schedule') {
                if (action.payload?.url) {
                    navigate(action.payload.url);
                } else if (action.payload?.extraUpGoalId) {
                    navigate(`/schedule?extraUp=${action.payload.extraUpGoalId}`);
                } else {
                    navigate('/schedule');
                }
                close();
                return;
            }

            if (action.type === 'schedule_session') {
                const { durationMin, title, goalId } = action.payload;

                const slot = findFreeSlot({
                    events,
                    durationMin: durationMin || 60,
                    startFrom: new Date(),
                    days: 7,
                    dayStartHour: 8,
                    dayEndHour: 22,
                });

                if (!slot) {
                    alert("No free slot found in the next 7 days. Try widening time window or freeing up space.");
                    // Don't close so user can see message
                    return;
                }

                const newEvent = eventsCreate({
                    userId: user.uid,
                    title: title || "Deep work session",
                    start: slot.start.toISOString(),
                    end: slot.end.toISOString(),
                    extraUpGoalId: goalId || null,
                    category: "Personal", // default
                    resource: "Personal"
                });

                // Navigate to schedule to show user the new event. 
                // Uses ?focus=eventId if supported, or just date
                if (newEvent && newEvent.id) {
                    navigate(`/schedule?focus=${newEvent.id}`);
                } else {
                    navigate(`/schedule?date=${slot.start.toISOString().slice(0, 10)}`);
                }

                close();
                return;
            }

            if (action.type === 'create_event') {
                const { title, startISO, durationMin, extraUpGoalId } = action.payload;

                // Calculate end time usually done in client or passed
                const start = new Date(startISO);
                const end = new Date(start.getTime() + (durationMin || 60) * 60000);

                const newEvent = eventsCreate({
                    userId: user.uid,
                    title: title || "New Session",
                    start: start.toISOString(),
                    end: end.toISOString(),
                    extraUpGoalId: extraUpGoalId || null,
                    category: "Personal",
                    resource: "Personal"
                });

                if (newEvent && newEvent.id) {
                    navigate(`/schedule?focus=${newEvent.id}`);
                } else {
                    navigate(`/schedule?date=${start.toISOString().slice(0, 10)}`);
                }
                close();
                return;
            }

            console.warn("Unknown action type", action.type);

        } catch (err) {
            console.error("Action execution failed", err);
            alert("Failed to execute action: " + err.message);
        }
    };

    return {
        isOpen,
        toggle,
        close,
        isLoading,
        response,
        error,
        tone,
        setTone,
        askHowie,
        executeAction,
        remaining,
        limit
    };
}

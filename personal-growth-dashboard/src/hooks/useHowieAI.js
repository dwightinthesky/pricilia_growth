import { useState } from 'react';
import useUnifiedEvents from './useUnifiedEvents';
import useExtraUpGoals from './useExtraUpGoals';
import { eventsCreate } from '../services/dataClient/eventsClient';
import { useNavigate } from 'react-router-dom';

export function useHowieAI(user) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

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
                throw new Error("Failed to reach HowieAI");
            }

            const data = await res.json();

            // Extract content from OpenAI response structure
            const content = data.choices?.[0]?.message?.content;
            if (!content) throw new Error("No response content");

            const parsed = JSON.parse(content);
            setResponse(parsed);

        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const executeAction = async (action) => {
        if (!action) return;

        switch (action.type) {
            case 'create_event':
                // expect payload: { title, start (ISO or 'tomorrow 10am'), durationMinutes, extraUpGoalId }
                // For MVP, assume payload.start is a valid ISO string or we parse it simply? 
                // AI usually returns ISO if prompted, but for robustness let's assume it gives us ISO.
                // If it gives relative time, we might need a parser. Let's rely on AI giving iso for now or handle simple cases.
                // Re-prompting AI to give ISO relative to 'now' in the system prompt is key.
                if (action.payload) {
                    const { title, start, duration, extraUpGoalId } = action.payload;
                    // Default to 1 hour if not specified
                    const dur = duration || 60;
                    const startDate = new Date(start);
                    const endDate = new Date(startDate.getTime() + dur * 60000);

                    eventsCreate({
                        userId: user.uid,
                        title: title || "New Session",
                        start: startDate.toISOString(),
                        end: endDate.toISOString(),
                        extraUpGoalId: extraUpGoalId || null,
                        category: "Personal", // default
                        resource: "Personal"
                    });

                    // Navigate to schedule to show user
                    navigate(`/schedule?date=${startDate.toISOString().slice(0, 10)}`);
                    close();
                }
                break;

            case 'open_schedule':
                if (action.payload?.extraUpGoalId) {
                    navigate(`/schedule?extraUp=${action.payload.extraUpGoalId}`);
                } else if (action.payload?.date) {
                    navigate(`/schedule?date=${action.payload.date}`);
                } else {
                    navigate('/schedule');
                }
                close();
                break;

            default:
                console.warn("Unknown action type", action.type);
        }
    };

    return {
        isOpen,
        toggle,
        close,
        isLoading,
        response,
        error,
        askHowie,
        executeAction
    };
}

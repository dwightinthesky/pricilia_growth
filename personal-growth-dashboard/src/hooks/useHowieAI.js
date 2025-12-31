import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePlan } from "./usePlan";
import { supabase } from "../utils/supabaseClient";

const LIMITS = {
    free: 3,
    plus: 10,
    pro: Infinity,
};

function todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function usageKey(userId) {
    return `howie_usage:${userId}:${todayKey()}`;
}

function getUsed(userId) {
    if (!userId) return 0;
    const k = usageKey(userId);
    const raw = localStorage.getItem(k);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

function setUsed(userId, val) {
    if (!userId) return;
    localStorage.setItem(usageKey(userId), String(val));
}

export function useHowieAI() {
    const { currentUser } = useAuth();
    const { plan } = usePlan();
    const userId = currentUser?.id || currentUser?.uid;

    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // Restore basic panel state mgmt

    const limit = LIMITS[plan] ?? LIMITS.free;
    // Force re-read of usage when sending changes or plan changes
    // We use a dummy state to trigger re-render if needed, but for now memo dependency on [sending] is a cheat to refresh after send
    const used = getUsed(userId);

    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
    const canSend = remaining === Infinity ? true : remaining > 0;

    const toggle = () => setIsOpen(v => !v);
    const close = () => setIsOpen(false);

    const askHowie = async (intent, context = {}) => {
        setError(null);
        setResponse(null);

        if (!currentUser) {
            setError("Please log in first.");
            return null;
        }

        if (!canSend) {
            setError("Daily credits used up.");
            return null;
        }

        setSending(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            const payload = {
                intent,
                context // Pass extra context if needed
            };

            const r = await fetch("/api/howie", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
                throw new Error(data?.error || "Howie request failed");
            }

            setResponse(data);

            if (limit !== Infinity) {
                setUsed(userId, used + 1);
            }

            return data;
        } catch (e) {
            setError(e.message || "Howie request failed");
            return null;
        } finally {
            setSending(false);
        }
    };

    return {
        plan,
        limit,
        used,
        remaining,
        canSend,
        sending,
        error,
        response,
        isOpen,
        toggle,
        close,
        askHowie,
    };
}

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function usePlan() {
    const { currentUser } = useAuth();
    const [plan, setPlan] = useState("free");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const token = await currentUser.getIdToken();
                const r = await fetch("/api/billing/status", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await r.json();
                setPlan(data?.plan || "free");
            } catch {
                setPlan("free");
            } finally {
                setLoading(false);
            }
        })();
    }, [currentUser]);

    return { plan, loading };
}

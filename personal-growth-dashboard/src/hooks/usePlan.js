import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import { supabase } from "../utils/supabaseClient";

export function usePlan() {
    const { currentUser } = useAuth();
    const [plan, setPlan] = useState("free");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                if (!currentUser) {
                    if (mounted) {
                        setPlan("free");
                        setLoading(false);
                    }
                    return;
                }

                // Supabase Auth: Get session token
                const { data } = await supabase.auth.getSession();
                const token = data?.session?.access_token;

                if (!token) {
                    if (mounted) setPlan("free");
                    return;
                }

                const r = await fetch("/api/billing/status", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (r.ok) {
                    const json = await r.json();
                    if (mounted) setPlan(json?.plan || "free");
                } else {
                    if (mounted) setPlan("free");
                }
            } catch (e) {
                console.error("usePlan error", e);
                if (mounted) setPlan("free");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [currentUser]);

    return { plan, loading };
}

export default usePlan;

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ExternalLink, CreditCard } from "lucide-react";
import useSubscription from "../../hooks/useSubscription";

// Helper hook for secure plan status (replace internal useSubscription storage if we want secure read)
// But for now, let's mix: reading useSubscription as initial, but providing method to refresh from API.
// Actually, the user instruction implies a new approach for /api/me.
// We can integrate /api/me fetch inside useSubscription OR just a local fetch here.
// Let's stick to a clean comprehensive component first.

export default function BillingSettings() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // We can fetch real status on mount
    const [statusData, setStatusData] = useState({ plan: "free", status: "none", loading: true });

    useEffect(() => {
        if (!currentUser) return;

        async function fetchStatus() {
            try {
                const token = await currentUser.getIdToken();
                const res = await fetch('/api/billing/status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStatusData({ ...data, loading: false });
                } else {
                    setStatusData(prev => ({ ...prev, loading: false }));
                }
            } catch (e) {
                console.error("Failed to fetch billing status", e);
                setStatusData(prev => ({ ...prev, loading: false }));
            }
        }
        fetchStatus();
    }, [currentUser]);

    const handleOpenPortal = async () => {
        setLoading(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Body user might verify customerId on server
                body: JSON.stringify({})
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Failed to open portal");
                return;
            }

            const { url } = await res.json();
            if (url) window.location.href = url;
        } catch (e) {
            console.error(e);
            alert("Failed to open billing portal");
        } finally {
            setLoading(false);
        }
    };

    if (statusData.loading) {
        return <div className="p-8 text-center text-slate-400">Loading billing info...</div>;
    }

    const isPlus = statusData.plan === "plus" || statusData.plan === "pro"; // For now assume plus/pro are paid

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Subscription</h1>
                <p className="mt-2 text-slate-600">Manage your plan and payment details.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                            Current Plan
                        </div>
                        <div className="mt-2 text-3xl font-extrabold text-slate-900 capitalize">
                            {statusData.plan}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-500 flex items-center gap-2">
                            Status: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${statusData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {statusData.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    {isPlus ? (
                        <button
                            onClick={handleOpenPortal}
                            disabled={loading}
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                            Manage subscription & payments
                        </button>
                    ) : (
                        <div className="text-sm text-slate-500">
                            You are on the free plan. <a href="/pricing" className="text-slate-900 font-bold underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900">Upgrade to Plus</a>
                        </div>
                    )}

                    {isPlus && (
                        <ExternalLink size={16} className="text-slate-300" />
                    )}
                </div>
            </div>
        </div>
    );
}

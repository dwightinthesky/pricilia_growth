import React, { useEffect, useState } from "react";
import { CreditCard, CheckCircle, Zap, ExternalLink, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePlan } from "../hooks/usePlan";
import { supabase } from "../utils/supabaseClient";

export default function BillingPage() {
    const { currentUser } = useAuth();
    const { plan: currentPlan, loading: planLoading } = usePlan();

    const [usage, setUsage] = useState(null);
    const [loadingUsage, setLoadingUsage] = useState(false);

    // Hardcoded limits for display/calculation
    // (Ideally fetched from config, but static is fine for MVP)
    const LIMITS = {
        free: { howie: 3, recurring: 0, label: "Free" },
        plus: { howie: 10, recurring: 5, label: "Plus" },
        pro: { howie: 9999, recurring: 9999, label: "Pro" },
    };

    const planConfig = LIMITS[currentPlan] || LIMITS.free;

    useEffect(() => {
        if (currentUser) {
            loadUsage();
        }
    }, [currentUser]);

    async function loadUsage() {
        setLoadingUsage(true);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;
            const res = await fetch("/api/usage/status", {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setUsage(data);
            }
        } catch (e) {
            console.error("Failed to load usage", e);
        } finally {
            setLoadingUsage(false);
        }
    }

    const handlePortal = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;

            // Simple toast or loading state could go here
            const res = await fetch("/api/stripe/portal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) window.location.href = data.url;
            } else {
                alert("Failed to redirect to billing portal.");
            }
        } catch (err) {
            console.error(err);
            alert("Error opening billing portal.");
        }
    };

    const PlanBadge = ({ p }) => {
        const styles = {
            free: "bg-slate-100 text-slate-600 border-slate-200",
            plus: "bg-indigo-50 text-indigo-700 border-indigo-100",
            pro: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
        return (
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-widest ${styles[p] || styles.free}`}>
                {p}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Usage</h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">Manage your subscription and view usage limits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* CURRENT PLAN CARD */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Current Plan</div>
                            <div className="flex items-center gap-3">
                                <div className="text-3xl font-extrabold text-slate-900 capitalize">{currentPlan}</div>
                                <PlanBadge p={currentPlan} />
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <Zap className="text-indigo-500" size={24} />
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {currentPlan === 'free' && (
                            <p className="text-sm text-slate-600">
                                You are on the free tier. Upgrade to unlock full access to Howie AI and Recurring Finance.
                            </p>
                        )}
                        {currentPlan === 'plus' && (
                            <p className="text-sm text-slate-600">
                                You have Plus access. Enjoy extended limits and finance features.
                            </p>
                        )}
                        {currentPlan === 'pro' && (
                            <p className="text-sm text-slate-600">
                                You are a Pro member. Unlimited access to all features.
                            </p>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                        {currentPlan === 'free' ? (
                            <button
                                onClick={() => window.location.href = '/pricing'}
                                className="flex-1 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90">
                                Upgrade Now
                            </button>
                        ) : (
                            <button
                                onClick={handlePortal}
                                className="flex-1 rounded-xl border border-slate-200 bg-white text-slate-700 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2">
                                Manage Subscription <ExternalLink size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* USAGE CARD */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Daily Utility</div>
                        <button onClick={loadUsage} disabled={loadingUsage} className="text-slate-400 hover:text-slate-600">
                            <RefreshCw size={14} className={loadingUsage ? "animate-spin" : ""} />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Howie Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-slate-700">
                                <span>Howie AI Credits</span>
                                <span className="text-slate-500 text-xs font-semibold">
                                    {usage?.howie?.used ?? 0} / {planConfig.howie >= 9999 ? "∞" : planConfig.howie}
                                </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${(usage?.howie?.used ?? 0) >= planConfig.howie ? "bg-rose-500" : "bg-emerald-500"
                                        }`}
                                    style={{
                                        width: planConfig.howie >= 9999
                                            ? "5%"
                                            : `${Math.min(100, ((usage?.howie?.used ?? 0) / planConfig.howie) * 100)}%`
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400">Resets daily at 00:00 UTC</p>
                        </div>

                        {/* Recurring Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-slate-700">
                                <span>Recurring Finance</span>
                                <span className="text-slate-500 text-xs font-semibold">
                                    {planConfig.recurring === 0 ? "Locked" :
                                        `${usage?.finance?.recurringEnabled ?? 0} / ${planConfig.recurring >= 9999 ? "∞" : planConfig.recurring}`
                                    }
                                </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${(usage?.finance?.recurringEnabled ?? 0) >= planConfig.recurring && planConfig.recurring !== 0 ? "bg-amber-500" : "bg-indigo-500"
                                        }`}
                                    style={{
                                        width: planConfig.recurring >= 9999
                                            ? "5%"
                                            : planConfig.recurring === 0 ? "100%"
                                                : `${Math.min(100, ((usage?.finance?.recurringEnabled ?? 0) / planConfig.recurring) * 100)}%`
                                    }}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                        <AlertCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Running low? <a href="/pricing" className="text-indigo-600 font-bold hover:underline">Upgrade plan</a> to increase your Howie credits and unlock unlimited recurring bills.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

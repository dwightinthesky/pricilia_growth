import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { PLANS } from "../utils/plans";
import { useAuth } from "../context/AuthContext";

import { supabase } from "../utils/supabaseClient";

export default function PricingPage({ onSelectPlan, currentPlanId }) {
    const tiers = [PLANS.free, PLANS.plus, PLANS.pro];
    const { currentUser } = useAuth();
    const [loadingPlanId, setLoadingPlanId] = useState(null);

    const rows = [
        { label: "Schedule (Calendar)", key: "schedule" },
        { label: "Extra*Up Goals", key: "extraUp" },
        { label: "HowieAI Assistant", key: "howie" },
        { label: "Finance Tracker", key: "finance" },
        { label: "Recurring bills", key: "financeRecurring" },
    ];

    const handleSelect = async (planId) => {
        if (planId === "free") {
            onSelectPlan("free");
            return;
        }

        setLoadingPlanId(planId);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;

            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ plan: planId }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Checkout API failed:", res.status, text);
                throw new Error(text || "Checkout failed");
            }

            const { url } = await res.json();
            if (url) window.location.href = url;
        } catch (e) {
            console.error(e);
            alert("Failed to start checkout: " + e.message);
        } finally {
            setLoadingPlanId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 p-6">
            <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-card p-6">
                <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">
                    Pricing
                </div>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                    One dashboard for work and life
                </h1>
                <p className="mt-2 text-slate-600">
                    Built for students and working professionals. Start free, upgrade when it helps.
                </p>
            </div>

            {/* Tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((p) => {
                    const isCurrent = currentPlanId === p.id;
                    const isFree = p.id === "free";
                    const isLoading = loadingPlanId === p.id;

                    return (
                        <div key={p.id} className="rounded-2xl border border-slate-200 bg-white/95 shadow-card p-6 flex flex-col">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                                    <div className="mt-1 text-sm text-slate-600">{p.tagline}</div>
                                </div>
                                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                    {isCurrent ? "Current" : ""}
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-3xl font-extrabold text-slate-900">
                                    {isFree ? "€0" : `€${p.price}`}
                                    <span className="text-sm font-semibold text-slate-500">/mo</span>
                                </div>
                            </div>

                            <ul className="mt-5 space-y-2 flex-1">
                                {rows.map((r) => {
                                    const ok = !!p.features[r.key];
                                    return (
                                        <li key={r.key} className="flex items-center gap-2 text-sm">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-300"}`}>
                                                <Check size={14} />
                                            </span>
                                            <span className={ok ? "text-slate-700 font-semibold" : "text-slate-400 font-semibold"}>
                                                {r.label}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="mt-6">
                                <button
                                    onClick={() => handleSelect(p.id)}
                                    className={[
                                        "w-full rounded-xl px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                        isCurrent
                                            ? "bg-slate-100 text-slate-500 cursor-default"
                                            : "bg-slate-900 text-white hover:opacity-90 hover:shadow-lg",
                                    ].join(" ")}
                                    disabled={isCurrent || isLoading}
                                >
                                    {isLoading && <Loader2 size={14} className="animate-spin" />}
                                    {isCurrent ? "Selected" : p.id === "free" ? "Continue Free" : "Upgrade"}
                                </button>

                                <div className="mt-3 text-[11px] font-semibold text-slate-500 text-center">
                                    {p.id === "plus" ? `Howie: ${p.limits.howieDaily}/day • Recurring: ${p.limits.recurringItems}` : ""}
                                    {p.id === "pro" ? `Howie: ${p.limits.howieDaily}/day • Unlimited` : ""}
                                    {p.id === "free" ? "Basic limits applied" : ""}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Feature table */}
            <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-card overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                        Compare features
                    </div>
                </div>

                <div className="p-6 space-y-3">
                    {rows.map((r) => (
                        <div key={r.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="text-sm font-extrabold text-slate-900">{r.label}</div>
                            <div className="flex items-center gap-6 text-sm font-semibold">
                                {tiers.map((p) => (
                                    <span key={p.id} className={p.features[r.key] ? "text-slate-900 w-8 text-center" : "text-slate-300 w-8 text-center"}>
                                        {p.features[r.key] ? "✓" : "—"}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

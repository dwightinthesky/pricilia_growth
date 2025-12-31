import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function PlanGate({ allow = ["plus", "pro"], plan, children, title = "Locked" }) {
    const navigate = useNavigate();
    // Ensure plan is lowered, just in case
    const p = (plan || "free").toLowerCase();
    const ok = allow.includes(p);

    if (ok) return children;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-sm p-6 max-w-lg mx-auto mt-10 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Lock size={20} />
                </div>
                <div className="flex-1">
                    <div className="text-lg font-extrabold text-slate-900">{title}</div>
                    <div className="mt-1 text-sm text-slate-600 leading-relaxed">
                        This feature is available on the <strong>{allow.join(" & ").toUpperCase()}</strong> plan. <br />
                        Upgrade your journey to unlock full potential.
                    </div>
                    <button
                        onClick={() => navigate("/pricing")}
                        className="mt-5 w-full md:w-auto rounded-xl bg-slate-900 text-white px-6 py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}

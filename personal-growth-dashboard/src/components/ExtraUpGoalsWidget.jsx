import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useExtraUpGoals from "../hooks/useExtraUpGoals";

function ProgressBar({ value }) {
    return (
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: `${value}%` }} />
        </div>
    );
}

export default function ExtraUpGoalsWidget() {
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const { goals, loading } = useExtraUpGoals(user);

    return (
        <div className="h-full flex flex-col rounded-2xl2 border border-slate-200/70 bg-white/95 shadow-card p-6 overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-500 uppercase">
                        Extra*up
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                        Long term goals
                    </div>
                </div>

                <button
                    onClick={() => navigate("/extra-up")}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:opacity-90 transition-opacity"
                >
                    View
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {loading ? (
                    <div className="text-sm font-semibold text-slate-400 animate-pulse">Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className="text-sm font-medium text-slate-400 leading-relaxed py-4">
                        Turn ambitious dreams into weekly steps. <br />
                        <button onClick={() => navigate("/extra-up")} className="text-blue-600 hover:underline mt-2">Add your first goal</button>
                    </div>
                ) : (
                    goals.slice(0, 3).map((g) => (
                        <button
                            key={g.id}
                            onClick={() => navigate(`/schedule?extraUp=${encodeURIComponent(g.id)}`)}
                            className="group w-full text-left rounded-2xl border border-slate-200/60 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] hover:-translate-y-[1px] transition-all duration-300"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{g.title}</div>
                                    <div className="mt-1 text-xs font-semibold text-slate-400">
                                        {g.daysLeft > 0 ? `${g.daysLeft} days left` : 'Due today'} · {g.weeklyCommitment}h/week
                                    </div>
                                </div>
                                <div className="shrink-0 text-xs font-extrabold text-slate-900">{g.progress}%</div>
                            </div>

                            <div className="mt-3">
                                <ProgressBar value={g.progress} />
                            </div>

                            <div className="mt-3 flex justify-between items-center text-xs font-semibold text-slate-500">
                                <span>This week</span>
                                <span className={g.weekMinutes >= (g.weeklyCommitment * 60) ? "text-green-600" : ""}>
                                    {Math.round((g.weekMinutes || 0) / 60 * 10) / 10}h / {g.weeklyCommitment}h
                                </span>
                            </div>

                            {g.alert ? (
                                <div
                                    className={[
                                        "mt-3 rounded-xl px-3 py-2 text-xs font-semibold",
                                        g.alert.type === "behind"
                                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                                            : "bg-blue-50 text-blue-800 border border-blue-200",
                                    ].join(" ")}
                                >
                                    {g.alert.message}
                                </div>
                            ) : null}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

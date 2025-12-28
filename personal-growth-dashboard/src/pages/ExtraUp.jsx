import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    goalsCreate,
    goalsRemove,
    goalsUpdate,
} from "../services/dataClient/goalsClient";
import useExtraUpGoals from "../hooks/useExtraUpGoals";

function isoDate(d) {
    const x = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

export default function ExtraUp() {
    const { currentUser: user } = useAuth();
    const { goals, loading } = useExtraUpGoals(user);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Study");
    const [targetDate, setTargetDate] = useState(isoDate(new Date(Date.now() + 90 * 86400000)));
    const [weeklyCommitment, setWeeklyCommitment] = useState(6);

    const canCreate = useMemo(() => title.trim() && user, [title, user]);

    const onCreate = () => {
        if (!canCreate) return;

        const now = new Date();
        const goal = {
            id: crypto.randomUUID?.() || String(Date.now()),
            userId: user.uid,
            title: title.trim(),
            category,
            startDate: now.toISOString(),
            targetDate: new Date(targetDate).toISOString(),
            weeklyCommitment: Number(weeklyCommitment) || 0,
            status: "active",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };

        goalsCreate(goal);
        setTitle("");
    };

    const setStatus = (g, status) => {
        goalsUpdate(g.id, { status, updatedAt: new Date().toISOString() });
    };

    const onDelete = (g) => {
        const ok = window.confirm(`Delete goal "${g.title}"?`);
        if (!ok) return;
        goalsRemove(g.id);
    };

    return (
        <div className="px-6 py-6 animate-in fade-in duration-500">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-500 uppercase">
                            Extra*up
                        </div>
                        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Long term goals</h1>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                            Track real progress based on scheduled work sessions.
                        </p>
                    </div>
                </div>

                {/* Create */}
                <div className="mt-6 rounded-2xl2 border border-slate-200/70 bg-white/95 shadow-card p-6">
                    <div className="text-sm font-extrabold text-slate-900">Create a goal</div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-extrabold text-slate-600">Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Microsoft SQL Certification"
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-slate-600">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                            >
                                <option>Study</option>
                                <option>Career</option>
                                <option>Exam</option>
                                <option>Health</option>
                                <option>Personal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-slate-600">Weekly commitment (hours)</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={weeklyCommitment}
                                onChange={(e) => setWeeklyCommitment(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-slate-600">Target date</label>
                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                            />
                        </div>

                        <div className="md:col-span-3" />

                        <div className="md:col-span-1">
                            <button
                                onClick={onCreate}
                                disabled={!canCreate}
                                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                Create goal
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="mt-6 rounded-2xl2 border border-slate-200/70 bg-white/95 shadow-card p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-extrabold text-slate-900">Your goals</div>
                        <div className="text-xs font-semibold text-slate-500">
                            {loading ? "Loading…" : `${goals.length} goals`}
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {!loading && goals.length === 0 ? (
                            <div className="text-sm font-semibold text-slate-600">
                                No goals yet. Create one above.
                            </div>
                        ) : null}

                        {goals.map((g) => (
                            <div
                                key={g.id}
                                className="rounded-2xl border border-slate-200/60 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block w-2 h-2 rounded-full ${g.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                            <div className="truncate text-sm font-extrabold text-slate-900">{g.title}</div>
                                        </div>
                                        <div className="mt-1 text-xs font-semibold text-slate-500">
                                            Target: {new Date(g.targetDate).toLocaleDateString()} ({g.daysLeft} days) · {g.weeklyCommitment}h/week · {String(g.status).toUpperCase()}
                                        </div>

                                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 max-w-md">
                                            <div className="h-full rounded-full bg-slate-900 transition-all duration-1000" style={{ width: `${g.progress}%` }} />
                                        </div>

                                        <div className="mt-2 text-xs font-semibold text-slate-600">
                                            Total Progress: {g.progress}% · This week: {Math.round((g.weekMinutes || 0) / 60 * 10) / 10}h / {g.weeklyCommitment}h
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col gap-2">
                                        {g.status !== "active" ? (
                                            <button
                                                onClick={() => setStatus(g, "active")}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                                            >
                                                Resume
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setStatus(g, "paused")}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                                            >
                                                Pause
                                            </button>
                                        )}

                                        {g.status !== "completed" ? (
                                            <button
                                                onClick={() => setStatus(g, "completed")}
                                                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:opacity-90"
                                            >
                                                Mark done
                                            </button>
                                        ) : null}

                                        <button
                                            onClick={() => onDelete(g)}
                                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

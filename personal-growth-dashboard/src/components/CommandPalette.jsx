import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import format from "date-fns/format";

import useHotkeys from "../hooks/useHotkeys";
import useUnifiedEvents from "../hooks/useUnifiedEvents";
import { useAuth } from "../context/AuthContext";

const RECENTS_KEY = "pricilia.recents.v1";
const MAX_RECENTS = 8;

function safeLower(s) {
    return String(s || "").toLowerCase();
}

function loadRecents() {
    try {
        const raw = localStorage.getItem(RECENTS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveRecents(list) {
    try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
    } catch { }
}

function pushRecent(item) {
    const prev = loadRecents();
    const next = [item, ...prev.filter((x) => x.key !== item.key)];
    saveRecents(next);
}

function clearRecents() {
    try {
        localStorage.removeItem(RECENTS_KEY);
    } catch { }
}

function parseQuery(qRaw) {
    const q = String(qRaw || "");
    const trimmed = q.trim();

    const commandMode = trimmed.startsWith(">");
    const tokens = trimmed.split(/\s+/).filter(Boolean);

    const filters = new Set();
    const restTokens = [];

    for (const t of tokens) {
        if (t.startsWith("@")) filters.add(t.slice(1).toLowerCase());
        else restTokens.push(t);
    }

    const text = restTokens.join(" ").replace(/^>\s*/, "").trim();

    return { raw: qRaw, trimmed, commandMode, filters, text };
}

function formatHintDate(d) {
    try {
        return format(new Date(d), "MMM d, HH:mm");
    } catch {
        return "";
    }
}

// Resolver: reconstruct executable items from stored recents
function resolveRecents(stored, staticActions, events, nav) {
    const actionMap = new Map(staticActions.map((a) => [String(a.id), a]));
    const eventMap = new Map((events || []).map((e) => [String(e.id), e]));

    const out = [];

    for (const r of stored || []) {
        if (r.type === "action") {
            const a = actionMap.get(String(r.actionId));
            if (!a) continue;

            out.push({
                type: "action",
                id: `recent-${r.key}`,
                key: r.key,
                label: a.label,
                hint: a.hint || "",
                subhint: "",
                actionId: a.id,
                run: a.run,
                isRecent: true,
            });
        }

        if (r.type === "event") {
            const e = eventMap.get(String(r.eventId));
            if (!e) continue;

            out.push({
                type: "event",
                id: `recent-${r.key}`,
                key: r.key,
                label: e.title,
                hint: formatHintDate(e.start),
                subhint: e.resource || e.category || "",
                eventId: e.id,
                run: () => nav(`/schedule?focus=${encodeURIComponent(e.id)}`),
                isRecent: true,
            });
        }
    }

    return out;
}

export default function CommandPalette() {
    const nav = useNavigate();
    const { currentUser: user } = useAuth();
    const { events = [], loading } = useUnifiedEvents(user);

    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [recents, setRecents] = useState(() => loadRecents());

    const listRef = useRef(null);

    useHotkeys(["meta+k", "ctrl+k"], () => setOpen(true));
    useHotkeys(["escape"], () => setOpen(false));

    // Refresh recents when user changes
    useEffect(() => {
        setRecents(loadRecents());
    }, [user?.uid]);

    useEffect(() => {
        if (!open) return;
        setActiveIndex(0);
    }, [q, open]);

    const query = useMemo(() => parseQuery(q), [q]);

    const staticActions = useMemo(() => {
        const actions = [
            {
                type: "action",
                id: "create",
                label: "Create event",
                hint: "Schedule",
                keywords: ["new", "add", "event"],
                run: () => nav("/schedule?intent=create"),
            },
            {
                type: "action",
                id: "today",
                label: "Go to today",
                hint: "Schedule",
                keywords: ["today", "now"],
                run: () => nav("/schedule"),
            },
            {
                type: "action",
                id: "dashboard",
                label: "Go to dashboard",
                hint: "Home",
                keywords: ["home", "landing", "overview"],
                run: () => nav("/"),
            },
        ];

        return actions;
    }, [nav]);

    const actionResults = useMemo(() => {
        if (query.filters.size) return [];
        if (!query.text && !query.commandMode) return staticActions;

        const s = safeLower(query.text);
        const filtered = staticActions.filter((a) => {
            if (!s) return true;
            const hay = [a.label, a.hint, ...(a.keywords || [])].map(safeLower).join(" ");
            return hay.includes(s);
        });

        return filtered;
    }, [staticActions, query]);

    const eventResults = useMemo(() => {
        if (query.commandMode) return [];

        const s = safeLower(query.text);
        const hasText = Boolean(s);

        const wanted = query.filters;

        return (events || [])
            .filter((e) => {
                const bucket = safeLower(e.resource || e.category || "");
                if (wanted.size && !wanted.has(bucket)) return false;
                if (!hasText) return true;
                return safeLower(e.title).includes(s);
            })
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 7)
            .map((e) => ({
                type: "event",
                id: `event-${e.id}`,
                key: `event:${e.id}`,
                eventId: e.id,
                label: e.title,
                hint: formatHintDate(e.start),
                subhint: e.resource || e.category || "",
                run: () => nav(`/schedule?focus=${encodeURIComponent(e.id)}`),
            }));
    }, [events, query, nav]);

    const recentItems = useMemo(() => {
        if (query.trimmed) return [];
        return resolveRecents(recents, staticActions, events, nav).slice(0, MAX_RECENTS);
    }, [recents, staticActions, events, nav, query.trimmed]);

    const items = useMemo(() => {
        if (!query.trimmed) return [...recentItems, ...staticActions];
        if (query.commandMode) return actionResults;
        if (query.filters.size || query.text) return [...eventResults, ...actionResults];
        return [...eventResults, ...actionResults];
    }, [query, recentItems, staticActions, eventResults, actionResults]);

    const runItem = (item) => {
        item.run?.();

        // Save recent (serializable format)
        const rec = {
            key: item.type === "event" ? `event:${item.eventId}` : `action:${item.actionId || item.id}`,
            type: item.type,
            actionId: item.type === "action" ? (item.actionId || item.id) : null,
            eventId: item.type === "event" ? item.eventId : null,
            label: item.label,
            hint: item.hint || "",
            subhint: item.subhint || "",
            ts: Date.now(),
        };

        pushRecent(rec);
        const nextRecents = [rec, ...recents.filter((x) => x.key !== rec.key)].slice(0, MAX_RECENTS);
        setRecents(nextRecents);

        setOpen(false);
        setQ("");
        setActiveIndex(0);
    };

    const handleClearRecents = () => {
        clearRecents();
        setRecents([]);
    };

    // keyboard navigation
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, items.length - 1));
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
                return;
            }

            if (e.key === "Enter") {
                e.preventDefault();
                const pick = items[activeIndex] || items[0];
                if (pick) runItem(pick);
                return;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, items, activeIndex]);

    // keep active item visible in scroll
    useEffect(() => {
        if (!open) return;
        const el = listRef.current?.querySelector?.(`[data-idx="${activeIndex}"]`);
        if (el?.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }, [activeIndex, open]);

    if (!open) return null;

    const helperLine = (
        <div className="text-[11px] font-semibold text-slate-500">
            Tips: <span className="text-slate-700">&gt;</span> commands ·{" "}
            <span className="text-slate-700">@school</span> <span className="text-slate-700">@personal</span>{" "}
            <span className="text-slate-700">@work</span> <span className="text-slate-700">@study</span>{" "}
            <span className="text-slate-700">@health</span>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onMouseDown={() => setOpen(false)}
        >
            <div
                className="mx-auto mt-24 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="border-b border-slate-200 p-3">
                    <input
                        autoFocus
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Type a command or search events…"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                    />
                    <div className="mt-2">{helperLine}</div>
                </div>

                <div ref={listRef} className="max-h-96 overflow-auto p-2">
                    {query.trimmed && loading ? (
                        <div className="px-3 py-4 text-sm font-semibold text-slate-500">Searching…</div>
                    ) : null}

                    {!query.trimmed && recentItems.length > 0 ? (
                        <div className="px-3 pb-1 pt-2 flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-500">Recent</div>
                            <button
                                onClick={handleClearRecents}
                                className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    ) : null}

                    {items.map((it, idx) => {
                        const active = idx === activeIndex;

                        const leftBadge =
                            it.type === "event" ? (it.subhint || "").toUpperCase() : it.type === "action" ? "ACTION" : "RECENT";

                        return (
                            <button
                                key={it.id}
                                data-idx={idx}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => runItem(it)}
                                className={[
                                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left",
                                    active ? "bg-slate-900 text-white" : "hover:bg-slate-50",
                                ].join(" ")}
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={[
                                                "rounded-lg px-2 py-1 text-[10px] font-extrabold tracking-wide",
                                                active ? "bg-white/15 text-white/90" : "bg-slate-100 text-slate-600",
                                            ].join(" ")}
                                        >
                                            {leftBadge || "ITEM"}
                                        </span>

                                        <div
                                            className={[
                                                "truncate text-sm font-semibold",
                                                active ? "text-white" : "text-slate-900",
                                            ].join(" ")}
                                        >
                                            {it.label}
                                        </div>
                                    </div>

                                    {it.subhint ? (
                                        <div
                                            className={[
                                                "mt-0.5 truncate text-xs font-semibold",
                                                active ? "text-white/70" : "text-slate-500",
                                            ].join(" ")}
                                        >
                                            {it.subhint}
                                        </div>
                                    ) : null}
                                </div>

                                <div
                                    className={[
                                        "ml-3 shrink-0 text-xs font-semibold",
                                        active ? "text-white/70" : "text-slate-500",
                                    ].join(" ")}
                                >
                                    {it.hint}
                                </div>
                            </button>
                        );
                    })}

                    {!items.length && (
                        <div className="px-3 py-6 text-sm font-semibold text-slate-500">No results</div>
                    )}
                </div>

                <div className="border-t border-slate-200 p-3 text-xs font-semibold text-slate-500">
                    ↑↓ to navigate · Enter to run · Esc to close
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabaseClient";

function cn(...xs) {
    return xs.filter(Boolean).join(" ");
}

function Card({ children, className }) {
    return (
        <div className={cn("rounded-3xl bg-white ring-1 ring-slate-100 shadow-[0_10px_35px_rgba(15,23,42,0.08)]", className)}>
            {children}
        </div>
    );
}

function Pill({ children, tone = "neutral" }) {
    const map = {
        neutral: "bg-slate-100 text-slate-700",
        ok: "bg-emerald-100 text-emerald-800",
        warn: "bg-amber-100 text-amber-900",
        bad: "bg-rose-100 text-rose-800",
        dark: "bg-slate-900 text-white",
    };
    return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", map[tone])}>{children}</span>;
}

function Button({ children, onClick, disabled, tone = "primary" }) {
    const cls =
        tone === "primary"
            ? "rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-950 transition disabled:opacity-50 disabled:hover:bg-slate-900"
            : "rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200 active:bg-slate-300 transition disabled:opacity-50";
    return (
        <button className={cls} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}

async function authedFetch(path, { method = "GET", body } = {}) {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (!accessToken) throw new Error("NO_SESSION");

    const res = await fetch(path, {
        method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "API_FAILED");
    return json;
}

export default function SettingsPage() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [msg, setMsg] = useState(null);

    const byProvider = useMemo(() => {
        const map = { google: null, microsoft: null };
        for (const c of connections) map[c.provider] = c;
        return map;
    }, [connections]);

    const loadConnections = async () => {
        setLoading(true);
        setMsg(null);
        try {
            const { data: session } = await supabase.auth.getSession();
            if (!session?.session) {
                setConnections([]);
                return;
            }

            const { data, error } = await supabase
                .from("calendar_connections")
                .select("provider,status,updated_at,last_sync_at") // Ensure last_sync_at column exists or use updated_at
                .order("updated_at", { ascending: false });

            if (error) throw error;
            setConnections(data || []);
        } catch (e) {
            console.error(e);
            // Silent error or basic log if table not ready yet
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConnections();
    }, []);

    const connect = async (provider) => {
        try {
            setMsg(null);
            // Fetch the OAuth URL from backend (securely, with headers)
            const res = await authedFetch(`/api/integrations/${provider}/start`);
            if (res.url) {
                window.location.href = res.url;
            } else {
                throw new Error("No URL returned");
            }
        } catch (e) {
            console.error(e);
            setMsg({ tone: "bad", text: "Failed to start connection: " + (e.message || "Unknown error") });
        }
    };

    const syncNow = async () => {
        setSyncing(true);
        setMsg(null);
        try {
            const out = await authedFetch("/api/sync/calendars", { method: "POST" });
            setMsg({ tone: "ok", text: `Synced ${out?.synced ?? 0} events.` });
            await loadConnections();
        } catch (e) {
            console.error(e);
            setMsg({ tone: "bad", text: e.message || "Sync failed" });
        } finally {
            setSyncing(false);
        }
    };

    const renderProvider = (provider, label) => {
        const c = byProvider[provider];
        const status = c?.status || "not_connected";
        const tone =
            status === "active" ? "ok" : status === "error" ? "bad" : status === "disconnected" ? "warn" : "neutral";

        return (
            <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-semibold tracking-[0.22em] text-slate-400">CALENDAR</div>
                        <div className="mt-1 text-lg font-extrabold text-slate-900">{label}</div>
                        <div className="mt-2 flex items-center gap-2">
                            <Pill tone={tone}>
                                {status === "active" ? "CONNECTED" : status === "error" ? "ERROR" : status === "disconnected" ? "DISCONNECTED" : "NOT CONNECTED"}
                            </Pill>
                            {c?.updated_at && status === 'active' ? (
                                <span className="text-xs text-slate-500">Last update: {new Date(c.updated_at).toLocaleTimeString()}</span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button tone="secondary" onClick={() => connect(provider)} disabled={loading}>
                            {status === "active" ? "Reconnect" : "Connect"}
                        </Button>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50">
            <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-8 space-y-6">
                <div>
                    <div className="text-xs font-semibold tracking-[0.22em] text-slate-400">SETTINGS</div>
                    <div className="mt-1 text-3xl font-extrabold text-slate-900">Integrations</div>
                    <div className="mt-1 text-sm text-slate-600">
                        Connect calendars, then everything lands in your Schedules DB for Day View and Upcoming.
                    </div>
                </div>

                {msg && (
                    <div className={cn("rounded-2xl px-4 py-3 text-sm font-semibold", msg.tone === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900")}>
                        {msg.text}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {renderProvider("google", "Google Calendar")}
                    {renderProvider("microsoft", "Outlook / Microsoft 365")}
                </div>

                <Card className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="text-xs font-semibold tracking-[0.22em] text-slate-400">SYNC</div>
                            <div className="mt-1 text-lg font-extrabold text-slate-900">Pull next 30 days into Schedules</div>
                            <div className="mt-1 text-sm text-slate-600">Runs your sync job and upserts into schedule_events.</div>
                        </div>
                        <Button onClick={syncNow} disabled={syncing || loading}>
                            {syncing ? "Syncing..." : "Sync now"}
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-xs font-semibold tracking-[0.22em] text-slate-400">APPLE CALENDAR</div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">Apple Calendar (MVP)</div>
                    <div className="mt-2 text-sm text-slate-600">
                        Currently available via subscribing by ICS URL (Coming soon).
                    </div>
                </Card>
            </div>
        </div>
    );
}

import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../../utils/auth";
import { decrypt, encrypt } from "../../utils/crypto";

export const onRequestPost = async ({ request, env }) => {
    const user = await requireSupabaseUser(request, env);
    if (!user) return new Response("Unauthorized", { status: 401 });

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
    });

    // 1. Get connections
    const { data: connections } = await admin
        .from("calendar_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

    if (!connections?.length) {
        return Response.json({ synced: 0, message: "No active connections" });
    }

    let totalSynced = 0;

    for (const conn of connections) {
        try {
            let accessToken = conn.access_token;

            // TODO: Check expiry and refresh if needed (simplified for now: assume valid or fail)
            // If token expired:
            // 1. decrypt refresh_token
            // 2. call provider token endpoint
            // 3. update db
            // 4. use new access_token

            let events = [];

            if (conn.provider === "google") {
                events = await fetchGoogleEvents(accessToken);
            } else if (conn.provider === "microsoft") {
                events = await fetchMicrosoftEvents(accessToken);
            }

            if (events.length > 0) {
                // Upsert events
                const rows = events.map(e => ({
                    user_id: user.id,
                    connection_id: conn.id,
                    external_id: e.id,
                    title: e.title || "(No Title)",
                    description: e.description,
                    start_at: e.start,
                    end_at: e.end,
                    location: e.location,
                    // Derive category/tag logic here if needed
                    category: "Work",
                    updated_at: new Date().toISOString()
                }));

                const { error } = await admin.from("schedule_events").upsert(rows, {
                    onConflict: "user_id,connection_id,external_id"
                });

                if (!error) totalSynced += rows.length;
                else console.error("Upsert Error", error);
            }

        } catch (err) {
            console.error(`Sync failed for ${conn.provider}`, err);
        }
    }

    return Response.json({ synced: totalSynced });
};

async function fetchGoogleEvents(token) {
    // Fetch next 30 days
    const now = new Date();
    const next = new Date(); next.setDate(next.getDate() + 30);

    const params = new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: next.toISOString(),
        singleEvents: "true",
        orderBy: "startTime"
    });

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Google Sync Failed");
    const data = await res.json();

    return (data.items || []).map(item => ({
        id: item.id,
        title: item.summary,
        description: item.description,
        location: item.location,
        start: item.start.dateTime || item.start.date, // date-only for all-day
        end: item.end.dateTime || item.end.date
    }));
}

async function fetchMicrosoftEvents(token) {
    const now = new Date().toISOString();
    const next = new Date(); next.setDate(next.getDate() + 30);
    const nextIso = next.toISOString();

    const url = `https://graph.microsoft.com/v1.0/me/calendar/events?$filter=start/dateTime ge '${now}' and end/dateTime le '${nextIso}'&$select=subject,bodyPreview,start,end,location,id`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Microsoft Sync Failed");
    const data = await res.json();

    return (data.value || []).map(item => ({
        id: item.id,
        title: item.subject,
        description: item.bodyPreview,
        location: item.location?.displayName,
        start: item.start.dateTime + "Z", // Microsoft returns local time usually, need to ensure timezone handling. Assuming UTC or appending Z for simplicity. Ideally use item.start.timeZone
        end: item.end.dateTime + "Z"
    }));
}

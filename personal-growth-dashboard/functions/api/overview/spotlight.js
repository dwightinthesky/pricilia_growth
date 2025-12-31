import { requireSupabaseUser } from "../../utils/auth";
import { createClient } from "@supabase/supabase-js";

export const onRequestGet = async ({ request, env }) => {
    try {
        const { id: userId } = await requireSupabaseUser(request, env);
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        });

        // 1) Try Scheduled Event first (Uncomment if events table exists)
        /*
        const now = new Date().toISOString();
        const { data: evt } = await supabase
          .from("events")
          .select("id,title,start_at,location,tag")
          .eq("user_id", userId)
          .gte("start_at", now)
          .order("start_at", { ascending: true })
          .limit(1)
          .maybeSingle();
    
        if (evt) {
          return Response.json({
            item: {
              title: evt.title,
              sub: `${new Date(evt.start_at).toLocaleString()} · ${evt.location || "Event"}`,
              meta: [evt.tag || "Schedule"],
              kind: "schedule"
            }
          });
        }
        */

        // 2) Fallback: Inbox latest
        const { data, error } = await supabase
            .from("inbox_items")
            .select("id, kind, text, created_at")
            .eq("user_id", userId)
            .eq("archived", false)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            // Table might not exist yet, return null cleanly
            console.warn("Spotlight inbox lookup failed", error);
            return Response.json({ item: null });
        }

        const first = data?.[0];
        if (!first) return Response.json({ item: null });

        return Response.json({
            item: {
                title: first.text,
                sub: `Captured · ${new Date(first.created_at).toLocaleString()}`,
                meta: [first.kind || "Capture"],
                kind: first.kind || "inbox"
            }
        });

    } catch (e) {
        return Response.json({ error: e?.message || "SPOTLIGHT_FAILED" }, { status: 500 });
    }
};

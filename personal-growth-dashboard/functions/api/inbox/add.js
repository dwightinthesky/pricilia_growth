import { requireSupabaseUser } from "../../utils/auth";
import { createClient } from "@supabase/supabase-js";

export const onRequestPost = async ({ request, env }) => {
    try {
        const { id: userId } = await requireSupabaseUser(request, env);
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        });

        const body = await request.json();
        const { text, kind } = body;

        if (!text) return Response.json({ error: "No text provided" }, { status: 400 });

        const { data, error } = await supabase
            .from("inbox_items")
            .insert({
                user_id: userId,
                text,
                kind: kind || "note",
                created_at: new Date().toISOString(),
                archived: false
            })
            .select()
            .single();

        if (error) throw error;

        return Response.json({ ok: true, item: data });

    } catch (e) {
        return Response.json({ error: e?.message || "CAPTURE_FAILED" }, { status: 500 });
    }
};

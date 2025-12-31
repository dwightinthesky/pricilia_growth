import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../../utils/auth";

export const onRequestGet = async ({ request, env }) => {
    try {
        const { id: userId } = await requireSupabaseUser(request, env);

        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Misconfigured Supabase env");
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        });

        const today = new Date().toISOString().slice(0, 10);

        const [{ data: usageRow }, { count: recurringCount }] = await Promise.all([
            supabase
                .from("howie_daily_usage")
                .select("count")
                .eq("user_id", userId)
                .eq("day", today)
                .maybeSingle(),
            supabase
                .from("finance_recurring")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("enabled", true),
        ]);

        const howieUsed = usageRow?.count ?? 0;
        const recurringEnabled = recurringCount ?? 0;

        return Response.json({
            day: today,
            howie: { used: howieUsed },
            finance: { recurringEnabled },
        });
    } catch (e) {
        return Response.json({ error: e.message || "Usage status failed" }, { status: 500 });
    }
};

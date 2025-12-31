import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../../../utils/auth";

import { getPlanByUserId } from "../../../utils/getPlan";

const LIMITS = { free: 0, plus: 5, pro: 999999 };

export const onRequestPost = async ({ request, env }) => {
    try {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
            return Response.json({ error: "ENV_MISSING" }, { status: 500 });
        }

        const { id: userId } = await requireSupabaseUser(request, env);
        const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        const { plan } = await getPlanByUserId({ supabase: admin, userId });

        if (plan === "free") {
            return Response.json({ error: "RECURRING_LOCKED_FREE" }, { status: 402 });
        }

        if (plan === "plus") {
            const { count, error: countErr } = await admin
                .from("finance_recurring")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("enabled", true);

            if (countErr) throw countErr;

            if ((count || 0) >= LIMITS.plus) {
                return Response.json({ error: "RECURRING_LIMIT_REACHED", limit: LIMITS.plus }, { status: 402 });
            }
        }

        const body = await request.json();

        // Validate body briefly
        if (!body.amount_cents || !body.category || !body.frequency || !body.start_date) {
            return Response.json({ error: "MISSING_FIELDS" }, { status: 400 });
        }

        // Insert
        const payload = {
            ...body,
            user_id: userId,
            enabled: true, // Default enabled
            created_at: new Date().toISOString()
        };
        // Ensure clean payload
        delete payload.id;

        const { data, error } = await admin
            .from("finance_recurring")
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return Response.json(data);

    } catch (e) {
        return Response.json({ error: e.message || "Failed to create recurring rule" }, { status: 500 });
    }
};

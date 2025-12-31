import { requireSupabaseUser } from "../../utils/auth";
import { createClient } from "@supabase/supabase-js";

function firstDayISO() {
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    return first.toISOString();
}

export const onRequestGet = async ({ request, env }) => {
    try {
        const { id: userId } = await requireSupabaseUser(request, env);
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        });

        const monthStart = firstDayISO();

        // 1. Calculate Monthly Net (Income - Expense)
        const { data: tx, error: txErr } = await supabase
            .from("finance_transactions")
            .select("amount_cents,type,occurred_at")
            .eq("user_id", userId)
            .gte("occurred_at", monthStart);

        if (txErr) throw txErr;

        let netCents = 0;
        for (const t of tx || []) {
            const amt = Number(t.amount_cents || 0);
            const type = t.type;
            if (type === "income") netCents += amt;
            else if (type === "expense") netCents -= amt;
        }

        // 2. Count Active Recurring
        const { count: recurringActive, error: recErr } = await supabase
            .from("finance_recurring")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("enabled", true);

        if (recErr) throw recErr;

        // 3. Next Bill (Nearest recurring item)
        // Heuristic: just take the most recently created for now, 
        // real "next" requires calculating recurrence dates which is complex.
        const { data: recList, error: recListErr } = await supabase
            .from("finance_recurring")
            .select("title,merchant,amount_cents,currency,frequency,start_date")
            .eq("user_id", userId)
            .eq("enabled", true)
            .order("created_at", { ascending: false })
            .limit(1);

        if (recListErr) throw recListErr;

        const r = recList?.[0];
        const labelName = r?.title || r?.category || "Recurring";
        const currency = r?.currency || "EUR";
        const amount = (Number(r?.amount_cents || 0) / 100).toFixed(2);
        const nextBill = r ? `${labelName} ${currency === "EUR" ? "€" : ""}${amount}` : "None";

        return Response.json({
            snapshot: {
                monthNet: netCents / 100,
                recurringActive: recurringActive || 0,
                nextBill
            }
        });
    } catch (e) {
        return Response.json({ error: e?.message || "FINANCE_SNAPSHOT_FAILED" }, { status: 500 });
    }
};

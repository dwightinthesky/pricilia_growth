import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../../utils/auth";

export const onRequestGet = async ({ request, env }) => {
    try {
        const user = await requireSupabaseUser(request, env);
        if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // Parse query params
        const url = new URL(request.url);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const from = url.searchParams.get("from") || startOfMonth;
        const to = url.searchParams.get("to") || endOfMonth;

        // Fetch transactions
        const { data: txs, error } = await supabase
            .from("finance_transactions")
            .select("amount, type")
            .eq("user_id", user.id)
            .gte("date", from)
            .lte("date", to);

        if (error) throw error;

        // Aggregate
        let income = 0;
        let expense = 0;

        txs?.forEach(t => {
            const amt = parseFloat(t.amount);
            if (t.type === 'income') income += amt;
            else if (t.type === 'expense') expense += amt;
        });

        return new Response(JSON.stringify({
            income,
            expense,
            net: income - expense,
            period: { from, to }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

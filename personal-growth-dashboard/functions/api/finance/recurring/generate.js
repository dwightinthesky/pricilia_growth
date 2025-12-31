import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/finance/recurring/generate
 * Auth: Authorization: Bearer <supabase_access_token>
 *
 * body:
 * {
 *   "from": "2025-12-01",   // optional (default: today)
 *   "to":   "2025-12-31",   // optional (default: +30 days)
 *   "tz": "Europe/Paris",   // optional (default: Intl tz)
 *   "timeOfDay": "09:00"    // optional default "09:00"
 * }
 */
export const onRequestPost = async ({ request, env }) => {
    try {
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length)
            : null;

        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
            return Response.json({ error: "SUPABASE_ENV_MISSING" }, { status: 500 });
        }
        if (!token) return Response.json({ error: "NO_TOKEN" }, { status: 401 });

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData?.user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
        const userId = userData.user.id;

        const body = await request.json().catch(() => ({}));
        const tz = String(body?.tz || "Europe/Paris");
        const timeOfDay = String(body?.timeOfDay || "09:00"); // HH:mm
        const today = new Date();

        const fromStr = body?.from || toDateOnly(today);
        const toStr = body?.to || toDateOnly(addDays(today, 30));

        const from = parseDateOnly(fromStr);
        const to = parseDateOnly(toStr);
        if (!from || !to || to < from) {
            return Response.json({ error: "INVALID_RANGE" }, { status: 400 });
        }

        // 1) Load enabled recurring rules
        const { data: rules, error: rulesErr } = await supabase
            .from("finance_recurring")
            .select("*")
            .eq("user_id", userId)
            .eq("enabled", true);

        if (rulesErr) return Response.json({ error: "LOAD_RULES_FAILED", detail: rulesErr.message }, { status: 500 });

        let created = 0;
        let skipped = 0;
        const createdIds = [];

        for (const rule of rules || []) {
            const occurrences = computeOccurrences(rule, from, to);

            for (const occurredOn of occurrences) {
                // Prevent duplicates via log table
                const { data: existing, error: exErr } = await supabase
                    .from("finance_generated_log")
                    .select("id")
                    .eq("user_id", userId)
                    .eq("recurring_id", rule.id)
                    .eq("occurred_on", occurredOn)
                    .maybeSingle();

                if (exErr) {
                    // If query failed, don't risk dup creation
                    skipped++;
                    continue;
                }
                if (existing?.id) {
                    skipped++;
                    continue;
                }

                const occurredAt = dateOnlyWithTimeISO(occurredOn, timeOfDay, tz);

                // Insert transaction
                const txPayload = {
                    user_id: userId,
                    type: rule.type,
                    amount_cents: rule.amount_cents,
                    currency: rule.currency || "EUR",
                    category: rule.category,
                    merchant: rule.merchant || null,
                    note: rule.note || null,
                    occurred_at: occurredAt,
                    timezone: tz,
                    recurring_id: rule.id,
                };

                const { data: tx, error: txErr } = await supabase
                    .from("finance_transactions")
                    .insert(txPayload)
                    .select("id")
                    .single();

                if (txErr || !tx?.id) {
                    skipped++;
                    continue;
                }

                // Insert log (idempotent shield)
                const { error: logErr } = await supabase.from("finance_generated_log").insert({
                    user_id: userId,
                    recurring_id: rule.id,
                    occurred_on: occurredOn,
                    transaction_id: tx.id,
                });

                if (logErr) {
                    // If log insert failed (likely duplicate), rollback tx
                    await supabase.from("finance_transactions").delete().eq("id", tx.id).eq("user_id", userId);
                    skipped++;
                    continue;
                }

                created++;
                createdIds.push(tx.id);
                createdIds.length <= 20 && createdIds.push(); // keep small (no-op)
            }
        }

        return Response.json({
            ok: true,
            range: { from: fromStr, to: toStr },
            tz,
            timeOfDay,
            created,
            skipped,
        });
    } catch (e) {
        return Response.json({ error: e?.message || "UNKNOWN_ERROR" }, { status: 500 });
    }
};

// ---------- helpers ----------
function toDateOnly(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function parseDateOnly(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const d = new Date(`${s}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : s;
}
function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

/**
 * Return list of occurred_on dates (YYYY-MM-DD) within [from,to]
 * rule.frequency: weekly/monthly
 * - weekly: rule.byweekday (0=Sun..6=Sat)
 * - monthly: rule.bymonthday (1..31); if month shorter -> last day of month
 * rule.start_date / end_date are date strings
 */
function computeOccurrences(rule, fromStr, toStr) {
    const from = new Date(`${fromStr}T00:00:00Z`);
    const to = new Date(`${toStr}T00:00:00Z`);

    const ruleStart = new Date(`${rule.start_date}T00:00:00Z`);
    const ruleEnd = rule.end_date ? new Date(`${rule.end_date}T00:00:00Z`) : null;

    const start = new Date(Math.max(from.getTime(), ruleStart.getTime()));
    const end = new Date(to.getTime());
    if (ruleEnd && end.getTime() > ruleEnd.getTime()) end.setTime(ruleEnd.getTime());
    if (end < start) return [];

    const out = [];

    if (rule.frequency === "weekly") {
        const targetDow = Number(rule.byweekday);
        if (!(targetDow >= 0 && targetDow <= 6)) return [];

        // move start to the next matching weekday (including same day)
        const cur = new Date(start);
        while (cur.getUTCDay() !== targetDow) cur.setUTCDate(cur.getUTCDate() + 1);

        while (cur <= end) {
            out.push(toDateOnly(cur));
            cur.setUTCDate(cur.getUTCDate() + 7);
        }
        return out;
    }

    if (rule.frequency === "monthly") {
        const md = Number(rule.bymonthday);
        if (!(md >= 1 && md <= 31)) return [];

        let y = start.getUTCFullYear();
        let m = start.getUTCMonth();

        // iterate months until end
        while (true) {
            const monthStart = new Date(Date.UTC(y, m, 1));
            const monthEnd = new Date(Date.UTC(y, m + 1, 0)); // last day

            const day = Math.min(md, monthEnd.getUTCDate());
            const occ = new Date(Date.UTC(y, m, day));

            if (occ >= start && occ <= end) out.push(toDateOnly(occ));
            if (monthStart > end) break;

            // next month
            m += 1;
            if (m >= 12) { m = 0; y += 1; }
            if (new Date(Date.UTC(y, m, 1)) > end) break;
        }
        return out;
    }

    return [];
}

/**
 * Convert occurred_on date + timeOfDay + tz into ISO string.
 * MVP: store as UTC ISO, using naive local time conversion.
 * (Good enough; later可換成真正 tz library）
 */
function dateOnlyWithTimeISO(dateOnly, hhmm, tz) {
    const [hh, mm] = String(hhmm || "09:00").split(":").map((x) => Number(x));
    // interpret as local time, then to ISO (client will display with tz)
    const d = new Date(`${dateOnly}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`);
    return d.toISOString();
}

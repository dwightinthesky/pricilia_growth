import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../utils/auth";
import { getPlanByUserId } from "../utils/getPlan";

const LIMITS = {
  free: 3,
  plus: 10,
  pro: 999999,
};

function todayUTC() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function getUsage(supabase, userId, day) {
  const { data, error } = await supabase
    .from("howie_daily_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  if (error) {
    console.warn("getUsage error", error);
    return 0;
  }
  return data?.count || 0;
}

async function incUsage(supabase, userId, day) {
  const { error: rpcErr } = await supabase.rpc("howie_usage_increment", {
    p_user_id: userId,
    p_day: day,
  });

  if (!rpcErr) return;

  console.warn("howie_usage_increment RPC failed, using fallback upsert", rpcErr);

  const current = await getUsage(supabase, userId, day);
  const { error: upsertErr } = await supabase
    .from("howie_daily_usage")
    .upsert(
      { user_id: userId, day, count: current + 1, updated_at: new Date().toISOString() },
      { onConflict: "user_id, day" }
    );

  if (upsertErr) console.error("incUsage fallback failed", upsertErr);
}

function isValidHowieResponse(x) {
  return (
    x &&
    typeof x === "object" &&
    ["on_track", "behind", "overloaded"].includes(x.status) &&
    typeof x.summary === "string" &&
    Array.isArray(x.recommendations)
  );
}

async function openaiChatJSON({ apiKey, model, messages, temperature = 0.2, max_tokens = 700 }) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      response_format: { type: "json_object" },
    }),
  });

  const out = await r.json();
  if (!r.ok) throw new Error(out?.error?.message || "OpenAI request failed");
  return out;
}

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env.SUPABASE_URL) throw new Error("ENV_MISSING:SUPABASE_URL");
    if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("ENV_MISSING:SUPABASE_SERVICE_ROLE_KEY");
    if (!env.OPENAI_API_KEY) throw new Error("ENV_MISSING:OPENAI_API_KEY");

    const { id: userId } = await requireSupabaseUser(request, env);

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { plan } = await getPlanByUserId({ supabase: admin, userId });
    const limit = LIMITS[plan] ?? LIMITS.free;

    const day = todayUTC();
    const used = await getUsage(admin, userId, day);

    if (used >= limit) {
      return Response.json(
        { error: "HOWIE_LIMIT_REACHED", plan, used, limit, remaining: 0 },
        { status: 402 }
      );
    }

    const body = await request.json();
    const { tone, intent, context, memory } = body;

    const system = `
You are HowieAI, a product-grade growth assistant.
Return ONLY a valid JSON object that matches this schema:

{
  "status": "on_track" | "behind" | "overloaded",
  "summary": "Objective assessment (description of the current rhythm, max 220 chars)",
  "recommendations": [
    {
      "title": "Clear Actionable Title",
      "why": "Rational explanation based on data",
      "impact": "Specific benefit (e.g., 'Avoids cramming on Sunday')",
      "actions": [
        {
          "type": "open_schedule" | "schedule_session" | "create_event",
          "label": "Button Label",
          "payload": {
            "url": "optional url for open_schedule",
            "goalId": "optional for schedule_session",
            "title": "optional for schedule_session/create_event",
            "startISO": "required for create_event",
            "durationMin": 90,
            "extraUpGoalId": "optional"
          }
        }
      ]
    }
  ]
}

Rules:
- No markdown. No extra keys. No arrays at top-level.
- Keep summary <= 220 chars.
- Provide 1 to 3 recommendations.
- Tone style:
  - calm: concise, neutral, practical
  - strict: direct, no fluff, accountability
  - coach: warm, encouraging, but still actionable
- Memory Usage:
  - If a goal is in memory.pinnedGoalIds, prioritize recommendations connected to it.
  - If memory.recent has a similar action recently, acknowledge it or suggest the next step rather than repeating.
- Use given context to decide status:
  - If any goal alert=behind => status="behind"
  - If any goal alert=overloaded => status="overloaded"
  - Else status="on_track"
- Always include a fallback open_schedule action too.
`.trim();

    const userPayload = JSON.stringify({ tone, intent, context, memory });

    const completion = await openaiChatJSON({
      apiKey: env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPayload },
      ],
      temperature: 0.2,
      max_tokens: 700,
    });

    await incUsage(admin, userId, day);

    const nextUsed = used + 1;
    const remaining = Math.max(0, limit - nextUsed);

    const content = completion?.choices?.[0]?.message?.content;
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }

    if (!parsed || !isValidHowieResponse(parsed)) {
      return Response.json({ error: "Invalid HowieResponse", raw: content }, { status: 500 });
    }

    parsed._usage = { plan, used: nextUsed, limit, remaining };

    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: e?.message || "Howie failed" }, { status: 500 });
  }
};

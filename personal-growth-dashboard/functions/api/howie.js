function extractFirstJson(text) {
  // Conservative recovery: try to find the first JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try { return JSON.parse(candidate); } catch { return null; }
}

function isValidHowieResponse(x) {
  return x && typeof x === "object"
    && ["on_track", "behind", "overloaded"].includes(x.status)
    && typeof x.summary === "string"
    && Array.isArray(x.recommendations);
}

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), { status: 500 });
    }

    const body = await request.json();
    const tone = body?.tone || "calm"; // calm | strict | coach
    const context = body?.context || {};
    const memory = body?.memory || {};
    const intent = body?.intent || "general";

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
- Action payload rules:
  - open_schedule payload: { "url": string }
  - schedule_session payload: { "goalId"?: string, "title": string, "durationMin": number }
  - create_event payload: { "title": string, "startISO": string, "durationMin": number, "extraUpGoalId"?: string }
- Always include a fallback open_schedule action too.
`.trim();

    const userPayload = JSON.stringify({ tone, intent, context, memory });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPayload },
        ],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: "OpenAI error", detail: t }), { status: 500 });
    }

    const data = await r.json();

    // Responses API structure might vary, so we parse the content string
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(JSON.stringify({ error: "No content from OpenAI" }), { status: 500 });
    }

    let parsed = null;
    try { parsed = JSON.parse(content); } catch { parsed = null; }

    if (!parsed || !isValidHowieResponse(parsed)) {
      // Fallback or detailed error for debugging
      return new Response(JSON.stringify({ error: "Invalid HowieResponse", raw: content }), { status: 500 });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { status: 500 });
  }
};

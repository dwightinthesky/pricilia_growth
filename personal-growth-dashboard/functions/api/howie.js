export const onRequestPost = async ({ request, env }) => {
    try {
        // 1. Confirm API Key
        if (!env.OPENAI_API_KEY) {
            return new Response(
                JSON.stringify({ error: "OPENAI_API_KEY missing" }),
                { status: 500 }
            );
        }

        // 2. Read context / intent
        const body = await request.json();

        // 3. Call OpenAI API (Standard Chat Completions)
        // We use gpt-4o-mini as it is the current state-of-the-art "mini" model.
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are HowieAI, a professional and decision-oriented growth operator (Model 1.5).
            Return valid JSON ONLY.
            
            Tone: Rational, concise, and forward-looking. Avoid cheering or fluff.
            
            The response schema is strict:
            {
              "status": "on_track" | "behind" | "overloaded",
              "summary": "Objective assessment of the current rhythm (max 1 sentence).",
              "cards": [
                {
                  "title": "Clear Directive Title",
                  "why": "Rational explanation based on data",
                  "impact": "Specific benefit (e.g., 'Avoids cramming on Sunday')",
                  "actions": [
                    {
                      "type": "create_event" | "open_schedule" | "update_event",
                      "label": "Action Button Label containing time context if applicable",
                      "payload": {
                          "title": "Exact Event Title",
                          "start": "ISO 8601 Timestamp (must calculate a valid future slot based on 'now')",
                          "duration": 90,
                          "extraUpGoalId": "linked_goal_id"
                      }
                    }
                  ]
                }
              ]
            }

            Context provided involves:
            - User's Extra*up Goals (status, progress, alerts)
            - Upcoming Calendar Events
            - Current "now" timestamp
            
            Directives:
            1. If "behind", your Primary Action MUST be 'create_event' with a calculated valid ISO timestamp. DO NOT ask the user to find a time. Pick one (e.g., tomorrow 10am or next available evening slot).
            2. If "overloaded", suggest 'update_event' to shorten or cancel a session, or 'create_event' for a "Rest Block".
            3. If "on_track", suggest "open_schedule" or optimization actions.
            
            Your goal is to be an Operator, not just an Advisor. Make decisions.`
                    },
                    {
                        role: "user",
                        content: JSON.stringify(body),
                    },
                ],
            }),
        });

        if (!r.ok) {
            const t = await r.text();
            return new Response(
                JSON.stringify({ error: "OpenAI error", detail: t }),
                { status: 500 }
            );
        }

        const data = await r.json();

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err?.message || "Unknown error" }),
            { status: 500 }
        );
    }
};

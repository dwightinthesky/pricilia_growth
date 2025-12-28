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
                        content: `You are HowieAI, a calm and practical growth assistant. 
            You must return valid JSON ONLY. 
            
            The response schema is:
            {
              "summary": "Brief, encouraging summary of the situation (max 2 sentences).",
              "cards": [
                {
                  "title": "Actionable Title",
                  "why": "Why this is recommended based on context",
                  "actions": [
                    {
                      "type": "create_event" | "open_schedule" | "update_event",
                      "label": "Button Label",
                      "payload": { ... }
                    }
                  ]
                }
              ]
            }

            Context provided involves:
            - User's Extra*up Goals (status, progress, alerts)
            - Upcoming Calendar Events
            
            Goal: Help the user maintain a sustainable rhythm. 
            - If a goal is 'Falling Behind', suggest scheduling a session.
            - If a goal is 'Overloaded', suggest cooldown or rest.
            - If 'On Track', suggest optimization or praise.
            `
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

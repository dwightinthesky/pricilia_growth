export const onRequestPost = async ({ request, env }) => {
    try {
        const body = await request.json();

        // Check for API Key
        if (!env.OPENAI_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY configuration" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o", // using gpt-4o for better availability and JSON mode support
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are HowieAI, a proactive personal growth assistant. 
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

        if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({ error: "OpenAI API Error", details: errText }), {
                status: response.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

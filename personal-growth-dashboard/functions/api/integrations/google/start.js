import { requireSupabaseUser } from "../../../utils/auth";
import { signState } from "../../../utils/oauthState";


function requireEnv(env, keys) {
    const missing = keys.filter(k => !env[k] || String(env[k]).trim() === "");
    if (missing.length) {
        return new Response(
            JSON.stringify({ error: "ENV_MISSING", missing }),
            { status: 500, headers: { "content-type": "application/json" } }
        );
    }
    return null;
}

export const onRequestGet = async ({ request, env }) => {
    try {
        const bad = requireEnv(env, [
            "GOOGLE_CLIENT_ID",
            "STATE_SECRET",
            "PUBLIC_BASE_URL",
            "SUPABASE_URL",
        ]);
        if (bad) return bad;

        // 1. Ensure user is logged in
        const user = await requireSupabaseUser(request, env);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const userId = user.id;

        // 2. Create state (async)
        const state = await signState(env.STATE_SECRET, {
            userId,
            provider: "google",
            ts: Date.now()
        });

        const redirectUri = `${env.PUBLIC_BASE_URL}/api/integrations/google/callback`;

        // 3. specific params for Google Calendar
        const params = new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: "code",
            access_type: "offline", // Get refresh token
            prompt: "consent",      // Force consent to ensure refresh token is returned
            scope: "https://www.googleapis.com/auth/calendar.readonly email profile",
            state
        });

        // 4. Return URL for frontend to redirect
        return Response.json({
            url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
        });
    } catch (e) {
        return Response.json(
            { error: e.message || "OAUTH_START_FAILED" },
            { status: 401, headers: { "content-type": "application/json" } }
        );
    }
};

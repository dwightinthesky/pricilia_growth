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
            "MICROSOFT_CLIENT_ID",
            "STATE_SECRET",
            "PUBLIC_BASE_URL",
            "SUPABASE_URL"
        ]);
        if (bad) return bad;

        const user = await requireSupabaseUser(request, env);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const userId = user.id;

        const state = await signState(env.STATE_SECRET, {
            userId,
            provider: "microsoft",
            ts: Date.now()
        });

        const redirectUri = `${env.PUBLIC_BASE_URL}/api/integrations/microsoft/callback`;

        const params = new URLSearchParams({
            client_id: env.MICROSOFT_CLIENT_ID,
            response_type: "code",
            redirect_uri: redirectUri,
            response_mode: "query",
            scope: "offline_access Calendars.Read User.Read",
            state
        });

        return Response.json({
            url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
        });
    } catch (e) {
        return Response.json(
            { error: e.message || "OAUTH_START_FAILED" },
            { status: 401, headers: { "content-type": "application/json" } }
        );
    }
};

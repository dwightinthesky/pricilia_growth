import { createClient } from "@supabase/supabase-js";
import { verifyState } from "../../../utils/oauthState";
import { encrypt } from "../../../utils/crypto";

export const onRequestGet = async ({ request, env }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) return new Response("Missing code/state", { status: 400 });

    const payload = await verifyState(env.STATE_SECRET, state);
    if (!payload || payload.provider !== "microsoft") {
        return new Response("Bad state", { status: 400 });
    }

    const redirectUri = `${env.PUBLIC_BASE_URL}/api/integrations/microsoft/callback`;

    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: env.MICROSOFT_CLIENT_ID,
            client_secret: env.MICROSOFT_CLIENT_SECRET,
            code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code"
        })
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
        return new Response(`Microsoft Error: ${JSON.stringify(tokenJson)}`, { status: 400 });
    }

    // Microsoft returns: access_token, refresh_token, expires_in (seconds)
    const accessToken = tokenJson.access_token;
    const refreshToken = tokenJson.refresh_token;
    const expiresIn = tokenJson.expires_in;

    // Get User Profile (Principal Name / Email)
    const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const me = await meRes.json().catch(() => ({}));

    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
    });

    const encRefresh = refreshToken ? await encrypt(env.TOKEN_SECRET, refreshToken) : null;

    const { error } = await admin.from("calendar_connections").upsert({
        user_id: payload.userId,
        provider: "microsoft",
        status: "active",
        account_email: me?.userPrincipalName || me?.mail || null,
        access_token: accessToken,
        refresh_token: encRefresh,
        token_expiry: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
    }, { onConflict: "user_id,provider" });

    if (error) {
        return new Response(`DB Error: ${error.message}`, { status: 500 });
    }

    return Response.redirect(`${env.PUBLIC_BASE_URL}/settings?connected=microsoft`, 302);
};

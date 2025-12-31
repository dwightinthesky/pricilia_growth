import { createClient } from "@supabase/supabase-js";
import { verifyState } from "../../../utils/oauthState";
import { encrypt } from "../../../utils/crypto";

export const onRequestGet = async ({ request, env }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) return new Response("Missing code/state", { status: 400 });

    // 1. Verify State (async)
    const payload = await verifyState(env.STATE_SECRET, state);
    if (!payload || payload.provider !== "google") {
        return new Response("Bad state or session expired", { status: 400 });
    }

    const redirectUri = `${env.PUBLIC_BASE_URL}/api/integrations/google/callback`;

    // 2. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code"
        })
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
        return new Response(`Google Error: ${JSON.stringify(tokenJson)}`, { status: 400 });
    }

    const accessToken = tokenJson.access_token;
    const refreshToken = tokenJson.refresh_token;
    const expiresIn = tokenJson.expires_in;

    // 3. Get User Email
    const meRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const me = await meRes.json().catch(() => ({}));

    // 4. Save to Supabase (Calendar Connections)
    const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
    });

    // Encrypt refresh token if present
    const encRefresh = refreshToken ? await encrypt(env.TOKEN_SECRET, refreshToken) : null;

    const { error } = await admin.from("calendar_connections").upsert({
        user_id: payload.userId,
        provider: "google",
        status: "active",
        account_email: me?.email || null,
        access_token: accessToken, // Short lived, ok to store plain or encrypt too if strict. Standard Practice: Plain ok if DB is secure, but refresh token MUST be encrypted.
        refresh_token: encRefresh,
        token_expiry: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
    }, { onConflict: "user_id,provider" });

    if (error) {
        return new Response(`DB Error: ${error.message}`, { status: 500 });
    }

    // 5. Redirect back to settings
    return Response.redirect(`${env.PUBLIC_BASE_URL}/settings?connected=google`, 302);
};

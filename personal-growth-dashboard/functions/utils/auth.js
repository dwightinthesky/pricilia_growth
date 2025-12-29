import { jwtVerify } from "jose";

export async function requireSupabaseUser(request, env) {
    const auth = request.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
        const e = new Error("NO_TOKEN");
        e.status = 401;
        throw e;
    }

    if (!env.SUPABASE_URL) {
        console.error("SUPABASE_URL is missing from env");
        throw new Error("SUPABASE_URL_MISSING");
    }

    // Prefer Anon Key for client verification, but Service Role works too.
    const apiKey = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
    if (!apiKey) {
        console.error("SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY) missing from env");
        throw new Error("SUPABASE_KEY_MISSING");
    }

    // Supabase: Verify access_token with Auth Admin API
    const url = `${env.SUPABASE_URL}/auth/v1/user`;

    const r = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            apikey: apiKey,
        },
    });

    if (!r.ok) {
        const t = await r.text();
        const e = new Error(`INVALID_TOKEN: ${t}`);
        e.status = 401;
        throw e;
    }

    const user = await r.json();
    // user.id is UUID
    return { uid: user.id, email: user.email || null };
}

// Alias for backward compatibility during migration
export const requireFirebaseUser = requireSupabaseUser;

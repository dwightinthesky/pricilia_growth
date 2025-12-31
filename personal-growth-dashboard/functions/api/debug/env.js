export const onRequestGet = async ({ env, request }) => {
    // Helper: list keys safely
    const keys = Object.keys(env || {}).sort();

    // Common pitfall: accidentally created keys with leading/trailing spaces
    const suspicious = keys.filter(k => k !== k.trim());

    // Strong signal: where am I?
    const url = new URL(request.url);

    const pick = (k) => (typeof env?.[k] === "string" ? env[k] : null);

    return Response.json({
        url: url.toString(),
        project: pick("PROJECT_NAME"),
        envType: pick("ENV_TYPE"),
        envMarker: pick("ENV_MARKER"),
        cfPagesUrl: pick("CF_PAGES_URL"),
        cfPagesBranch: pick("CF_PAGES_BRANCH"),
        runtimeKeys: keys,
        suspiciousKeys: suspicious,

        // Presence checks (these are what actually matter)
        hasSUPABASE_URL: !!env.SUPABASE_URL,
        hasSUPABASE_ANON_KEY: !!env.SUPABASE_ANON_KEY,
        hasSUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY,
        hasSTRIPE_SECRET_KEY: !!env.STRIPE_SECRET_KEY,
        hasSTRIPE_PRICE_PLUS: !!env.STRIPE_PRICE_PLUS,
        hasSTRIPE_PRICE_PRO: !!env.STRIPE_PRICE_PRO,
        hasAPP_URL: !!env.APP_URL,

        // Optional: type sanity
        valType_SUPABASE_URL: typeof env.SUPABASE_URL,
    });
};

export const onRequestGet = async ({ env }) => {
    return Response.json({
        hasSUPABASE_URL: !!env.SUPABASE_URL,
        hasSUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY,
        hasSTRIPE_SECRET_KEY: !!env.STRIPE_SECRET_KEY,
        hasSTRIPE_PRICE_PLUS: !!env.STRIPE_PRICE_PLUS,
        hasAPP_URL: !!env.APP_URL,
        hasSUPABASE_ANON_KEY: !!env.SUPABASE_ANON_KEY,
    });
};

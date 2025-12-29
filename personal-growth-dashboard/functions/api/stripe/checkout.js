import Stripe from "stripe";
import { requireSupabaseUser } from "../../utils/auth";
import { getOrCreateCustomerIdByUid } from "../../utils/billingStore";

export const onRequestPost = async ({ request, env }) => {
    const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "STRIPE_PRICE_PLUS", "APP_URL"];
    for (const k of required) {
        if (!env[k]) return Response.json({ error: `ENV_MISSING:${k}` }, { status: 500 });
    }

    try {
        const { uid, email } = await requireSupabaseUser(request, env);

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: "2024-06-20",
        });

        const customerId = await getOrCreateCustomerIdByUid({ env, stripe, uid, email });

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            line_items: [{ price: env.STRIPE_PRICE_PLUS, quantity: 1 }],
            subscription_data: {
                metadata: { userId: uid }, // Use userId for Webhook
            },
            success_url: `${env.APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.APP_URL}/pricing?checkout=cancel`,
            metadata: { userId: uid },
        });

        return Response.json({ url: session.url });
    } catch (e) {
        const status = e.status || (e.message === "NO_TOKEN" ? 401 : 500);
        return Response.json({ error: e.message || "Checkout failed" }, { status });
    }
};

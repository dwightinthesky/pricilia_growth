import Stripe from "stripe";
import { requireFirebaseUser } from "../../utils/auth";
import { getOrCreateCustomerIdByUid } from "../../utils/billingStore";

export const onRequestPost = async ({ request, env }) => {
    try {
        // 1. Secure it
        // The user instruction implies: "server-side only", "no manual customerId passing".
        // We already have billingStore/KV setup.
        const { uid } = await requireFirebaseUser(request, env);

        // 2. Get Customer ID from KV (Primary source of truth for billing settings)
        const kv = env.BILLING_STORE || env.BILLING_KV;
        const customerId = await kv.get(`uid:${uid}:customerId`) || await kv.get(uid);
        // ^ Try structured key first (from new webhook), fallback to legacy billingStore key (uid -> customrId)

        if (!customerId) {
            // If no customer ID, it means they never checked out as Plus.
            // If they are free, they might not have a portal.
            // In "product-grade", maybe free users can't open portal unless they have history?
            // Return 400.
            return Response.json({ error: "No billing account found. Please upgrade first." }, { status: 400 });
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY);

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${env.APP_URL}/settings/billing`,
        });

        return Response.json({ url: session.url });
    } catch (e) {
        const msg = e.message || "Portal failed";
        const status = msg === "NO_TOKEN" ? 401 : 500;
        return Response.json({ error: msg }, { status });
    }
};

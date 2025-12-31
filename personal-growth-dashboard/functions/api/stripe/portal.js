import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../../utils/auth";

export const onRequestPost = async ({ request, env }) => {
    try {
        // 1. Auth
        const user = await requireSupabaseUser(request, env);
        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // 2. Stripe
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);

        // 3. Get Customer ID from Supabase
        // We assume the customer ID is stored in the 'profiles' table or 'billing_customers' table.
        // Based on previous steps, we look at 'profiles' first or 'billing_customers'.
        // billing/status.js looked at 'profiles'. webhook.js updates 'billing_customers' AND 'profiles'.
        // Let's look at 'profiles' first as it's the main user record, but webhook upserts 'billing_customers' for mapping.
        // Let's use 'profiles' as it's likely where we keep the canonical ID for the user's view.

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (error || !profile?.stripe_customer_id) {
            // Fallback: Check billing_customers if profiles is missing it?
            const { data: billingRow } = await supabase
                .from('billing_customers')
                .select('stripe_customer_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (billingRow?.stripe_customer_id) {
                // Recovered
            } else {
                return new Response(
                    JSON.stringify({ error: "NO_CUSTOMER" }),
                    { status: 400 }
                );
            }
        }

        const customerId = profile?.stripe_customer_id; // or billingRow if we implemented fallback logic properly above. 
        // Let's stick to simple logical flow:

        let targetCustomerId = profile?.stripe_customer_id;
        if (!targetCustomerId) {
            const { data: billingRow } = await supabase
                .from('billing_customers')
                .select('stripe_customer_id')
                .eq('user_id', user.id)
                .maybeSingle();
            targetCustomerId = billingRow?.stripe_customer_id;
        }

        if (!targetCustomerId) {
            return new Response(
                JSON.stringify({ error: "NO_CUSTOMER" }),
                { status: 400 }
            );
        }

        // 4. Create Customer Portal Session
        // Use env.APP_URL if available, otherwise derive from request
        const origin = env.APP_URL || new URL(request.url).origin;
        const returnUrl = `${origin}/billing`;

        const session = await stripe.billingPortal.sessions.create({
            customer: targetCustomerId,
            return_url: returnUrl,
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        const msg = e.message || "PORTAL_FAILED";
        const status = (msg === "Unauthorized" || msg === "NO_TOKEN") ? 401 : 500;
        return new Response(JSON.stringify({ error: msg }), { status });
    }
};

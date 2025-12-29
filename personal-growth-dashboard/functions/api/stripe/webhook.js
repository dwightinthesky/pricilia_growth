import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function planFromPriceId(env, priceId) {
    if (!priceId) return "free";
    if (priceId === env.STRIPE_PRICE_PRO) return "pro";
    if (priceId === env.STRIPE_PRICE_PLUS) return "plus";
    return "free";
}

async function upsertCustomer({ supabase, userId, customerId }) {
    await supabase.from("billing_customers").upsert(
        { user_id: userId, stripe_customer_id: customerId },
        { onConflict: "user_id" }
    );
}

async function setUserPlan({ supabase, userId, plan }) {
    // Assuming 'profiles' table exists as per instructions
    await supabase.from("profiles").upsert(
        { id: userId, plan, updated_at: new Date().toISOString() },
        { onConflict: "id" }
    );
}

export const onRequestPost = async ({ request, env }) => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const sig = request.headers.get("stripe-signature");
    if (!sig) return new Response("Missing stripe-signature", { status: 400 });

    const rawBody = await request.text();

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    try {
        // 1) Checkout Completed: Bind user + subscription
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            if (session.mode !== "subscription") return new Response("ignored", { status: 200 });

            // Use 'userId' from metadata as requested
            const userId = session?.metadata?.userId;
            const customerId = session.customer;
            const subscriptionId = session.subscription;

            if (!userId || !customerId || !subscriptionId) {
                return new Response("Missing userId/customer/subscription on session", { status: 400 });
            }

            await upsertCustomer({ supabase, userId, customerId });

            const sub = await stripe.subscriptions.retrieve(subscriptionId, {
                expand: ["items.data.price"]
            });

            const priceId = sub.items?.data?.[0]?.price?.id || null;
            const plan = planFromPriceId(env, priceId);

            await supabase.from("billing_subscriptions").upsert(
                {
                    stripe_subscription_id: sub.id,
                    user_id: userId,
                    stripe_customer_id: customerId,
                    price_id: priceId,
                    status: sub.status,
                    current_period_end: sub.current_period_end
                        ? new Date(sub.current_period_end * 1000).toISOString()
                        : null,
                    updated_at: new Date().toISOString()
                },
                { onConflict: "stripe_subscription_id" }
            );

            await setUserPlan({ supabase, userId, plan });

            return new Response("ok", { status: 200 });
        }

        // 2) Subscription Updates: Sync status & plan
        if (
            event.type === "customer.subscription.updated" ||
            event.type === "customer.subscription.deleted" ||
            event.type === "customer.subscription.created"
        ) {
            const sub = event.data.object;
            const customerId = sub.customer;
            const subscriptionId = sub.id;

            const { data: customerRow, error } = await supabase
                .from("billing_customers")
                .select("user_id")
                .eq("stripe_customer_id", customerId)
                .maybeSingle();

            if (error) throw error;
            if (!customerRow?.user_id) return new Response("customer not linked", { status: 200 });

            const userId = customerRow.user_id;

            const priceId = sub.items?.data?.[0]?.price?.id || null;
            const plan = (sub.status === "active" || sub.status === "trialing")
                ? planFromPriceId(env, priceId)
                : "free";

            await supabase.from("billing_subscriptions").upsert(
                {
                    stripe_subscription_id: subscriptionId,
                    user_id: userId,
                    stripe_customer_id: customerId,
                    price_id: priceId,
                    status: sub.status,
                    current_period_end: sub.current_period_end
                        ? new Date(sub.current_period_end * 1000).toISOString()
                        : null,
                    updated_at: new Date().toISOString()
                },
                { onConflict: "stripe_subscription_id" }
            );

            await setUserPlan({ supabase, userId, plan });

            return new Response("ok", { status: 200 });
        }

        return new Response("ignored", { status: 200 });
    } catch (err) {
        return new Response(`Webhook handler error: ${err.message}`, { status: 500 });
    }
};

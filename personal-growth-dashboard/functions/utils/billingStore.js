export async function getOrCreateCustomerIdByUid({ env, stripe, uid, email }) {
    const supabaseAdminUrl = `${env.SUPABASE_URL}/auth/v1/admin/users/${uid}`;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
    };

    // 1. Check Supabase User Metadata
    try {
        const res = await fetch(supabaseAdminUrl, { headers });
        if (res.ok) {
            const user = await res.json();
            if (user.user_metadata?.stripe_customer_id) {
                return user.user_metadata.stripe_customer_id;
            }
        }
    } catch (e) {
        console.error("Failed to fetch Supabase user:", e);
    }

    // 2. Create Stripe Customer
    const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: {
            firebaseUid: uid, // Keeping legacy key for consistency or changing to 'supabaseUid'
            supabaseUid: uid
        },
    });

    // 3. Store mapping in Supabase Metadata
    try {
        await fetch(supabaseAdminUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                user_metadata: { stripe_customer_id: customer.id }
            })
        });
    } catch (e) {
        console.error("Failed to update Supabase user metadata:", e);
        // We continue even if storage fails, though next time we'll create duplicate customer.
        // In production, might want to throw or queue this.
    }

    return customer.id;
}

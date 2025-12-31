export async function getPlanByUserId({ supabase, userId }) {
    const { data, error } = await supabase
        .from("profiles")
        .select("plan,email,stripe_customer_id")
        .eq("id", userId)
        .single();

    if (error) {
        console.warn("getPlanByUserId failed:", error);
        // Return safe defaults if profile missing (e.g. auth-only user)
        return {
            plan: "free",
            email: null,
            stripeCustomerId: null,
        };
    }

    return {
        plan: data?.plan || "free",
        email: data?.email || null,
        stripeCustomerId: data?.stripe_customer_id || null,
    };
}

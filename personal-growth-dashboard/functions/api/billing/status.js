
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseUser } from '../../utils/auth';
import { getPlanByUserId } from '../../utils/getPlan';

export const onRequest = async (context) => {
  const { request, env } = context;

  try {
    const user = await requireSupabaseUser(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // 1. Get Plan from Profiles
    const { plan, email, stripeCustomerId } = await getPlanByUserId({ supabase, userId: user.id });
    const profile = { plan, stripe_customer_id: stripeCustomerId }; // adapter for below code

    // 2. Get active subscription details
    // We join or separate query. Separate is fine.
    let subData = {};
    if (profile?.stripe_customer_id) {
      const { data: subscription } = await supabase
        .from('billing_subscriptions')
        .select('current_period_end, status, cancel_at_period_end')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscription) {
        subData = {
          renewAt: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        };
      }
    }

    return new Response(JSON.stringify({
      plan: profile?.plan || 'free',
      email: user.email,
      renewAt: subData.renewAt || null,
      cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

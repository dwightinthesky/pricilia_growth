import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../../utils/auth";

export const onRequestGet = async ({ request, env }) => {
  try {
    const { uid } = await requireSupabaseUser(request, env);

    // Env check
    if (!env.SUPABASE_URL || (!env.SUPABASE_ANON_KEY && !env.SUPABASE_SERVICE_ROLE_KEY)) {
      throw new Error("SUPABASE_CONFIG_MISSING");
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

    // Fetch Plan from Profiles
    // This is the "Projection" updated by our Webhook
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", uid)
      .maybeSingle();

    if (error) console.error("Profile fetch error:", error);

    return Response.json({
      plan: profile?.plan || "free"
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
};

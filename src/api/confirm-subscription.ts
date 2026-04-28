import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/types";

// API route handler for /api/confirm-subscription
// Called by Vite middleware with parsed JSON body — runs ONLY server-side

export default async function handler(data: {
  token: string;
}): Promise<{ success: boolean; error: string | null; email?: string }> {
  const { token } = data;

  if (!token) {
    return { success: false, error: "Missing token" };
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  // Look up subscription by token
  const { data: subscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select("id, user_id, email, status")
    .eq("confirmation_token", token)
    .single();

  if (fetchError || !subscription) {
    return { success: false, error: "Invalid or expired confirmation token" };
  }

  const sub = subscription as unknown as { id: string; status: string; email: string };

  if (sub.status === "active") {
    return { success: true, email: sub.email, error: null };
  }

  // Activate the subscription
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      confirmed_at: new Date().toISOString(),
    } as never)
    .eq("id", sub.id);

  if (updateError) {
    return { success: false, error: "Failed to activate subscription" };
  }

  return { success: true, email: sub.email, error: null };
}

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/types";
import { sendConfirmationEmail } from "@/lib/email";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Send confirmation email after signup
export async function sendConfirmationServer(
  userId: string,
  email: string,
  confirmationToken: string
): Promise<{ success: boolean; error: string | null }> {
  const baseUrl = process.env.BASE_URL || "http://localhost:8080";
  const confirmationUrl = `${baseUrl}/confirm?token=${confirmationToken}`;

  return sendConfirmationEmail(email, confirmationUrl);
}

// Confirm subscription via token
export async function confirmSubscriptionServer(
  token: string
): Promise<{ success: boolean; error: string | null; email?: string }> {
  const supabase = getAdminClient();

  // Look up subscription by token
  const { data: subscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select("id, user_id, email, status")
    .eq("confirmation_token", token)
    .single();

  if (fetchError || !subscription) {
    return { success: false, error: "Invalid or expired confirmation token" };
  }

  const sub = subscription as unknown as {
    id: string;
    status: string;
    email: string;
  };

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

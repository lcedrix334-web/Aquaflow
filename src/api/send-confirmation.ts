import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/types";
import { sendConfirmationEmail } from "@/lib/email";
import { randomBytes } from "node:crypto";

// API route handler for /api/send-confirmation
// Called by Vite middleware with parsed JSON body — runs ONLY server-side

export default async function handler(data: {
  user_id: string;
  email: string;
}): Promise<{ success: boolean; error: string | null }> {
  const { user_id, email } = data;

  if (!user_id || !email) {
    return { success: false, error: "Missing required fields" };
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  // Check if subscription already exists
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("confirmation_token, status")
    .eq("user_id", user_id)
    .single();

  let token: string;

  if (existing) {
    const row = existing as unknown as { confirmation_token: string; status: string };
    if (row.status === "active") {
      return { success: true, error: null }; // Already active, no email needed
    }
    token = row.confirmation_token;
  } else {
    // Create subscription row with a new token
    token = randomBytes(32).toString("hex");
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id,
        email,
        confirmation_token: token,
        status: "pending",
      } as never);

    if (insertError) {
      console.error("Failed to create subscription:", insertError);
      return { success: false, error: "Failed to create subscription" };
    }
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:8080";
  const confirmationUrl = `${baseUrl}/confirm?token=${token}`;

  return sendConfirmationEmail(email, confirmationUrl);
}

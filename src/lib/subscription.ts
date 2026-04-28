import { supabase } from "@/integrations/client";

export type SubscriptionStatus = "pending" | "active" | "none";

export async function getSubscriptionStatus(
  userId: string
): Promise<{ status: SubscriptionStatus; email: string | null }> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, email")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return { status: "none", email: null };
  }

  const row = data as { status: string; email: string };
  return { status: row.status as SubscriptionStatus, email: row.email };
}

export async function sendConfirmationEmail(
  userId: string,
  email: string,
  confirmationToken: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch("/api/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        email,
        confirmation_token: confirmationToken,
      }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function confirmSubscription(
  token: string
): Promise<{ success: boolean; error: string | null; email?: string }> {
  try {
    const res = await fetch("/api/confirm-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

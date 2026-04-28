import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { confirmSubscription } from "@/lib/subscription";
import { AquaLogo } from "@/components/AquaLogo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/confirm")({
  head: () => ({
    meta: [
      { title: "Confirm Subscription — AquaFlow" },
      {
        name: "description",
        content: "Confirm your AquaFlow subscription.",
      },
    ],
  }),
  validateSearch: (search: Record<string, string>) => ({
    token: search.token ?? "",
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { token } = useSearch({ strict: false }) as { token: string };
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    confirmSubscription(token)
      .then((result) => {
        if (result.success) {
          setStatus("success");
          setEmail(result.email ?? null);
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 starfield" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <AquaLogo size="lg" />
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-water/10">
                <Loader2 className="h-8 w-8 text-water animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Confirming Subscription...
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we activate your AquaFlow subscription.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-leaf/10">
                <CheckCircle2 className="h-8 w-8 text-leaf" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Subscription Activated!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {email
                  ? `Your subscription for ${email} is now active.`
                  : "Your AquaFlow subscription is now active."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Plan: AquaFlow Smart Irrigation — ₱499/month
              </p>
              <div className="mt-6">
                <Link to="/dashboard">
                  <Button variant="hero" size="lg" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Confirmation Failed
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The confirmation link is invalid or has expired. Please check
                your email for a valid link or contact support.
              </p>
              <div className="mt-6">
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full">
                    Go Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

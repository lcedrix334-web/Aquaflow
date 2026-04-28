import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AquaLogo } from "@/components/AquaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — AquaFlow" },
      { name: "description", content: "Create your AquaFlow account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(name, email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Account created! Check your email to confirm your subscription.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 starfield" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <AquaLogo size="lg" />
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8 glow-water">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign up to get started with AquaFlow
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-lg border border-water/20 bg-water/5 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Subscription Notice</p>
              <p>
                By creating an account, you agree to receive a confirmation email for our subscription service. AquaFlow operates on a{" "}
                <span className="font-semibold text-foreground">₱499 monthly plan</span> which includes system automation, monitoring, and maintenance. Subscription activation requires user confirmation via email.
              </p>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-leaf hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

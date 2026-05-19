import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AquaLogo } from "@/components/AquaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — AquaFlow" },
      { name: "description", content: "Login to your AquaFlow dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Changed email → username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    // Changed email → username
    const { error } = await signIn(username, password);

    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Welcome back!");
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

        <div className="glass-card rounded-2xl p-8 glow-leaf">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome Back!
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Login to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            {/* Username field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="px-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPwd
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

              </div>
            </div>

            <Button
              type="submit"
              variant="leaf"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-leaf hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
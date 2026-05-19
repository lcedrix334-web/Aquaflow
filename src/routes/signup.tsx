import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AquaLogo } from "@/components/AquaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — AquaFlow" },
      {
        name: "description",
        content: "Create your AquaFlow account.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users
  if (user) {
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validation
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (username.length < 4) {
      toast.error(
        "Username must contain at least 4 characters"
      );
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must contain at least 6 characters"
      );
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { error } = await signUp(
        firstName,
        lastName,
        username,
        password
      );

      // FIXED ERROR HERE
      if (error) {
        toast.error(error);
        return;
      }

      toast.success(
        "Account created successfully!"
      );

      navigate({
        to: "/dashboard",
      });

    } catch (err) {
      console.error(err);

      toast.error(
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 starfield" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <AquaLogo size="lg" />
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-8 glow-water">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Create Account
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign up to get started with AquaFlow
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(
                      e.target.value
                    )
                  }
                  placeholder="John"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) =>
                    setLastName(
                      e.target.value
                    )
                  }
                  placeholder="Doe"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  placeholder="Choose a username"
                  className="pl-10"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                This username will be used to log in to your dashboard
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="At least 6 characters"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Confirm Password
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) =>
                    setConfirm(
                      e.target.value
                    )
                  }
                  placeholder="Confirm password"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Sign Up"}
            </Button>

          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-leaf hover:underline"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignupPage;
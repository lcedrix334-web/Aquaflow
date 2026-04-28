import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { AquaLogo } from "./AquaLogo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function PublicNav() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <AquaLogo />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/"
              activeProps={{ className: "text-leaf" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard" activeProps={{ className: "text-leaf" }}>
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="leaf" size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

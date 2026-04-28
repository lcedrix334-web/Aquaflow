import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient-leaf-water">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-leaf px-5 text-sm font-medium text-leaf-foreground transition-colors hover:bg-leaf/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AquaFlow — Smart Irrigation for a Greener Tomorrow" },
      {
        name: "description",
        content:
          "AquaFlow is an automated ESP32 irrigation system that delivers the right amount of water at the right time using soil moisture sensors.",
      },
      { name: "author", content: "AquaFlow" },
      { property: "og:title", content: "AquaFlow — Smart Irrigation for a Greener Tomorrow" },
      {
        property: "og:description",
        content:
          "Automated ESP32-based irrigation. Save water, grow healthier plants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AquaFlow — Smart Irrigation for a Greener Tomorrow" },
      { name: "description", content: "AquaFlow Control Hub is a web application for managing and monitoring irrigation systems." },
      { property: "og:description", content: "AquaFlow Control Hub is a web application for managing and monitoring irrigation systems." },
      { name: "twitter:description", content: "AquaFlow Control Hub is a web application for managing and monitoring irrigation systems." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aae2b914-e8e2-4ca4-bb86-fc3186437320/id-preview-6d595bc8--7d1709e1-d201-4602-9701-d1bc70f67a93.lovable.app-1777308122838.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aae2b914-e8e2-4ca4-bb86-fc3186437320/id-preview-6d595bc8--7d1709e1-d201-4602-9701-d1bc70f67a93.lovable.app-1777308122838.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import {
  Leaf,
  Droplet,
  DollarSign,
  Wrench,
  Sprout,
  Cpu,
  GitBranch,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-irrigation.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaFlow — Smart Irrigation for a Greener Tomorrow" },
      {
        name: "description",
        content:
          "Automated ESP32 irrigation system using soil moisture sensors. Save water, grow healthier plants.",
      },
      { property: "og:title", content: "AquaFlow — Smart Irrigation" },
      {
        property: "og:description",
        content:
          "Automated ESP32 irrigation system. Save water, grow healthier plants.",
      },
      { property: "og:image", content: heroImage },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Leaf,
    title: "Smart Automation",
    desc: "Automatically waters your plants based on real-time soil moisture data.",
  },
  {
    icon: Droplet,
    title: "Water Efficient",
    desc: "Reduces water waste by delivering the right amount of water at the right time.",
  },
  {
    icon: DollarSign,
    title: "Low Cost",
    desc: "Built with affordable components for maximum value and efficiency.",
  },
  {
    icon: Wrench,
    title: "Easy to Deploy",
    desc: "Simple to install and use for small farms, gardens, and home setups.",
  },
];

const steps = [
  {
    n: "01",
    title: "Sense",
    icon: Sprout,
    desc: "Soil moisture sensors continuously monitor the soil conditions.",
  },
  {
    n: "02",
    title: "Analyze",
    icon: Cpu,
    desc: "ESP32 analyzes the data and decides the best action to take.",
  },
  {
    n: "03",
    title: "Act",
    icon: GitBranch,
    desc: "Water pump and valve activate to irrigate through drip emitters.",
  },
];

function Home() {
  return (
    <div className="relative min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs font-medium text-leaf">
              <Sprout className="h-3.5 w-3.5" />
              Powered by ESP32 & soil sensors
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl">
              Smart Irrigation.
              <br />
              For a{" "}
              <span className="text-gradient-leaf-water">Greener</span> Tomorrow.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              AquaFlow is an automated irrigation system that uses ESP32 and soil
              moisture sensors to deliver the right amount of water at the right
              time — reducing waste and improving plant health.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-leaf/20 via-transparent to-water/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border/50 glass-card">
              <img
                src={heroImage}
                alt="AquaFlow smart irrigation system with ESP32, soil sensors, and drip emitters watering green plants under a starry sky"
                width={1920}
                height={1080}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Why AquaFlow?
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-leaf" />
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card group rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-leaf/10 text-leaf transition-colors group-hover:bg-leaf/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-water" />
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass-card relative rounded-2xl p-6">
              <div className="text-3xl font-bold text-water/70">{s.n}</div>
              <div className="mt-2 flex items-center gap-2">
                <s.icon className="h-5 w-5 text-leaf" />
                <h3 className="text-xl font-semibold text-foreground">
                  {s.title}
                </h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-4xl px-4 py-20">
        <div className="glass-card relative overflow-hidden rounded-3xl p-10 text-center md:p-14">
          <div className="absolute inset-0 bg-gradient-to-br from-leaf/10 via-transparent to-water/10" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Smarter Irrigation. Healthier Plants. Better Future.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join AquaFlow and take control of your irrigation system today.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-7">
              <Link to="/signup">
                Get Started Now <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AquaFlow — Smart irrigation for a greener tomorrow.
      </footer>
    </div>
  );
}

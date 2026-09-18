import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Clock3,
  Crown,
  Earth,
  MapPin,
  Menu,
  Minus,
  Orbit,
  Plus,
  Radiation,
  Rocket,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import olympusImage from "@/assets/olympus-dome.jpg";
import vallesImage from "@/assets/valles-cruise.jpg";
import elysiumImage from "@/assets/elysium-colony.jpg";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mars 2100 — Luxury Interplanetary Travel" },
      {
        name: "description",
        content: "Design a bespoke Mars journey aboard the finest interplanetary craft of 2100.",
      },
      { property: "og:title", content: "Mars 2100 — Luxury Interplanetary Travel" },
      {
        property: "og:description",
        content: "Your private passage to Mars, designed around you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Mars2100,
});

type Craft = "Standard Shuttle" | "Luxury Cruiser" | "Private Yacht";
type Destination = "Olympus Dome" | "Valles Skyport" | "Elysium Colony";
type Tier = "Panorama Suite" | "Zero-G Penthouse" | "Private Habitat";

type Planner = {
  departure: string;
  craft: Craft;
  destination: Destination;
  travellers: number;
  tier: Tier;
  activities: string[];
};

type Recommendation = {
  destination: Destination;
  craft: Craft;
  tier: Tier;
  activity: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendation?: Recommendation;
};

const destinations = [
  {
    name: "Olympus Dome" as Destination,
    label: "Olympus Dome Resort",
    region: "Tharsis Montes",
    description: "Cliff-edge infinity pools beneath a climate-controlled crystal canopy.",
    image: olympusImage,
    tag: "12 residences left",
    coordinates: "18.65°N · 226.2°E",
  },
  {
    name: "Valles Skyport" as Destination,
    label: "Valles Marineris Sky Cruise",
    region: "Coprates Chasma",
    description: "A silent, three-night aerial passage through the solar system’s grandest canyon.",
    image: vallesImage,
    tag: "Private deck available",
    coordinates: "13.9°S · 59.2°W",
  },
  {
    name: "Elysium Colony" as Destination,
    label: "Elysium VIP Colony",
    region: "Elysium Planitia",
    description: "Private villas, personal rovers and after-hours access to the colony gardens.",
    image: elysiumImage,
    tag: "Members first",
    coordinates: "24.7°N · 150.0°E",
  },
];

const craftOptions: Array<{ name: Craft; days: number; price: number; note: string }> = [
  { name: "Standard Shuttle", days: 74, price: 1.8, note: "Orbital lounge · 12 guests" },
  { name: "Luxury Cruiser", days: 46, price: 4.6, note: "Private suite · 6 guests" },
  { name: "Private Yacht", days: 31, price: 12.8, note: "Fully bespoke · 2–8 guests" },
];

const activities = [
  "Olympus summit flight",
  "Private rover safari",
  "Phobos supper club",
  "Canyon sky cruise",
  "Colony atelier tour",
];

const initialPlanner: Planner = {
  departure: "Singapore Orbital",
  craft: "Luxury Cruiser",
  destination: "Olympus Dome",
  travellers: 2,
  tier: "Panorama Suite",
  activities: ["Olympus summit flight"],
};

const fallbackCraft = {
  name: "Luxury Cruiser" as Craft,
  days: 46,
  price: 4.6,
  note: "Private suite · 6 guests",
};
const fallbackDestination = destinations[0] ?? {
  name: "Olympus Dome" as Destination,
  label: "Olympus Dome Resort",
  region: "Tharsis Montes",
  description: "Cliff-edge infinity pools beneath a climate-controlled crystal canopy.",
  image: olympusImage,
  tag: "12 residences left",
  coordinates: "18.65°N · 226.2°E",
};
const plannerTitles = [
  "Choose Earth departure",
  "Select your vessel",
  "Choose Mars arrival",
  "Define your residence",
  "Curate your experiences",
];

const assistantGreeting: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Welcome aboard. Tell me your budget, preferred pace, dates, and what you want to feel on Mars. I’ll compose a private passage for you.",
};

function Mars2100() {
  const [planner, setPlanner] = useState<Planner>(initialPlanner);
  const [step, setStep] = useState(1);
  const [activeDestination, setActiveDestination] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([assistantGreeting]);
  const [thinking, setThinking] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [countdown, setCountdown] = useState("18:06:42");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("mars-2100-concierge");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length) setChatMessages(parsed);
    } catch {
      window.localStorage.removeItem("mars-2100-concierge");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("mars-2100-concierge", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [chatOpen, thinking]);

  useEffect(() => {
    let seconds = 18 * 3600 + 6 * 60 + 42;
    const timer = window.setInterval(() => {
      seconds = seconds > 0 ? seconds - 1 : 24 * 3600;
      const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const craft = craftOptions.find((item) => item.name === planner.craft) ?? fallbackCraft;
  const activePlace = destinations[activeDestination] ?? fallbackDestination;
  const estimate = useMemo(() => {
    const suiteMultiplier =
      planner.tier === "Private Habitat" ? 2.3 : planner.tier === "Zero-G Penthouse" ? 1.55 : 1;
    return (
      craft.price * planner.travellers * suiteMultiplier +
      planner.activities.length * 0.18
    ).toFixed(1);
  }, [craft.price, planner]);

  const chooseDestination = (index: number) => {
    const destination = destinations[index];
    if (!destination) return;
    setActiveDestination(index);
    setPlanner((current) => ({ ...current, destination: destination.name }));
  };

  const generateRecommendation = (input: string): Recommendation => {
    const value = input.toLowerCase();
    const destination: Destination =
      value.includes("adventure") || value.includes("canyon") || value.includes("cruise")
        ? "Valles Skyport"
        : value.includes("privacy") || value.includes("villa") || value.includes("exclusive")
          ? "Elysium Colony"
          : "Olympus Dome";
    const craftChoice: Craft =
      value.includes("unlimited") || value.includes("private") || value.includes("million")
        ? "Private Yacht"
        : value.includes("budget") || value.includes("value") || value.includes("under 3")
          ? "Standard Shuttle"
          : "Luxury Cruiser";
    const tier: Tier =
      craftChoice === "Private Yacht"
        ? "Private Habitat"
        : value.includes("penthouse")
          ? "Zero-G Penthouse"
          : "Panorama Suite";
    const activity =
      destination === "Valles Skyport"
        ? "Canyon sky cruise"
        : destination === "Elysium Colony"
          ? "Private rover safari"
          : "Olympus summit flight";
    return { destination, craft: craftChoice, tier, activity };
  };

  const askConcierge = ({ text }: { text: string }) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: clean };
    setChatMessages((current) => [...current, userMessage]);
    setThinking(true);
    window.setTimeout(() => {
      const rec = generateRecommendation(clean);
      const response = `I’ve matched your brief to **${rec.destination}** aboard a **${rec.craft}**. I recommend the **${rec.tier}**, with a private ${rec.activity.toLowerCase()}. This pairing balances your desired pace, privacy and experience profile.`;
      setChatMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", text: response, recommendation: rec },
      ]);
      setThinking(false);
    }, 950);
  };

  const applyRecommendation = (rec: Recommendation) => {
    setPlanner((current) => ({
      ...current,
      destination: rec.destination,
      craft: rec.craft,
      tier: rec.tier,
      activities: current.activities.includes(rec.activity)
        ? current.activities
        : [...current.activities, rec.activity],
    }));
    setActiveDestination(destinations.findIndex((item) => item.name === rec.destination));
    setStep(5);
    setChatOpen(false);
    document.querySelector("#planner")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="scanlines starfield min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Mars 2100 home">
            <span className="relative grid size-9 place-items-center rounded-full border border-orange text-orange">
              <span className="size-4 rounded-full bg-orange shadow-[0_0_18px_var(--orange)]" />
              <span className="absolute h-px w-12 rotate-[-18deg] bg-cyan" />
            </span>
            <span className="font-display text-sm font-bold uppercase tracking-[0.22em]">
              Mars <span className="text-cyan">2100</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:flex">
            <a className="transition-colors hover:text-cyan" href="#destinations">
              Destinations
            </a>
            <a className="transition-colors hover:text-cyan" href="#map">
              Mars atlas
            </a>
            <a className="transition-colors hover:text-cyan" href="#planner">
              Journey planner
            </a>
            <a className="transition-colors hover:text-cyan" href="#membership">
              Membership
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              className="hidden uppercase tracking-[0.12em] sm:inline-flex"
              onClick={() =>
                document.querySelector("#planner")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Plan passage <ArrowRight />
            </Button>
            <Button
              className="md:hidden"
              size="icon"
              variant="ghost"
              onClick={() => setMobileNav((value) => !value)}
              aria-label="Toggle navigation"
            >
              {mobileNav ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {mobileNav && (
            <motion.nav
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border bg-background md:hidden"
            >
              <div className="grid gap-4 px-5 py-5 text-sm uppercase">
                <a href="#destinations" onClick={() => setMobileNav(false)}>
                  Destinations
                </a>
                <a href="#map" onClick={() => setMobileNav(false)}>
                  Mars atlas
                </a>
                <a href="#planner" onClick={() => setMobileNav(false)}>
                  Journey planner
                </a>
                <a href="#membership" onClick={() => setMobileNav(false)}>
                  Membership
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        <section className="relative flex min-h-[92vh] items-end overflow-hidden pt-18">
          <img
            src={olympusImage}
            width={1536}
            height={1024}
            alt="Olympus Dome Resort on Mars"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background)_2%,transparent_62%),linear-gradient(90deg,var(--background)_0%,transparent_70%)]" />
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-14 lg:grid-cols-[1fr_360px] lg:px-8 lg:pb-20"
          >
            <div className="max-w-4xl">
              <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">
                <span className="h-px w-10 bg-cyan" />
                Interplanetary passage bureau · Earth year 2100
              </div>
              <h1 className="font-display max-w-4xl text-5xl font-bold uppercase leading-[1.05] md:text-7xl lg:text-[88px]">
                Mars is no longer
                <br />
                <span className="cyan-glow text-cyan">a distant world.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-foreground/75 md:text-lg">
                Private departures. Extraordinary habitats. A personal AI concierge. Your passage
                beyond Earth begins here.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() =>
                    document.querySelector("#destinations")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore Mars <ArrowRight />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setChatOpen(true)}>
                  <Bot /> Ask concierge
                </Button>
              </div>
            </div>
            <div className="hud-panel hud-corners self-end p-5">
              <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>Departure telemetry</span>
                <span className="flex items-center gap-2 text-cyan">
                  <span className="size-1.5 animate-pulse rounded-full bg-cyan" /> Live
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-border">
                {[
                  { label: "Transit", value: `${craft.days} days`, icon: Clock3 },
                  { label: "Gravity", value: "0.38 G", icon: CircleGauge },
                  { label: "Radiation", value: "Nominal", icon: Radiation },
                  { label: "Launch", value: countdown, icon: Rocket },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background/70 p-4">
                    <stat.icon className="mb-5 size-4 text-cyan" />
                    <div className="font-display text-base text-foreground">{stat.value}</div>
                    <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <div className="overflow-hidden border-y border-border bg-secondary/50 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <div className="ticker flex w-max gap-12">
            <span>Earth–Mars corridor clear</span>
            <span className="text-cyan">Helios launch window opens in {countdown}</span>
            <span>Surface conditions nominal</span>
            <span className="text-orange">Olympus residences at 82% allocation</span>
            <span>Earth–Mars corridor clear</span>
            <span className="text-cyan">Helios launch window opens in {countdown}</span>
            <span>Surface conditions nominal</span>
            <span className="text-orange">Olympus residences at 82% allocation</span>
          </div>
        </div>

        <section id="destinations" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <SectionHeading
            index="01"
            eyebrow="Curated destinations"
            title="The finest addresses on Mars"
            copy="Three extraordinary ways to experience the red planet, each reserved in limited numbers."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {destinations.map((destination, index) => (
              <motion.article
                key={destination.name}
                whileHover={{ y: -6 }}
                className={`hud-panel hud-corners group overflow-hidden ${activeDestination === index ? "border-cyan" : ""}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.image}
                    loading="lazy"
                    width={1536}
                    height={1024}
                    alt={destination.label}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
                  <span className="absolute left-4 top-4 border border-orange/60 bg-background/75 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-orange backdrop-blur">
                    {destination.tag}
                  </span>
                  <span className="absolute bottom-4 right-4 font-display text-4xl text-foreground/15">
                    0{index + 1}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan">
                    {destination.region}
                  </div>
                  <h3 className="font-display mt-2 text-lg uppercase">{destination.label}</h3>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-muted-foreground">
                    {destination.description}
                  </p>
                  <Button
                    className="mt-5 w-full justify-between"
                    variant={activeDestination === index ? "default" : "outline"}
                    onClick={() => chooseDestination(index)}
                  >
                    {activeDestination === index ? "Selected" : "View details"}
                    {activeDestination === index ? <Check /> : <ArrowRight />}
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="map" className="border-y border-border bg-secondary/20 py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <SectionHeading
                index="02"
                eyebrow="Orbital atlas"
                title="Touch down where the future lives"
                copy="Select a signal to inspect the region and add it to your passage."
              />
              <div className="hud-panel hud-corners mt-8 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan">
                      Active signal
                    </div>
                    <h3 className="font-display mt-2 text-xl uppercase">{activePlace.label}</h3>
                  </div>
                  <MapPin className="text-orange" />
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {activePlace.description}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-xs">
                  <div>
                    <span className="block text-muted-foreground">Coordinates</span>
                    <span className="mt-1 block text-foreground">{activePlace.coordinates}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Surface link</span>
                    <span className="mt-1 flex items-center gap-2 text-cyan">
                      <span className="size-1.5 rounded-full bg-cyan" /> Stable
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="map-grid hud-panel hud-corners relative min-h-[470px] overflow-hidden">
              <div className="absolute inset-0 grid place-items-center">
                <div className="float-slow relative aspect-square w-[76%] max-w-[430px] rounded-full border border-orange/50 bg-[radial-gradient(circle_at_35%_28%,var(--orange),oklch(0.38_0.14_35)_35%,oklch(0.12_0.04_280)_72%)] shadow-[inset_-35px_-28px_80px_var(--background),0_0_90px_oklch(0.76_0.17_54/18%)]">
                  <div className="absolute inset-[10%] rounded-full border border-cyan/10" />
                  <div className="absolute inset-[22%] rounded-full border border-cyan/10" />
                  {[
                    { top: "22%", left: "31%" },
                    { top: "57%", left: "24%" },
                    { top: "42%", left: "70%" },
                  ].map((point, index) => {
                    const destination = destinations[index];
                    return destination ? (
                      <Button
                        key={destination.name}
                        size="icon"
                        variant={activeDestination === index ? "default" : "outline"}
                        className={`pulse-ring absolute rounded-full ${activeDestination === index ? "scale-110" : ""}`}
                        style={point}
                        onClick={() => chooseDestination(index)}
                        aria-label={`Select ${destination.label}`}
                      >
                        <MapPin />
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="absolute left-4 top-4 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                MARS / SURFACE CARTOGRAPHY / M2100.9
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-cyan">
                <Orbit className="size-3 animate-spin" /> Orbital sync
              </div>
            </div>
          </div>
        </section>

        <section id="planner" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <SectionHeading
            index="03"
            eyebrow="Journey architect"
            title="Compose your private passage"
            copy="Five decisions. One completely bespoke Mars itinerary."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="hud-panel hud-corners p-5 md:p-8">
              <div className="mb-8 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStep(item)}
                    aria-label={`Go to step ${item}`}
                    className={`h-1 flex-1 transition-colors ${item <= step ? "bg-cyan" : "bg-border"}`}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-cyan">
                      Step 0{step} / 05
                    </span>
                    <h3 className="font-display mt-2 text-2xl uppercase">
                      {plannerTitles[step - 1] ?? plannerTitles[0]}
                    </h3>
                  </div>
                  {step === 1 && (
                    <ChoiceGrid
                      values={[
                        "Singapore Orbital",
                        "Dubai Celestial Port",
                        "New York Skyhook",
                        "London Ascension",
                      ]}
                      selected={planner.departure}
                      onSelect={(departure) => setPlanner((p) => ({ ...p, departure }))}
                      icon={Earth}
                    />
                  )}
                  {step === 2 && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {craftOptions.map((option) => (
                        <Button
                          key={option.name}
                          variant={planner.craft === option.name ? "default" : "outline"}
                          className="h-auto min-h-36 flex-col items-start whitespace-normal p-4 text-left"
                          onClick={() => setPlanner((p) => ({ ...p, craft: option.name }))}
                        >
                          <Rocket className="mb-5" />
                          <span className="font-display text-xs uppercase">{option.name}</span>
                          <span className="mt-2 text-[10px] opacity-70">
                            {option.days} days · {option.note}
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                  {step === 3 && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {destinations.map((item, index) => (
                        <Button
                          key={item.name}
                          variant={planner.destination === item.name ? "default" : "outline"}
                          className="h-auto min-h-32 flex-col items-start whitespace-normal p-4 text-left"
                          onClick={() => chooseDestination(index)}
                        >
                          <MapPin className="mb-5" />
                          <span className="font-display text-xs uppercase">{item.name}</span>
                          <span className="mt-2 text-[10px] opacity-70">{item.region}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                  {step === 4 && (
                    <div className="space-y-8">
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <label className="text-xs uppercase tracking-[0.14em]">Travellers</label>
                          <div className="flex items-center gap-3">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                setPlanner((p) => ({
                                  ...p,
                                  travellers: Math.max(1, p.travellers - 1),
                                }))
                              }
                            >
                              <Minus />
                            </Button>
                            <span className="font-display w-6 text-center text-xl">
                              {planner.travellers}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                setPlanner((p) => ({
                                  ...p,
                                  travellers: Math.min(8, p.travellers + 1),
                                }))
                              }
                            >
                              <Plus />
                            </Button>
                          </div>
                        </div>
                        <Slider
                          value={[planner.travellers]}
                          min={1}
                          max={8}
                          step={1}
                          onValueChange={(value) =>
                            setPlanner((p) => ({ ...p, travellers: value[0] ?? p.travellers }))
                          }
                        />
                      </div>
                      <ChoiceGrid
                        values={["Panorama Suite", "Zero-G Penthouse", "Private Habitat"]}
                        selected={planner.tier}
                        onSelect={(tier) => setPlanner((p) => ({ ...p, tier: tier as Tier }))}
                        icon={Crown}
                      />
                    </div>
                  )}
                  {step === 5 && (
                    <div className="flex flex-wrap gap-3">
                      {activities.map((activity) => {
                        const active = planner.activities.includes(activity);
                        return (
                          <Button
                            key={activity}
                            variant={active ? "default" : "outline"}
                            onClick={() =>
                              setPlanner((p) => ({
                                ...p,
                                activities: active
                                  ? p.activities.filter((item) => item !== activity)
                                  : [...p.activities, activity],
                              }))
                            }
                          >
                            {active && <Check />}
                            {activity}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="mt-10 flex justify-between border-t border-border pt-6">
                <Button
                  variant="ghost"
                  disabled={step === 1}
                  onClick={() => setStep((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft /> Back
                </Button>
                {step < 5 ? (
                  <Button onClick={() => setStep((value) => Math.min(5, value + 1))}>
                    Continue <ChevronRight />
                  </Button>
                ) : (
                  <Button onClick={() => setConfirmed(true)}>
                    Review complete <Check />
                  </Button>
                )}
              </div>
            </div>
            <aside className="hud-panel hud-corners h-fit p-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.18em] text-cyan">
                    Live itinerary
                  </span>
                  <h3 className="font-display mt-1 text-lg uppercase">Passage M2100</h3>
                </div>
                <ShieldCheck className="text-cyan" />
              </div>
              <div className="space-y-4 py-5 text-sm">
                {[
                  ["Departure", planner.departure],
                  ["Vessel", planner.craft],
                  ["Destination", planner.destination],
                  ["Guests", `${planner.travellers}`],
                  ["Residence", planner.tier],
                  ["Experiences", `${planner.activities.length} selected`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-5">
                <div className="flex items-end justify-between">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Estimated passage
                  </span>
                  <span className="font-display text-2xl text-cyan">Ξ {estimate}M</span>
                </div>
                <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                  Includes private transfers, Earth-orbit ascent and AI concierge service.
                </p>
              </div>
              <Button className="mt-6 w-full" onClick={() => setConfirmed(true)}>
                Confirm itinerary <ArrowRight />
              </Button>
            </aside>
          </div>
        </section>

        <section id="membership" className="border-y border-border bg-secondary/20 py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              index="04"
              eyebrow="The Ares Circle"
              title="Membership beyond access"
              copy="A private relationship with Mars, limited to 210 members on Earth."
            />
            <div className="mt-12 grid gap-px bg-border md:grid-cols-3">
              {[
                {
                  icon: Crown,
                  title: "Priority passage",
                  text: "First selection across every launch window and residence release.",
                },
                {
                  icon: Bot,
                  title: "Personal AI envoy",
                  text: "A dedicated intelligence that learns how you travel, dine and explore.",
                },
                {
                  icon: Zap,
                  title: "Unlisted Mars",
                  text: "Private colony dinners, closed laboratories and off-chart expeditions.",
                },
              ].map((benefit) => (
                <div key={benefit.title} className="bg-background p-8">
                  <benefit.icon className="mb-10 text-orange" />
                  <h3 className="font-display text-sm uppercase">{benefit.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{benefit.text}</p>
                </div>
              ))}
            </div>
            <div className="hud-panel hud-corners mt-6 flex flex-col items-start justify-between gap-6 p-7 md:flex-row md:items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-orange">
                  By private introduction only
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Request consideration for the 2100 Ares Circle intake. Membership begins at Ξ 800K
                  annually.
                </p>
              </div>
              <Button variant="outline" onClick={() => setChatOpen(true)}>
                Request introduction <ArrowRight />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex-row md:items-center md:justify-between lg:px-8">
        <span>© 2100 Mars Passage Bureau</span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-cyan" /> Earth relay online
        </span>
        <span>Singapore · Luna · Olympus</span>
      </footer>

      <AnimatePresence>
        {confirmed && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-background/90 p-5 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="hud-panel hud-corners w-full max-w-2xl p-7 md:p-10"
            >
              <div className="mb-8 flex items-start justify-between">
                <div className="grid size-14 place-items-center rounded-full border border-cyan text-cyan">
                  <Check className="size-7" />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setConfirmed(false)}
                  aria-label="Close confirmation"
                >
                  <X />
                </Button>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-cyan">
                Itinerary secured · provisional hold 24:00:00
              </span>
              <h2 className="font-display mt-3 text-3xl uppercase md:text-4xl">
                Your path to Mars is ready.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                A private passage aboard the {planner.craft} from {planner.departure} to{" "}
                {planner.destination} has been composed for {planner.travellers}{" "}
                {planner.travellers === 1 ? "traveller" : "travellers"}.
              </p>
              <div className="my-8 grid gap-px bg-border sm:grid-cols-3">
                {[
                  ["Transit", `${craft.days} days`],
                  ["Residence", planner.tier],
                  ["Estimate", `Ξ ${estimate}M`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-background p-4">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                      {label}
                    </span>
                    <span className="mt-2 block font-display text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setConfirmed(false);
                    setChatOpen(true);
                  }}
                >
                  Speak to concierge <Bot />
                </Button>
                <Button variant="outline" onClick={() => setConfirmed(false)}>
                  Return to itinerary
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="hud-panel fixed bottom-24 right-4 z-[65] flex h-[min(650px,75vh)] w-[calc(100%-2rem)] max-w-[430px] flex-col overflow-hidden md:right-6"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full border border-cyan text-cyan">
                  <Orbit className="size-4" />
                </div>
                <div>
                  <div className="font-display text-xs uppercase">Astra concierge</div>
                  <div className="mt-1 flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-cyan">
                    <span className="size-1.5 animate-pulse rounded-full bg-cyan" /> Cognitive link
                    active
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setChatOpen(false)}
                aria-label="Close concierge"
              >
                <X />
              </Button>
            </div>
            <Conversation className="min-h-0">
              <ConversationContent className="gap-5 p-4">
                {chatMessages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent
                      className={
                        message.role === "user" ? "bg-primary text-primary-foreground" : ""
                      }
                    >
                      <MessageResponse>{message.text}</MessageResponse>
                      {message.recommendation && (
                        <Button
                          size="sm"
                          className="mt-3 self-start"
                          onClick={() =>
                            applyRecommendation(message.recommendation as Recommendation)
                          }
                        >
                          Use this recommendation <ArrowRight />
                        </Button>
                      )}
                    </MessageContent>
                  </Message>
                ))}
                {thinking && (
                  <Message from="assistant">
                    <MessageContent>
                      <Shimmer className="text-cyan">Composing your passage...</Shimmer>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            <div className="border-t border-border p-3">
              <PromptInput onSubmit={askConcierge}>
                <PromptInputTextarea
                  ref={inputRef}
                  placeholder="Budget, dates, interests, preferred pace..."
                  className="min-h-20"
                />
                <PromptInputFooter className="justify-between">
                  <span className="text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                    Memory saved on this device
                  </span>
                  <PromptInputSubmit
                    disabled={thinking}
                    status={thinking ? "submitted" : "ready"}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <Button
        className="fixed bottom-6 right-4 z-[66] size-14 rounded-full shadow-[0_0_30px_oklch(0.82_0.145_203/35%)] md:right-6"
        size="icon"
        onClick={() => setChatOpen((value) => !value)}
        aria-label="Toggle Mars travel concierge"
      >
        {chatOpen ? <X /> : <Bot />}
      </Button>
    </div>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  copy,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[90px_1fr_1fr]">
      <div className="font-display text-5xl text-foreground/10">{index}</div>
      <div>
        <div className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-cyan">
          <span className="h-px w-8 bg-cyan" />
          {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-semibold uppercase leading-tight md:text-4xl">
          {title}
        </h2>
      </div>
      <p className="max-w-md self-end text-sm leading-6 text-muted-foreground md:justify-self-end">
        {copy}
      </p>
    </div>
  );
}

function ChoiceGrid({
  values,
  selected,
  onSelect,
  icon: Icon,
}: {
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  icon: typeof Earth;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {values.map((value) => (
        <Button
          key={value}
          variant={selected === value ? "default" : "outline"}
          className="h-20 justify-start px-5"
          onClick={() => onSelect(value)}
        >
          <Icon />
          {value}
          {selected === value && <Check className="ml-auto" />}
        </Button>
      ))}
    </div>
  );
}

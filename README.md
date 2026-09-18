# Mars Odyssey Hub

Build a futuristic single-page web app called "Mars 2100" — a luxury interplanetary travel booking experience for an elite Mars tourism company in the year 2100. This is a hackathon demo, so prioritize visual polish, working interactivity, and a "wow" first impression over backend completeness.

Visual Direction (2100, not "Mars-themed 2024"):
Design a HUD/holographic sci-fi aesthetic — dark space background (deep navy/black with subtle starfield or nebula gradient), glowing cyan/orange/magenta accent lines, glassmorphism panels with neon borders, futuristic sans-serif typography (wide letter-spacing, uppercase headers), subtle scan-line or particle animations, smooth micro-animations on hover/click, and a persistent HUD-style top nav bar. Every section should feel like an interface from a spaceship or orbital station, not a normal travel site.

Required Sections & Features:

Hero / Mars Experience Showcase — A bold landing section introducing Mars tourism in 2100: luxury Mars resorts, Martian cities, orbital space cruises, expeditions, and VIP colony experiences. Use cards or a horizontally scrollable "Explore Destinations" gallery (e.g., Olympus Dome Resort, Valles Marineris Sky Cruise, Elysium VIP Colony) each with an image placeholder, short description, and a "View Details" interaction.

Interactive Journey Planner — A real multi-step planner (not decorative) with actual state/logic:

Step 1: Departure location (Earth city selector)

Step 2: Spacecraft class selection (e.g., Standard Shuttle, Luxury Cruiser, Private Yacht) — shown as selectable cards

Step 3: Destination (Mars city/resort dropdown or map)

Step 4: Number of travellers + accommodation tier (stepper/slider inputs)

Step 5: Optional activities (multi-select chips)

A live summary panel that updates dynamically as choices are made, ending in a "Confirm Itinerary" button that shows a generated summary/confirmation screen.

Luxury / VIP Framing — Weave premium language and features throughout: private tours, bespoke itineraries, personal AI concierge, exclusive/limited-availability badges on packages, a "Premium Membership" tier section. Tone should read as exclusive and high-end, not generic.

Functional AI Feature (must actually work, not just be labeled "AI") — Build an AI Mars Travel Assistant as a chat widget (floating button → expandable chat panel) that:

Takes user input (preferences, budget, travel dates, interests)

Returns a personalized recommendation (destination, spacecraft, itinerary suggestion) using conditional logic or an LLM call

Feeds its recommendation back into the Journey Planner (e.g., a "Use this recommendation" button that pre-fills planner steps)
Use a real API call (e.g., an edge function calling an LLM) if possible; if time is short, implement clear rule-based logic that convincingly simulates personalized recommendations — but it must visibly change output based on user input, not return static text.

Futuristic Interactive Elements — Include at least one interactive planetary/orbital map (Mars regions users can click to explore), an animated data dashboard (e.g., live-feeling stats: travel time, radiation levels, gravity %, temperature, next launch window countdown), and smooth transitions between all interactive states.

Full Interaction Flow — Ensure the user journey is explicitly interactive end to end: Explore → Select → Customize (Planner) → Ask AI → Confirm. No static-only pages — every major section needs a clickable, stateful element.

Technical notes: Single cohesive app, responsive layout, smooth animations (Framer Motion or CSS transitions), realistic placeholder content/images for Mars destinations, and clean component structure so I can quickly extend it during a "surprise challenge" phase mid-hackathon.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9f3c7163-f891-47f3-99ab-3279c1179c0f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

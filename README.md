# 🛒 mealoptim

> **Cook smarter, spend less.** Paste any recipe, compare prices at every supermarket near you, and find the cheapest shopping route — powered by Claude AI.

---

## What it does

**mealoptim** is a React single-page app with four screens:

| Screen | Description |
|---|---|
| **Home** | Paste ingredients, pick a country, choose an optimization mode |
| **Analyzing** | Live step-by-step loading while the AI processes your recipe |
| **Results** | Store cards ranked by cost, time, or best balance — with per-ingredient price breakdown |
| **Map** | Visual route optimizer showing walking/driving times and a Google Maps deep-link |

**1 countries supported** — Greece
Can be scaled to other countries. 

---

## Prerequisites

- **Node.js** v18 or newer — [download](https://nodejs.org)
- **npm** v9 or newer (comes with Node)
- An **Anthropic API key** — [get one here](https://console.anthropic.com/) *(free tier available; the app falls back to realistic mock data if no key is set)*

---

## Setup

### 1 — Scaffold a Vite + React project

Open a terminal and run:

```bash
npm create vite@latest mealoptim -- --template react
cd mealoptim
npm install
```

### 2 — Replace the default component

Copy `App.jsx` into the project, overwriting the generated one:

```bash
# If you're in the project root and App.jsx is on your Desktop:
cp ~/Desktop/App.jsx src/App.jsx
```

Or just open `src/App.jsx` in VS Code and paste the contents in.

### 3 — Add your Anthropic API key

The app calls `https://api.anthropic.com/v1/messages` directly from the browser. You need to add your key to the request headers.

Open `src/App.jsx` and find this block (around line 140):

```js
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  ...
```

Add your API key to the `headers` object:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "sk-ant-YOUR_KEY_HERE",
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
```

> **Note:** Exposing an API key in the browser is fine for local development and personal use. Do **not** deploy this publicly without a backend proxy.

> **No key?** No problem — if the API call fails for any reason, the app automatically falls back to a mock data generator that produces realistic prices and distances.

### 4 — (Optional) Clean up the default styles

Vite ships with some placeholder CSS. You can clear the contents of `src/index.css` and `src/App.css` — the app manages all its own styles inline and via a `<style>` tag.

---

## Running the app

```bash
npm run dev
```

Vite will print something like:

```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Copy the **Local** URL (`http://localhost:5173/`) and open it in your browser.

---

## How to use

1. **Select your country** — tap the flag button in the top-right corner of the home screen.
2. **Name your recipe** *(optional)* — type a title in the first field.
3. **Add ingredients** — paste them one per line, or tap one of the example chips (🍝 Carbonara, 🥘 Stir Fry, 🥑 Avocado Toast, 🍕 Margherita Pizza).
4. **Choose an optimization mode:**
   - **Best Price** — ranks by total cost
   - **Best Balance** — weighs cost and travel time equally
   - **Fastest Trip** — ranks by driving minutes
5. **Tap "Find the Cheapest Prices →"** — watch the animated analysis screen, then see your results.
6. **Tap a store card** to jump to the **Map** screen, switch between destinations, and open directions in Google Maps.

---

## Project structure

```
mealoptim/
├── src/
│   ├── App.jsx        ← the entire application (single file)
│   ├── main.jsx       ← React entry point (unchanged from Vite scaffold)
│   └── index.css      ← can be emptied; all styles are inside App.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 (hooks only — no routing library, no state library) |
| Bundler | Vite |
| AI | Claude (`claude-sonnet-4-20250514`) via Anthropic API |
| Fonts | Google Fonts — Syne, DM Mono, Outfit |
| Styling | Inline styles + a single injected `<style>` tag |
| Maps | SVG-drawn mock map + Google Maps deep-link |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page / console error about `React` | Make sure `main.jsx` imports and renders `<App />` from `./App` |
| CORS error calling the Anthropic API | Add the `"anthropic-dangerous-direct-browser-access": "true"` header (see Step 3) |
| API returns 401 Unauthorized | Double-check your API key — it must start with `sk-ant-` |
| Prices look random / no AI branding | The app is running in **mock mode** — check the API key and headers |
| Port 5173 already in use | Run `npm run dev -- --port 3000` to use a different port |

---

## License

MIT — use freely, modify as you like.

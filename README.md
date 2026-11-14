# ASTRALIS — The Museum of NASA's Silent Missions

ASTRALIS is a local-only, browser-playable space museum adventure by Team Astralis. Explore original Moon and Mars gallery scenes, meet six retired NASA hardware exhibits, listen to their stories, restore their memories through quizzes, and collect passport stamps.

> An independent educational project created by Team Astralis for NASA Space Apps Challenge 2026. Not an official NASA website.

**All exhibit text is DEMO CONTENT awaiting team research.** The starter content uses conservative mission facts and links to official NASA references; it is not a NASA publication and should be reviewed by the team before being treated as final educational material.

## Run locally

Requirements: Node.js 20 or newer and npm.

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 5000
```

Open the Replit web preview on port `5000`. For a production build:

```sh
npm run build
npm run preview
```

The production output is `dist/`. `netlify.toml` includes a build command, publish directory, and SPA fallback redirect for Netlify deployment.

## Controls

- **Desktop:** move with WASD or arrow keys; press E near a display to inspect it.
- **Touch:** use the on-screen direction pad and Inspect button.
- Use the Space Passport control at any time to view Moon and Mars stamp slots.

The Moon gallery is open from the start. Collect all three Moon stamps to unlock travel to Mars. Correct memory answers restore 20 oxygen; incorrect answers use 20. There is no timer or automatic oxygen drain. If oxygen reaches zero, the expedition resets.

## Project layout

- `src/data/exhibits.ts` — editable, data-driven exhibit copy, questions, facts, and NASA sources.
- `src/game/MuseumScene.ts` — Phaser hall, astronaut movement, display art, collision, and proximity interaction.
- `src/game/MuseumCanvas.tsx` — lifecycle-safe React / Phaser integration.
- `src/App.tsx` — welcome, selection, story, quiz, passport, travel, and Legacy Wall flows.
- `src/index.css` — responsive visual system and original CSS illustration styling.

Progress is stored locally in the browser using LocalStorage. There is no backend, account system, analytics service, or paid API.

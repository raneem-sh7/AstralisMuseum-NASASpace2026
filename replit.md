# ASTRALIS on Replit

## Run the app

The main web preview is served by Vite on port 5000. The `Start application`
workflow runs:

```sh
npm run dev -- --host 0.0.0.0 --port 5000
```

For a production build, run `npm run build`; the static output is written to
`dist/`. Netlify settings are in `netlify.toml`.

## Project notes

- React, TypeScript, Tailwind CSS, and Phaser 3; no backend or account setup.
- Game progress is saved in the browser's LocalStorage.
- Replace and verify the clearly marked DEMO exhibit content in
  `src/data/exhibits.ts` when Team Astralis provides its research.
- Desktop movement uses WASD or arrow keys, with E to inspect. Touch devices
  have an on-screen direction pad and Inspect button.

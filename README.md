# UČI AI

iPhone-first Serbian AI school assistant built with React, TypeScript, Vite, PWA and Netlify Functions.

## Pokretanje
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Add `GEMINI_API_KEY` in Netlify Environment Variables.

For user-owned keys, UČI AI can store the key locally in the browser. Such a key is not a server secret and is used against the user's own Gemini quota.

## iPhone
Open the deployed site in Safari → Share → Add to Home Screen.

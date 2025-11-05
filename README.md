# 🎮 Pixel Pac-Man

Pixel Pac-Man is a modern take on the arcade classic, built with Next.js 15, TypeScript, and Tailwind CSS. Guide Pac-Man through a retro-inspired maze, devour every pellet, and outwit the ghosts to rack up a high score that persists between sessions.

## 🚀 Features

- Responsive, Vercel-ready Next.js application using the App Router
- Grid-based Pac-Man engine with pellet tracking, power-ups, and basic ghost AI
- Frightened ghost mode with ghost respawns and eyes-only visuals
- Keyboard controls (Arrow keys / WASD) plus UI buttons for start, pause, and reset
- Local high score persistence stored in `localStorage`
- Stylized retro UI with Tailwind CSS and custom sprites rendered in React

## 🕹️ Controls

- Move: Arrow keys or WASD
- Pause / Resume: Space bar or **Pause** button
- Start / Restart: Space bar or **Start** button
- Reset board: **Reset** button

## 🧩 Gameplay Notes

- Clear every pellet to win the round. Power pellets let you chase ghosts for bonus points.
- Losing a life pauses play briefly before automatically resuming—it costs one of three lives.
- When the score tops your previous best, the high score updates automatically.

## 🛠️ Getting Started

```bash
npm install
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000) to play in development mode. The page supports hot reloading, so code updates appear immediately.

### Build & Lint

```bash
npm run lint
npm run build
```

The build output is optimized for deployment on Vercel.

## 📦 Project Structure

```
src/
  app/
    page.tsx        # Main Pac-Man UI
  lib/
    pacman/         # Game engine, constants, and helpers
```

## 📄 License

Released under the MIT License. Have fun hacking on it!


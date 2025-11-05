"use client";

import useGameEngine from "@/lib/pacman/useGameEngine";
import { LEVEL_DIMENSIONS, TILE_SIZE } from "@/lib/pacman/constants";
import type { GameState, TileType } from "@/lib/pacman/types";

const tileBackground = (tile: TileType) => {
  switch (tile) {
    case "wall":
      return "bg-sky-900/90 border-sky-500/70";
    case "pellet":
    case "power":
      return "bg-slate-950/95 border-slate-800/60";
    default:
      return "bg-slate-950/95 border-slate-900/80";
  }
};

const pacmanRotation: Record<GameState["pacman"]["direction"], number> = {
  up: -90,
  down: 90,
  left: 180,
  right: 0,
};

const statusMessages: Partial<Record<GameState["status"], string>> = {
  ready: "Press Space or Start to Play",
  paused: "Paused",
  "life-lost": "Get Ready",
  gameover: "Game Over",
  victory: "Level Cleared!",
};

export default function Home() {
  const { state, controls } = useGameEngine();

  const boardWidth = LEVEL_DIMENSIONS.width * TILE_SIZE;
  const boardHeight = LEVEL_DIMENSIONS.height * TILE_SIZE;

  const showOverlay = state.status !== "running";
  const overlayMessage = statusMessages[state.status] ?? "";

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-950/95 py-10 text-slate-100">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-yellow-300 drop-shadow-[0_0_16px_rgba(250,224,120,0.45)]">
          Pixel Pac-Man
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Arrow keys or WASD to move · Space to pause/resume
        </p>
      </header>

      <section className="mb-4 flex w-full max-w-xl items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/70 px-6 py-4 shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Score</p>
          <p className="text-2xl font-bold text-yellow-300">{state.score}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">High Score</p>
          <p className="text-xl font-semibold text-slate-100">{state.highScore}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xs uppercase tracking-widest text-slate-400">Lives</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: state.lives }).map((_, index) => {
              const size = 18;
              return (
                <div key={`life-${index}`} className="relative" style={{ width: size, height: size }}>
                  <div
                    className="absolute inset-0 rounded-full bg-yellow-300"
                    style={{
                      clipPath:
                        "polygon(0% 0%, 100% 50%, 0% 100%, 18% 78%, 55% 50%, 18% 22%)",
                      boxShadow: "0 0 6px rgba(255, 214, 76, 0.5)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <main className="relative flex flex-col items-center gap-4">
        <div
          className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4 shadow-2xl"
          style={{ width: boardWidth + 32, height: boardHeight + 32 }}
        >
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${LEVEL_DIMENSIONS.width}, ${TILE_SIZE}px)`,
              width: boardWidth,
              height: boardHeight,
            }}
          >
            {state.tiles.map((row, y) =>
              row.map((tile, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`relative flex items-center justify-center border ${tileBackground(tile)}`}
                  style={{ width: TILE_SIZE, height: TILE_SIZE }}
                >
                  {tile === "pellet" && (
                    <span
                      className="block rounded-full bg-yellow-300 shadow-[0_0_6px_2px_rgba(255,216,76,0.5)]"
                      style={{ width: 6, height: 6 }}
                    />
                  )}
                  {tile === "power" && (
                    <span
                      className="block rounded-full bg-yellow-100 shadow-[0_0_10px_5px_rgba(255,216,76,0.6)]"
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
              )),
            )}

            <div
              className="absolute"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                transform: `translate(${state.pacman.position.x * TILE_SIZE}px, ${state.pacman.position.y * TILE_SIZE}px)`,
                transition: "transform 90ms linear",
              }}
            >
              <div
                className="absolute rounded-full bg-yellow-300"
                style={{
                  width: TILE_SIZE - 6,
                  height: TILE_SIZE - 6,
                  left: 3,
                  top: 3,
                  clipPath:
                    "polygon(0% 0%, 100% 50%, 0% 100%, 18% 78%, 55% 50%, 18% 22%)",
                  transform: `rotate(${pacmanRotation[state.pacman.direction]}deg)` ,
                  transformOrigin: "center",
                  boxShadow: "0 0 12px rgba(255, 214, 76, 0.65)",
                }}
              >
                <div
                  className="absolute rounded-full bg-slate-950"
                  style={{ width: 6, height: 6, top: 4, right: 6 }}
                />
              </div>
            </div>

            {state.ghosts.map((ghost) => (
              <div
                key={ghost.id}
                className="absolute"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  transform: `translate(${ghost.position.x * TILE_SIZE}px, ${ghost.position.y * TILE_SIZE}px)`,
                }}
              >
                <div
                  className="absolute"
                  style={{
                    width: TILE_SIZE - 6,
                    height: TILE_SIZE - 4,
                    left: 3,
                    top: 2,
                    backgroundColor: ghost.eyesOnly ? "#f1f5f9" : ghost.color,
                    borderRadius: "60% 60% 25% 25%",
                    boxShadow: ghost.eyesOnly
                      ? "0 0 8px rgba(148, 163, 184, 0.7)"
                      : `0 0 14px ${ghost.color}aa`,
                  }}
                >
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 pb-[2px]">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-3 rounded-t-full bg-slate-950/80"
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                    <span
                      className="rounded-full"
                      style={{
                        width: 7,
                        height: 7,
                        backgroundColor: ghost.eyesOnly ? "#1e293b" : "#fff",
                      }}
                    />
                    <span
                      className="rounded-full"
                      style={{
                        width: 7,
                        height: 7,
                        backgroundColor: ghost.eyesOnly ? "#1e293b" : "#fff",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showOverlay && overlayMessage && (
            <div className="absolute inset-4 flex items-center justify-center rounded-2xl bg-slate-950/70 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-2xl font-semibold text-yellow-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.6)]">
                  {overlayMessage}
                </p>
                {state.status === "gameover" && (
                  <button
                    type="button"
                    className="mt-4 rounded-full border border-yellow-300/60 px-6 py-2 text-sm font-medium text-yellow-300 transition hover:border-yellow-200 hover:text-yellow-200"
                    onClick={controls.reset}
                  >
                    Try Again
                  </button>
                )}
                {state.status === "victory" && (
                  <button
                    type="button"
                    className="mt-4 rounded-full border border-emerald-300/70 px-6 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-200 hover:text-emerald-200"
                    onClick={controls.start}
                  >
                    Next Round
                  </button>
                )}
                {state.status === "ready" && (
                  <button
                    type="button"
                    className="mt-4 rounded-full border border-yellow-300/70 px-6 py-2 text-sm font-medium text-yellow-300 transition hover:border-yellow-200 hover:text-yellow-200"
                    onClick={controls.start}
                  >
                    Start Game
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-yellow-300 hover:text-yellow-200"
            onClick={controls.start}
          >
            {state.status === "running" ? "Restart" : "Start"}
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:text-slate-100"
            onClick={controls.togglePause}
          >
            {state.status === "paused" ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            className="rounded-full border border-red-600/70 px-5 py-2 text-sm font-semibold text-red-300 transition hover:border-red-400 hover:text-red-200"
            onClick={controls.reset}
          >
            Reset
          </button>
        </div>
      </main>

      <footer className="mt-8 w-full max-w-xl rounded-xl border border-slate-800/70 bg-slate-900/70 px-6 py-4 text-sm text-slate-300">
        <p>
          Chomp every pellet to complete the maze. Power pellets turn ghosts blue so you can
          chase them down for bonus points. Keep an eye on your lives and stay nimble!
        </p>
      </footer>
    </div>
  );
}


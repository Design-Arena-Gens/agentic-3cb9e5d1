export type TileType = "wall" | "pellet" | "power" | "empty";

export interface Vector2 {
  x: number;
  y: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface PacmanState {
  position: Vector2;
  direction: Direction;
  queuedDirection: Direction;
  speed: number;
}

export interface GhostState {
  id: string;
  name: string;
  color: string;
  position: Vector2;
  startPosition: Vector2;
  direction: Direction;
  scatterTarget: Vector2;
  mode: "chase" | "frightened" | "returning";
  frightTicksRemaining: number;
  speed: number;
  eyesOnly: boolean;
}

export interface GameState {
  tiles: TileType[][];
  pacman: PacmanState;
  ghosts: GhostState[];
  score: number;
  highScore: number;
  lives: number;
  pelletsRemaining: number;
  level: number;
  status: "ready" | "running" | "paused" | "life-lost" | "gameover" | "victory";
  respawnTicks: number;
}

export interface GameControls {
  start: () => void;
  togglePause: () => void;
  reset: () => void;
}

export interface GameEngine {
  state: GameState;
  controls: GameControls;
}

import type { Direction, TileType, Vector2 } from "./types";

const RAW_MAZE = [
  "###################",
  "#o....#.....#....o#",
  "#.###.#.###.#.###.#",
  "#.#...#.....#...#.#",
  "#.#.###.###.###.#.#",
  "#.#...........#.#.#",
  "#.#.###.#.#.###.#.#",
  "#.....#.#.#.#.....#",
  "###.#.#.#.#.#.#.###",
  "#...#.#.....#.#...#",
  "#.#.#.###.###.#.#.#",
  "#.#.#.#   #.#.#.#.#",
  "#.#.#.#.#.#.#.#.#.#",
  "#........G........#",
  "###.###.#.#.###.###",
  "#o....#.....#....o#",
  "###################",
];

export const PACMAN_START: Vector2 = { x: 9, y: 13 };

export const GHOST_STARTS: Vector2[] = [
  { x: 8, y: 11 },
  { x: 9, y: 11 },
  { x: 9, y: 9 },
  { x: 9, y: 10 },
];

const CLEAR_POSITIONS: Vector2[] = [PACMAN_START, ...GHOST_STARTS];

export const DIRECTIONS: Record<Direction, Vector2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const TICK_INTERVAL_MS = 110;
export const FRIGHTENED_TICKS = 55;
export const RESPAWN_DELAY_TICKS = 12;

export const PELLET_SCORE = 10;
export const POWER_PELLET_SCORE = 50;
export const GHOST_EATEN_SCORE = 200;

export const TILE_SIZE = 26;

export interface LevelBlueprint {
  tiles: TileType[][];
  pacmanStart: Vector2;
  ghostStarts: Vector2[];
  pellets: number;
}

const tileFromChar = (char: string): TileType => {
  switch (char) {
    case "#":
      return "wall";
    case ".":
      return "pellet";
    case "o":
      return "power";
    default:
      return "empty";
  }
};

export const createLevelBlueprint = (): LevelBlueprint => {
  const tiles: TileType[][] = RAW_MAZE.map((row) => [...row].map(tileFromChar));

  let pellets = 0;
  tiles.forEach((row) => {
    row.forEach((tile) => {
      if (tile === "pellet" || tile === "power") {
        pellets += 1;
      }
    });
  });

  CLEAR_POSITIONS.forEach(({ x, y }) => {
    if (tiles[y]) {
      if (tiles[y][x] === "pellet" || tiles[y][x] === "power") {
        pellets -= 1;
      }
      tiles[y][x] = "empty";
    }
  });

  return {
    tiles,
    pacmanStart: PACMAN_START,
    ghostStarts: GHOST_STARTS,
    pellets,
  };
};

export const GHOST_PRESETS = [
  {
    id: "blinky",
    name: "Blinky",
    color: "#ff3c3c",
    scatterTarget: { x: RAW_MAZE[0].length - 2, y: 1 },
  },
  {
    id: "pinky",
    name: "Pinky",
    color: "#ff9bff",
    scatterTarget: { x: 1, y: 1 },
  },
  {
    id: "inky",
    name: "Inky",
    color: "#4effff",
    scatterTarget: { x: RAW_MAZE[0].length - 2, y: RAW_MAZE.length - 2 },
  },
  {
    id: "clyde",
    name: "Clyde",
    color: "#ffb852",
    scatterTarget: { x: 1, y: RAW_MAZE.length - 2 },
  },
];

export const LEVEL_DIMENSIONS = {
  width: RAW_MAZE[0].length,
  height: RAW_MAZE.length,
};

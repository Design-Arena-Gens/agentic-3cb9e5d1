import { useCallback, useEffect, useState } from "react";

import {
  FRIGHTENED_TICKS,
  GHOST_EATEN_SCORE,
  GHOST_PRESETS,
  GHOST_STARTS,
  OPPOSITE_DIRECTION,
  PACMAN_START,
  PELLET_SCORE,
  POWER_PELLET_SCORE,
  RESPAWN_DELAY_TICKS,
  TICK_INTERVAL_MS,
  createLevelBlueprint,
} from "./constants";
import type {
  Direction,
  GameEngine,
  GameState,
  GhostState,
  PacmanState,
} from "./types";
import { canMove, cloneTiles, samePosition, translate } from "./utils";

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  W: "up",
  A: "left",
  S: "down",
  D: "right",
};

const ALL_DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

const buildPacmanState = (start: { x: number; y: number }): PacmanState => ({
  position: { ...start },
  direction: "left",
  queuedDirection: "left",
  speed: 1,
});

const buildGhostState = (index: number, start: { x: number; y: number }): GhostState => {
  const preset = GHOST_PRESETS[index % GHOST_PRESETS.length];
  return {
    id: preset.id,
    name: preset.name,
    color: preset.color,
    position: { ...start },
    startPosition: { ...start },
    direction: "left",
    scatterTarget: { ...preset.scatterTarget },
    mode: "chase",
    frightTicksRemaining: 0,
    speed: 1,
    eyesOnly: false,
  };
};

const createInitialState = (highScore = 0): GameState => {
  const blueprint = createLevelBlueprint();
  return {
    tiles: blueprint.tiles.map((row) => [...row]),
    pacman: buildPacmanState(blueprint.pacmanStart),
    ghosts: blueprint.ghostStarts.map((start, index) =>
      buildGhostState(index, start),
    ),
    score: 0,
    highScore,
    lives: 3,
    pelletsRemaining: blueprint.pellets,
    level: 1,
    status: "ready",
    respawnTicks: 0,
  };
};

const resetActorsToStart = (state: GameState): GameState => {
  const pacman = {
    ...state.pacman,
    position: { ...PACMAN_START },
    direction: "left" as Direction,
    queuedDirection: "left" as Direction,
  };

  const ghosts = state.ghosts.map((ghost, index) => ({
    ...ghost,
    position: { ...GHOST_STARTS[index % GHOST_STARTS.length] },
    direction: "left" as Direction,
    mode: "chase" as GhostState["mode"],
    frightTicksRemaining: 0,
    eyesOnly: false,
  }));

  return { ...state, pacman, ghosts };
};

const chooseDirectionToward = (
  ghost: GhostState,
  target: { x: number; y: number },
  options: Direction[],
): Direction => {
  let chosen = options[0];
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const direction of options) {
    const maybe = translate(ghost.position, direction);
    const distance = Math.abs(maybe.x - target.x) + Math.abs(maybe.y - target.y);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      chosen = direction;
    }
  }

  return chosen;
};

const pickGhostDirection = (
  ghost: GhostState,
  pacman: PacmanState,
  tiles: GameState["tiles"],
): Direction => {
  const possible = ALL_DIRECTIONS.filter((direction) =>
    canMove(tiles, ghost.position, direction),
  );

  if (!possible.length) {
    return ghost.direction;
  }

  const nonReverse = possible.filter(
    (direction) => direction !== OPPOSITE_DIRECTION[ghost.direction],
  );
  const options = nonReverse.length ? nonReverse : possible;

  if (ghost.mode === "returning") {
    return chooseDirectionToward(ghost, ghost.startPosition, options);
  }

  if (ghost.mode === "frightened") {
    return options[Math.floor(Math.random() * options.length)];
  }

  const pursueTarget = Math.random() < 0.7 ? pacman.position : ghost.scatterTarget;
  return chooseDirectionToward(ghost, pursueTarget, options);
};

const advanceGhost = (
  ghost: GhostState,
  pacman: PacmanState,
  tiles: GameState["tiles"],
  frightenedTriggered: boolean,
): GhostState => {
  const next: GhostState = { ...ghost };

  if (frightenedTriggered && next.mode !== "returning") {
    next.mode = "frightened";
    next.frightTicksRemaining = FRIGHTENED_TICKS;
    next.eyesOnly = false;
  } else if (next.mode === "frightened" && next.frightTicksRemaining > 0) {
    next.frightTicksRemaining -= 1;
    if (next.frightTicksRemaining === 0) {
      next.mode = "chase";
    }
  }

  if (next.mode === "returning" && samePosition(next.position, next.startPosition)) {
    next.mode = "chase";
    next.eyesOnly = false;
  }

  const direction = pickGhostDirection(next, pacman, tiles);
  next.direction = direction;
  next.position = translate(next.position, direction);

  if (next.mode === "returning" && samePosition(next.position, next.startPosition)) {
    next.mode = "chase";
    next.eyesOnly = false;
  }

  return next;
};

const detectCollision = (pacman: PacmanState, ghost: GhostState) =>
  samePosition(pacman.position, ghost.position);

const useGameEngine = (): GameEngine => {
  const [state, setState] = useState<GameState>(() => {
    const stored =
      typeof window !== "undefined"
        ? Number.parseInt(window.localStorage.getItem("pacman-high-score") ?? "", 10)
        : 0;
    const initialHighScore = Number.isNaN(stored) ? 0 : stored;
    return createInitialState(initialHighScore);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("pacman-high-score", `${state.highScore}`);
  }, [state.highScore]);

  const stepGame = useCallback((previous: GameState): GameState => {
    if (previous.status === "paused" || previous.status === "ready") {
      return previous;
    }

    if (previous.status === "life-lost") {
      if (previous.respawnTicks > 1) {
        return { ...previous, respawnTicks: previous.respawnTicks - 1 };
      }
      return { ...previous, status: "running", respawnTicks: 0 };
    }

    if (previous.status !== "running") {
      return previous;
    }

    const tiles = cloneTiles(previous.tiles);
    const pacman: PacmanState = {
      ...previous.pacman,
      position: { ...previous.pacman.position },
    };

    if (canMove(tiles, pacman.position, pacman.queuedDirection)) {
      pacman.direction = pacman.queuedDirection;
    }

    if (canMove(tiles, pacman.position, pacman.direction)) {
      pacman.position = translate(pacman.position, pacman.direction);
    }

    let score = previous.score;
    let pelletsRemaining = previous.pelletsRemaining;
    let frightenedTriggered = false;

    const occupyingTile = tiles[pacman.position.y][pacman.position.x];
    if (occupyingTile === "pellet") {
      tiles[pacman.position.y][pacman.position.x] = "empty";
      score += PELLET_SCORE;
      pelletsRemaining -= 1;
    } else if (occupyingTile === "power") {
      tiles[pacman.position.y][pacman.position.x] = "empty";
      score += POWER_PELLET_SCORE;
      pelletsRemaining -= 1;
      frightenedTriggered = true;
    }

    let highScore = Math.max(previous.highScore, score);
    let lives = previous.lives;
    let status: GameState["status"] = previous.status;
    let respawnTicks = previous.respawnTicks;
    let lifeLost = false;

    const ghostsBeforeMove = previous.ghosts.map((ghost) => ({ ...ghost }));

    const handleGhostCollision = (ghost: GhostState, index: number, ghostArray: GhostState[]) => {
      if (ghost.mode === "frightened") {
        score += GHOST_EATEN_SCORE;
        highScore = Math.max(highScore, score);
        ghostArray[index] = {
          ...ghost,
          mode: "returning",
          frightTicksRemaining: 0,
          eyesOnly: true,
          position: { ...pacman.position },
        };
        return;
      }

      if (ghost.mode === "returning") {
        return;
      }

      if (!lifeLost) {
        lives -= 1;
        status = lives <= 0 ? "gameover" : "life-lost";
        respawnTicks = lives <= 0 ? 0 : RESPAWN_DELAY_TICKS;
        lifeLost = true;
      }
    };

    ghostsBeforeMove.forEach((ghost, index, array) => {
      if (detectCollision(pacman, ghost)) {
        handleGhostCollision(ghost, index, array);
      }
    });

    if (lifeLost) {
      const resetState = resetActorsToStart({
        ...previous,
        tiles,
        pacman,
        ghosts: ghostsBeforeMove,
        score,
        highScore,
        pelletsRemaining,
        lives,
        status,
        respawnTicks,
      });
      return resetState;
    }

    const movedGhosts = ghostsBeforeMove.map((ghost) =>
      advanceGhost(ghost, pacman, tiles, frightenedTriggered),
    );

    movedGhosts.forEach((ghost, index, array) => {
      if (detectCollision(pacman, ghost)) {
        handleGhostCollision(ghost, index, array);
      }
    });

    if (lifeLost) {
      const resetState = resetActorsToStart({
        ...previous,
        tiles,
        pacman,
        ghosts: movedGhosts,
        score,
        highScore,
        pelletsRemaining,
        lives,
        status,
        respawnTicks,
      });
      return resetState;
    }

    if (pelletsRemaining <= 0) {
      status = "victory";
    }

    return {
      ...previous,
      tiles,
      pacman,
      ghosts: movedGhosts,
      score,
      highScore,
      pelletsRemaining,
      lives,
      status,
      respawnTicks,
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setInterval(() => {
      setState(stepGame);
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [stepGame]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const direction = KEY_MAP[event.key];
      if (direction) {
        event.preventDefault();
        setState((previous) => ({
          ...previous,
          pacman: { ...previous.pacman, queuedDirection: direction },
        }));
        return;
      }

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        setState((previous) => {
          if (previous.status === "ready" || previous.status === "victory") {
            return { ...createInitialState(previous.highScore), status: "running" };
          }
          if (previous.status === "gameover") {
            return createInitialState(previous.highScore);
          }
          if (previous.status === "paused") {
            return { ...previous, status: "running" };
          }
          if (previous.status === "running") {
            return { ...previous, status: "paused" };
          }
          return previous;
        });
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const start = useCallback(() => {
    setState((previous) => {
      if (previous.status === "ready") {
        return { ...previous, status: "running" };
      }
      if (previous.status === "victory" || previous.status === "gameover") {
        const fresh = createInitialState(previous.highScore);
        return { ...fresh, status: "running" };
      }
      return previous;
    });
  }, []);

  const togglePause = useCallback(() => {
    setState((previous) => {
      if (previous.status === "running") {
        return { ...previous, status: "paused" };
      }
      if (previous.status === "paused") {
        return { ...previous, status: "running" };
      }
      return previous;
    });
  }, []);

  const reset = useCallback(() => {
    setState((previous) => createInitialState(previous.highScore));
  }, []);

  return {
    state,
    controls: {
      start,
      togglePause,
      reset,
    },
  };
};

export default useGameEngine;

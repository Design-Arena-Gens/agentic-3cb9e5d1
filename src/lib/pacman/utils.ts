import { DIRECTIONS, LEVEL_DIMENSIONS } from "./constants";
import type { Direction, TileType, Vector2 } from "./types";

export const withinBounds = (position: Vector2) =>
  position.x >= 0 &&
  position.x < LEVEL_DIMENSIONS.width &&
  position.y >= 0 &&
  position.y < LEVEL_DIMENSIONS.height;

export const wrapPosition = ({ x, y }: Vector2): Vector2 => {
  let newX = x;
  if (x < 0) newX = LEVEL_DIMENSIONS.width - 1;
  if (x >= LEVEL_DIMENSIONS.width) newX = 0;
  return { x: newX, y };
};

export const translate = (position: Vector2, direction: Direction): Vector2 => {
  const delta = DIRECTIONS[direction];
  return wrapPosition({ x: position.x + delta.x, y: position.y + delta.y });
};

export const isWall = (tiles: TileType[][], position: Vector2) => {
  const { x, y } = position;
  if (!withinBounds(position)) return true;
  return tiles[y][x] === "wall";
};

export const canMove = (
  tiles: TileType[][],
  position: Vector2,
  direction: Direction,
) => {
  const next = translate(position, direction);
  if (!withinBounds(next)) {
    return false;
  }
  return !isWall(tiles, next);
};

export const manhattan = (a: Vector2, b: Vector2) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const cloneTiles = (tiles: TileType[][]) =>
  tiles.map((row) => [...row]);

export const samePosition = (a: Vector2, b: Vector2) =>
  a.x === b.x && a.y === b.y;


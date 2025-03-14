import { BoardPosition } from "./types";

export const COLUMNS = "abcdefghi".split("");

export const START_POSITION_OBJECT: BoardPosition = {
  a10: "bR",
  b10: "bN",
  c10: "bB",
  d10: "bA",
  e10: "bK",
  f10: "bA",
  g10: "bB",
  h10: "bN",
  i10: "bR",
  b8: "bC",
  h8: "bC",
  a7: "bP",
  c7: "bP",
  e7: "bP",
  g7: "bP",
  i7: "bP",
  a1: "wR",
  b1: "wN",
  c1: "wB",
  d1: "wA",
  e1: "wK",
  f1: "wA",
  g1: "wB",
  h1: "wN",
  i1: "wR",
  b3: "wC",
  h3: "wC",
  a4: "wP",
  c4: "wP",
  e4: "wP",
  g4: "wP",
  i4: "wP",
};

export const WHITE_COLUMN_VALUES: { [col in string]: number } = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
  i: 8,
};
export const BLACK_COLUMN_VALUES: { [col in string]: number } = {
  a: 8,
  b: 7,
  c: 6,
  d: 5,
  e: 4,
  f: 3,
  g: 2,
  h: 1,
  i: 0,
};

export const WHITE_ROWS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
export const BLACK_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

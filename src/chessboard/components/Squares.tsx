import { useState } from "react";
import { COLUMNS } from "../consts";
import { useChessboard } from "../context/chessboard-context";
import { Coords, Piece as Pc, Square as Sq } from "../types";
import { Notation } from "./Notation";
import { Piece } from "./Piece";
import { Square } from "./Square";

export function Squares() {
  const [squares, setSquares] = useState<{ [square in Sq]?: Coords }>({});

  const {
    boardOrientation,
    boardWidth,
    currentPosition,
    id,
    showBoardNotation,
    boardBackground,
  } = useChessboard();

  return (
    <div
      data-boardid={id}
      style={{
        backgroundImage: `url(${boardBackground})`,
        backgroundSize: "contain", // Ensures full stretch
        flexWrap: "nowrap",
        width: (boardWidth / 8) * 9,
      }}
    >
      {[...Array(10)].map((_, r) => {
        return (
          <div
            key={r.toString()}
            style={{
              display: "flex",
              flexWrap: "nowrap",
              width: (boardWidth / 8) * 9,
            }}
          >
            {[...Array(9)].map((_, c) => {
              const square =
                boardOrientation === "black"
                  ? ((COLUMNS[8 - c] + (r + 1)) as Sq)
                  : ((COLUMNS[c] + (10 - r)) as Sq);
              return (
                <Square
                  key={`${c}${r}`}
                  square={square}
                  setSquares={setSquares}
                >
                  {currentPosition[square] && (
                    <Piece
                      piece={currentPosition[square] as Pc}
                      square={square}
                      squares={squares}
                    />
                  )}
                  {showBoardNotation && <Notation row={r} col={c} />}
                </Square>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

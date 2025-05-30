import {useRef, useEffect, createContext} from "react";
import { Squares } from "./Squares";
import { Arrows } from "./Arrows";
import { useChessboard } from "../context/chessboard-context";
import { WhiteKing } from "./ErrorBoundary";

export function Board() {
  const boardRef = useRef<HTMLDivElement>(null);
  const { boardWidth, clearCurrentRightClickDown, customBoardStyle } =
    useChessboard();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        boardRef.current &&
        !boardRef.current.contains(event.target as Node)
      ) {
        clearCurrentRightClickDown();
      }
    }

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, []);

  return boardWidth ? (
    <div style={{ perspective: "1000px" }}>
      <div
        ref={boardRef}
        style={{
          position: "relative",
          ...boardStyles(boardWidth),
          ...customBoardStyle,
        }}
      >
        <Squares />
        <Arrows />
      </div>
    </div>
  ) : (
    <WhiteKing />
  );
}

const boardStyles = (width: number) => ({
  cursor: "default",
  height: (width / 8) * 10,
  width: (width / 8) * 9,
});

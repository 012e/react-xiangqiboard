import { COLUMNS } from "../consts";
import { useChessboard } from "../context/chessboard-context";

type NotationProps = {
  row: number;
  col: number;
};

export function Notation({ row, col }: NotationProps) {
  const {
    boardOrientation,
    boardWidth,
    customDarkSquareStyle,
    customLightSquareStyle,
    customNotationStyle,
  } = useChessboard();

  const whiteColor = customLightSquareStyle.backgroundColor;
  const blackColor = customDarkSquareStyle.backgroundColor;

  const isRow = col === 0;
  const isColumn = row === 9; // Updated for Xiangqi (last row is 9, not 7)
  const isBottomLeftSquare = isRow && isColumn;

  function getRow() {
    return boardOrientation === "white" ? 10 - row : row + 1; // Xiangqi has 10 ranks
  }

  function getColumn() {
    return boardOrientation === "black" ? COLUMNS[8 - col] : COLUMNS[col]; // 9 columns
  }

  function renderBottomLeft() {
    return (
      <>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...numericStyle(boardWidth, customNotationStyle),
          }}
        >
          {getRow()}
        </div>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...alphaStyle(boardWidth, customNotationStyle),
          }}
        >
          {getColumn()}
        </div>
      </>
    );
  }

  function renderLetters() {
    return (
      <div
        style={{
          userSelect: "none",
          zIndex: 3,
          position: "absolute",
          ...{ color: col % 2 !== 0 ? blackColor : whiteColor },
          ...alphaStyle(boardWidth, customNotationStyle),
        }}
      >
        {getColumn()}
      </div>
    );
  }

  function renderNumbers() {
    return (
      <div
        style={{
          userSelect: "none",
          zIndex: 3,
          position: "absolute",
          ...(boardOrientation === "black"
            ? { color: row % 2 === 0 ? blackColor : whiteColor }
            : { color: row % 2 === 0 ? blackColor : whiteColor }),
          ...numericStyle(boardWidth, customNotationStyle),
        }}
      >
        {getRow()}
      </div>
    );
  }

  if (isBottomLeftSquare) {
    return renderBottomLeft();
  }

  if (isColumn) {
    return renderLetters();
  }

  if (isRow) {
    return renderNumbers();
  }

  return null;
}

const alphaStyle = (width: number, customNotationStyle?: Record<string, string | number>) => ({
  alignSelf: "flex-end",
  paddingLeft: width / 9 - width / 48, // Updated for 9 columns
  fontSize: width / 48,
  ...customNotationStyle
});

const numericStyle = (width: number, customNotationStyle?: Record<string, string | number>) => ({
  alignSelf: "flex-start",
  paddingRight: width / 9 - width / 48, // Updated for 9 columns
  fontSize: width / 48,
  ...customNotationStyle
});


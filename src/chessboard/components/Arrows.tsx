import { Fragment } from "react";
import { getRelativeCoords } from "../functions";
import { useChessboard } from "../context/chessboard-context";
import { Arrow } from "../types";

export const Arrows = () => {
  const {
    arrows,
    newArrow,
    boardOrientation,
    boardWidth,
    customArrowColor: primaryArrowColor,
  } = useChessboard();
  
  const arrowsList = [...arrows, newArrow].filter(Boolean) as Arrow[];
  
  return (
    <svg
      width={boardWidth}
      height={boardWidth}
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        pointerEvents: "none",
        zIndex: "10",
      }}
    >
      {arrowsList.map((arrow, i) => {
        const [arrowStartField, arrowEndField, arrowColor] = arrow;
        if (arrowStartField === arrowEndField) return null;
        
        const from = getRelativeCoords(
          boardOrientation,
          boardWidth,
          arrowStartField
        );
        
        const to = getRelativeCoords(
          boardOrientation,
          boardWidth,
          arrowEndField
        );
        
        // Adjust length reducer based on xiangqi board size
        // Xiangqi is typically 9×10 while chess is 8×8
        let ARROW_LENGTH_REDUCER = boardWidth / 36;
        const isArrowActive = i === arrows.length;
        
        // If there are different arrows targeting the same square, make their length a bit shorter
        if (
          arrows.some(
            (restArrow) =>
              restArrow[0] !== arrowStartField && restArrow[1] === arrowEndField
          ) &&
          !isArrowActive
        ) {
          ARROW_LENGTH_REDUCER = boardWidth / 18;
        }
        
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const r = Math.hypot(dy, dx);
        
        const end = {
          x: from.x + (dx * (r - ARROW_LENGTH_REDUCER)) / r,
          y: from.y + (dy * (r - ARROW_LENGTH_REDUCER)) / r,
        };
        
        return (
          <Fragment
            key={`${arrowStartField}-${arrowEndField}${
              isArrowActive ? "-active" : ""
            }`}
          >
            <marker
              id={`arrowhead-${i}`}
              markerWidth="2"
              markerHeight="2.5"
              refX="1.25"
              refY="1.25"
              orient="auto"
            >
              <polygon
                points="0.3 0, 2 1.25, 0.3 2.5"
                fill={arrowColor ?? primaryArrowColor}
              />
            </marker>
            <line
              x1={from.x}
              y1={from.y}
              x2={end.x}
              y2={end.y}
              opacity={isArrowActive ? "0.5" : "0.65"}
              stroke={arrowColor ?? primaryArrowColor}
              strokeWidth={
                isArrowActive ? (0.9 * boardWidth) / 45 : boardWidth / 45
              }
              markerEnd={`url(#arrowhead-${i})`}
            />
          </Fragment>
        );
      })}
    </svg>
  );
};

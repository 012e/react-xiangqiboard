import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { defaultPieces } from "../media/pieces";
import {
  convertPositionToObject,
  getPositionDifferences,
  isDifferentFromStart,
} from "../functions";
import {
  BoardPosition,
  ChessboardProps,
  CustomPieces,
  Piece,
  Square,
  Arrow,
} from "../types";

import { useArrows } from "../hooks/useArrows";

interface ChessboardProviderProps extends ChessboardProps {
  boardWidth: number;
  children: ReactNode;
  myStyleBoard?: string;
}

type RequiredChessboardProps = Required<ChessboardProps>;

interface ChessboardProviderContext {
  // Props from user
  allowDragOutsideBoard: RequiredChessboardProps["allowDragOutsideBoard"];
  animationDuration: RequiredChessboardProps["animationDuration"];
  arePiecesDraggable: RequiredChessboardProps["arePiecesDraggable"];
  boardOrientation: RequiredChessboardProps["boardOrientation"];
  boardWidth: RequiredChessboardProps["boardWidth"];
  customArrowColor: RequiredChessboardProps["customArrowColor"];
  customBoardStyle: ChessboardProps["customBoardStyle"];
  customNotationStyle: ChessboardProps["customNotationStyle"];
  customDarkSquareStyle: RequiredChessboardProps["customDarkSquareStyle"];
  customDropSquareStyle: RequiredChessboardProps["customDropSquareStyle"];
  customLightSquareStyle: RequiredChessboardProps["customLightSquareStyle"];
  customSquare: RequiredChessboardProps["customSquare"];
  customSquareStyles: ChessboardProps["customSquareStyles"];
  dropOffBoardAction: ChessboardProps["dropOffBoardAction"];
  id: RequiredChessboardProps["id"];
  isDraggablePiece: RequiredChessboardProps["isDraggablePiece"];
  chessboardAppearance: ReactNode;
  onDragOverSquare: RequiredChessboardProps["onDragOverSquare"];
  onMouseOutSquare: RequiredChessboardProps["onMouseOutSquare"];
  onMouseOverSquare: RequiredChessboardProps["onMouseOverSquare"];
  onPieceClick: RequiredChessboardProps["onPieceClick"];
  onPieceDragBegin: RequiredChessboardProps["onPieceDragBegin"];
  onPieceDragEnd: RequiredChessboardProps["onPieceDragEnd"];
  onPieceDrop: RequiredChessboardProps["onPieceDrop"];
  onPieceDropOffBoard: ChessboardProps["onPieceDropOffBoard"];
  onSparePieceDrop: ChessboardProps["onSparePieceDrop"];
  onSquareClick: RequiredChessboardProps["onSquareClick"];
  showBoardNotation: RequiredChessboardProps["showBoardNotation"];
  snapToCursor: RequiredChessboardProps["snapToCursor"];

  // Exported by context
  arrows: Arrow[];
  chessPieces: CustomPieces | Record<string, ReactNode>;
  clearArrows: () => void;
  clearCurrentRightClickDown: () => void;
  currentPosition: BoardPosition;
  currentRightClickDown?: Square;
  deletePieceFromSquare: (sq: Square) => void;
  drawNewArrow: (from: Square, to: Square) => void;
  handleSetPosition: (
    sourceSq: Square,
    targetSq: Square,
    piece: Piece,
    wasManualDropOverride?: boolean
  ) => void;
  handleSparePieceDrop: (piece: Piece, targetSq: Square) => void;
  isWaitingForAnimation: boolean;
  lastPieceColour: string | undefined;
  lastSquareDraggedOver: Square | null;
  newArrow?: Arrow;
  onArrowDrawEnd: (from: Square, to: Square) => void;
  onRightClickDown: (square: Square) => void;
  onRightClickUp: (square: Square) => void;
  positionDifferences: { added: BoardPosition; removed: BoardPosition };
  setLastSquareDraggedOver: React.Dispatch<React.SetStateAction<Square | null>>;
}

export const ChessboardContext = createContext({} as ChessboardProviderContext);

export const useChessboard = () => useContext(ChessboardContext);

export const ChessboardProvider = forwardRef(
  (
    {
      allowDragOutsideBoard = true,
      animationDuration = 300,
      areArrowsAllowed = true,
      arePiecesDraggable = true,
      boardOrientation = "white",
      boardWidth,
      children,
      customArrows,
      customArrowColor = "rgb(255,170,0)",
      customBoardStyle,
      customNotationStyle,
      customDarkSquareStyle = { backgroundColor: "#B58863" },
      customDropSquareStyle = {
        boxShadow: "inset 0 0 1px 6px rgba(255,255,255,0.75)",
      },
      customLightSquareStyle = { backgroundColor: "#F0D9B5" },
      customPieces,
      customSquare = "div",
      customSquareStyles,
      dropOffBoardAction = "snapback",
      id = 0,
      isDraggablePiece = () => true,
      myStyleBoard = "https://down-vn.img.susercontent.com/file/3ef4261cdf4308584d3afd57f708556d",
      getPositionObject = () => {},
      onArrowsChange = () => {},
      onDragOverSquare = () => {},
      onMouseOutSquare = () => {},
      onMouseOverSquare = () => {},
      onPieceClick = () => {},
      onPieceDragBegin = () => {},
      onPieceDragEnd = () => {},
      onPieceDrop = () => true,
      onPieceDropOffBoard = () => {},
      onSparePieceDrop = () => true,
      onSquareClick = () => {},
      onSquareRightClick = () => {},
      position = "start",
      showBoardNotation = true,
      snapToCursor = true,
    }: ChessboardProviderProps,
    ref
  ) => {
    // position stored and displayed on board
    const [currentPosition, setCurrentPosition] = useState(
      convertPositionToObject(position)
    );

    // calculated differences between current and incoming positions
    const [positionDifferences, setPositionDifferences] = useState<{
      added: BoardPosition;
      removed: BoardPosition;
    }>({ removed: {}, added: {} });

    // colour of last piece moved to determine if premoving
    const [lastPieceColour, setLastPieceColour] =
      useState<string | undefined>(undefined);

    // current right mouse down square
    const [currentRightClickDown, setCurrentRightClickDown] =
      useState<Square | undefined>();

    // chess pieces/styling
    const [chessPieces, setChessPieces] = useState({
      ...defaultPieces,
      ...customPieces,
    });

    // whether the last move was a manual drop or not
    const [wasManualDrop, setWasManualDrop] = useState(false);

    // the most recent timeout whilst waiting for animation to complete
    const [previousTimeout, setPreviousTimeout] = useState<NodeJS.Timeout>();

    // if currently waiting for an animation to finish
    const [isWaitingForAnimation, setIsWaitingForAnimation] = useState(false);

    // last square dragged over for checking in touch events
    const [lastSquareDraggedOver, setLastSquareDraggedOver] =
      useState<Square | null>(null);

    // handle custom pieces change
    useEffect(() => {
      setChessPieces({ ...defaultPieces, ...customPieces });
    }, [customPieces]);

    // handle external position change
    useEffect(() => {
      const newPosition = convertPositionToObject(position);
      const differences = getPositionDifferences(currentPosition, newPosition);
      const newPieceColour =
        Object.keys(differences.added)?.length <= 2
          ? Object.entries(differences.added)?.[0]?.[1][0]
          : undefined;

      // external move has come in before animation is over
      // cancel animation and immediately update position
      if (isWaitingForAnimation) {
        setCurrentPosition(newPosition);
        setIsWaitingForAnimation(false);
        if (previousTimeout) {
          clearTimeout(previousTimeout);
        }
      } else {
        // move was made using drag and drop
        if (wasManualDrop) {
          setCurrentPosition(newPosition);
          setIsWaitingForAnimation(false);
        } else {
          // move was made by external position change

          // if position === start then don't override newPieceColour
          // needs isDifferentFromStart in scenario where premoves have been cleared upon board reset but first move is made by computer, the last move colour would need to be updated
          if (
            isDifferentFromStart(newPosition) &&
            lastPieceColour !== undefined
          ) {
            setLastPieceColour(newPieceColour);
          } else if (!isDifferentFromStart(newPosition)) {
            // position === start, likely a board reset. set to black to allow black to make premoves on first move
            setLastPieceColour("b");
          } else {
            setLastPieceColour(undefined);
          }
          setPositionDifferences(differences);

          // animate external move
          setIsWaitingForAnimation(true);
          const newTimeout = setTimeout(() => {
            setCurrentPosition(newPosition);
            setIsWaitingForAnimation(false);
          }, animationDuration);
          setPreviousTimeout(newTimeout);
        }
      }

      // reset manual drop, ready for next move to be made by user or external
      setWasManualDrop(false);
      // inform latest position information
      getPositionObject(newPosition);
      // clear arrows
      clearArrows();

      // clear timeout on unmount
      return () => {
        clearTimeout(previousTimeout);
      };
    }, [position]);

    const { arrows, newArrow, clearArrows, drawNewArrow, onArrowDrawEnd } =
      useArrows(
        customArrows,
        areArrowsAllowed,
        onArrowsChange,
        customArrowColor
      );

    // handle drop position change
    function handleSetPosition(
      sourceSq: Square,
      targetSq: Square,
      piece: Piece,
      wasManualDropOverride?: boolean
    ) {
      // if dropped back down, don't do anything
      if (sourceSq === targetSq) {
        return;
      }

      clearArrows();

      const newOnDropPosition = { ...currentPosition };

      setWasManualDrop(!!wasManualDropOverride);
      setLastPieceColour(piece[0]);

      // if onPieceDrop function provided, execute it, position must be updated externally and captured by useEffect above for this move to show on board
      if (onPieceDrop.length) {
        const isValidMove = onPieceDrop(sourceSq, targetSq, piece);
        if (!isValidMove) {
          setWasManualDrop(false);
        }
      } else {
        // delete source piece
        delete newOnDropPosition[sourceSq];

        // add piece in new position
        newOnDropPosition[targetSq] = piece;
        setCurrentPosition(newOnDropPosition);
      }

      // inform latest position information
      getPositionObject(newOnDropPosition);
    }

    function deletePieceFromSquare(square: Square) {
      const positionCopy = { ...currentPosition };

      delete positionCopy[square];
      setCurrentPosition(positionCopy);

      // inform latest position information
      getPositionObject(positionCopy);
    }

    function handleSparePieceDrop(piece: Piece, targetSq: Square) {
      const isValidDrop = onSparePieceDrop(piece, targetSq);

      if (!isValidDrop) return;
      const newOnDropPosition = { ...currentPosition };
      // add piece in new position
      newOnDropPosition[targetSq] = piece;
      setCurrentPosition(newOnDropPosition);

      // inform latest position information
      getPositionObject(newOnDropPosition);
    }

    function onRightClickDown(square: Square) {
      setCurrentRightClickDown(square);
    }

    function onRightClickUp(square: Square) {
      if (currentRightClickDown) {
        // same square, don't draw an arrow
        if (currentRightClickDown === square) {
          setCurrentRightClickDown(undefined);
          onSquareRightClick(square);
          return;
        }
      } else setCurrentRightClickDown(undefined);
    }

    function clearCurrentRightClickDown() {
      setCurrentRightClickDown(undefined);
    }

    const ChessboardProviderContextValue: ChessboardProviderContext = {
      allowDragOutsideBoard,
      animationDuration,
      arePiecesDraggable,
      arrows,
      boardOrientation,
      boardWidth,
      chessPieces,
      clearArrows,
      clearCurrentRightClickDown,
      currentPosition,
      currentRightClickDown,
      customArrowColor,
      customBoardStyle,
      customDarkSquareStyle,
      customDropSquareStyle,
      customLightSquareStyle,
      customNotationStyle,
      customSquare,
      customSquareStyles,
      deletePieceFromSquare,
      drawNewArrow,
      dropOffBoardAction,
      handleSetPosition,
      handleSparePieceDrop,
      id,
      isDraggablePiece,
      isWaitingForAnimation,
      lastPieceColour,
      lastSquareDraggedOver,
      chessboardAppearance: <img src={myStyleBoard} alt="Chess board style" />,
      newArrow,
      onArrowDrawEnd,
      onDragOverSquare,
      onMouseOutSquare,
      onMouseOverSquare,
      onPieceClick,
      onPieceDragBegin,
      onPieceDragEnd,
      onPieceDrop,
      onPieceDropOffBoard,
      onRightClickDown,
      onRightClickUp,
      onSparePieceDrop,
      onSquareClick,
      positionDifferences,
      setLastSquareDraggedOver,
      showBoardNotation,
      snapToCursor,
    };

    return (
      <ChessboardContext.Provider value={ChessboardProviderContextValue}>
        {children}
      </ChessboardContext.Provider>
    );
  }
);

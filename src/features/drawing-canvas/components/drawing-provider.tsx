import type { Drawing } from "@/features/drawing-canvas/models/drawing";
import { type ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { drawBlobToCanvas } from "../drawing-core";
import type { DrawingStyle } from "../drawing-style";
import { useDrawingHistory } from "../use-drawing-history";
import { useDrawingStore } from "../use-drawing-store";

// コンテキストの型定義
interface DrawingContextType {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingStyle: DrawingStyle;
  updateDrawingStyle: (newStyle: Partial<DrawingStyle>) => void;
  isLoading: boolean;
  drawings: Drawing[];
  currentDrawingId: string | null;
  isDrawingListOpen: boolean;
  openDrawingList: () => void;
  closeDrawingList: () => void;
  onChangeDrawing: (drawing: Drawing) => Promise<void>;
  createNewDrawing: () => Promise<void>;
  onDrawEnd: () => void;
  undo: () => void;
}

// コンテキストの作成
const DrawingContext = createContext<DrawingContextType | null>(null);

// コンテキストを使用するためのカスタムフック
export const useDrawing = () => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error("useDrawing must be used within a DrawingProvider");
  }
  return context;
};

interface DrawingProviderProps {
  children: ReactNode;
}

export const DrawingProvider = ({ children }: DrawingProviderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingListOpen, setIsDrawingListOpen] = useState(false);

  const {
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    drawings,
    createDrawing,
    selectDrawing,
    currentDrawingId,
  } = useDrawingStore();

  const { pushHistory, undo, clearHistory } = useDrawingHistory({
    canvasRef,
    historyId: currentDrawingId,
  });

  // Drawing list dialog handlers
  const openDrawingList = () => {
    setIsDrawingListOpen(true);
  };

  const closeDrawingList = () => {
    setIsDrawingListOpen(false);
  };

  // Handler for switching to a different drawing
  const onChangeDrawing = async (drawing: Drawing) => {
    if (!canvasRef.current) return;
    try {
      await drawBlobToCanvas(canvasRef.current, drawing.image);
      selectDrawing(drawing.id);
      clearHistory(); // Clear history for the new drawing
      pushHistory(); // Add initial state to history
      setIsDrawingListOpen(false);
    } catch (error) {
      console.error("Failed to load drawing:", error);
    }
  };

  // Handler for creating a new drawing
  const createNewDrawing = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsDrawingListOpen(false);
    clearHistory(); // Clear history for the new drawing
    await createDrawing();
  };

  // Save drawing state after each drawing operation
  const onDrawEnd = () => {
    pushHistory();
  };

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled in individual components
    };
  }, []);

  const value: DrawingContextType = {
    canvasRef,
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    drawings,
    currentDrawingId,
    isDrawingListOpen,
    openDrawingList,
    closeDrawingList,
    onChangeDrawing,
    createNewDrawing,
    onDrawEnd,
    undo,
  };

  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
};

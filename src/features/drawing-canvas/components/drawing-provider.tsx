import type { Drawing } from "@/features/drawing-canvas/models/drawing";
import { type ReactNode, createContext, useContext, useEffect, useRef } from "react";
import { canvasToBlob, clearCanvas, drawBlobToCanvas } from "../drawing-core";
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

  const {
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    drawings,
    createDrawing,
    updateCurrentDrawing,
    selectDrawing,
    currentDrawingId,
    currentProfile,
  } = useDrawingStore();

  const { pushHistory, undo, clearHistory } = useDrawingHistory({
    canvasRef,
    profileId: currentProfile?.id ?? null,
  });

  // Handler for switching to a different drawing
  const onChangeDrawing = async (drawing: Drawing) => {
    if (!canvasRef.current) return;
    try {
      selectDrawing(drawing.id);
      await drawBlobToCanvas(canvasRef.current, drawing.image);
      await pushHistory(); // Save initial state before clearing history
      await clearHistory(); // Start fresh history
      await pushHistory(); // Set initial state in new history
    } catch (error) {
      console.error("Failed to load drawing:", error);
    }
  };

  // Handler for creating a new drawing
  const createNewDrawing = async () => {
    clearCanvas(canvasRef.current);
    clearHistory(); // Clear history for the new drawing
    await createDrawing();
  };

  // Save drawing state after each drawing operation
  const onDrawEnd = async () => {
    pushHistory();
    const blob = await canvasToBlob(canvasRef.current);
    updateCurrentDrawing(blob);
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
    onChangeDrawing,
    createNewDrawing,
    onDrawEnd,
    undo,
  };

  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
};

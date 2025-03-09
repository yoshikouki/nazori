import type { Drawing } from "@/features/drawing-canvas/models/drawing";
import { type ReactNode, createContext, useContext, useEffect, useRef } from "react";
import { toast } from "sonner";
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
  onDeleteDrawing: (drawingId: string) => Promise<void>;
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
    deleteDrawing,
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
      await clearHistory(); // Start fresh history
      await pushHistory(); // Set initial state in new history
    } catch (error) {
      console.error("Failed to load drawing:", error);
    }
  };

  // Handler for creating a new drawing
  const createNewDrawing = async () => {
    await createDrawing();
    clearCanvas(canvasRef.current);
    clearHistory(); // Clear history for the new drawing
  };

  // Handler for deleting a drawing
  const onDeleteDrawing = async (drawingId: string) => {
    try {
      await deleteDrawing(drawingId);
      toast.success("けしたよ");
    } catch (error) {
      console.error("Failed to delete drawing:", error);
      toast.error("けせず・・・むねん");
    }
  };

  // Save drawing state after each drawing operation
  const onDrawEnd = async () => {
    pushHistory();
    const blob = await canvasToBlob(canvasRef.current);

    // Create new drawing if this is first draw operation and no current drawing exists
    if (!currentDrawingId) {
      const newDrawing = await createDrawing();
      if (newDrawing) {
        await clearHistory(); // Start fresh history for the new drawing
        await pushHistory(); // Set initial state in the history
      }
    }

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
    onDeleteDrawing,
  };

  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
};

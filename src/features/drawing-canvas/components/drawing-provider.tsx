import type { Drawing } from "@/features/drawing-canvas/models/drawing";
import { type ReactNode, createContext, useContext, useRef } from "react";
import { toast } from "sonner";
import { canvasToBlob, clearCanvas, drawBlobToCanvas } from "../drawing-core";
import type { DrawingStyle } from "../drawing-style";
import { useDrawingHistory } from "../use-drawing-history";
import { useDrawingStore } from "../use-drawing-store";

interface DrawingContextType {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingStyle: DrawingStyle;
  updateDrawingStyle: (newStyle: Partial<DrawingStyle>) => void;
  isLoading: boolean;
  drawings: Drawing[];
  currentDrawingId: string | null;
  onDrawingChange: (drawing: Drawing) => Promise<void>;
  onDrawingCreate: () => Promise<void>;
  onDrawEnd: () => void;
  undo: () => void;
  onDrawingDelete: (drawingId: string) => Promise<void>;
}

const DrawingContext = createContext<DrawingContextType | null>(null);

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

  const onDrawingChange = async (drawing: Drawing) => {
    if (!canvasRef.current) return;
    selectDrawing(drawing.id);
    await drawBlobToCanvas(canvasRef.current, drawing.image);
    await clearHistory(); // Start fresh history
    await pushHistory(); // Set initial state in new history
  };

  const onDrawingCreate = async () => {
    await createDrawing();
    clearCanvas(canvasRef.current);
    clearHistory(); // Clear history for the new drawing
  };

  const onDrawingDelete = async (drawingId: string) => {
    const success = await deleteDrawing(drawingId);
    if (success) {
      toast.success("けしたよ");
    } else {
      toast.error("けせず・・・むねん");
    }
  };

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

  const value: DrawingContextType = {
    canvasRef,
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    drawings,
    currentDrawingId,
    onDrawingChange,
    onDrawingCreate,
    onDrawEnd,
    undo,
    onDrawingDelete,
  };

  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
};

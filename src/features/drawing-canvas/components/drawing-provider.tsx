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
  const store = useDrawingStore();
  const history = useDrawingHistory({
    canvasRef,
    profileId: store.currentProfile?.id,
  });

  const onDrawingChange = async (drawing: Drawing) => {
    if (!canvasRef.current) return;
    store.selectDrawing(drawing.id);
    await drawBlobToCanvas(canvasRef.current, drawing.image);
    await history.clearHistory(); // Start fresh history
    await history.pushHistory(); // Set initial state in new history
  };

  const onDrawingCreate = async () => {
    await store.createDrawing();
    clearCanvas(canvasRef.current);
    await history.clearHistory(); // Clear history for the new drawing
    await history.pushHistory(); // Set initial state in the history
  };

  const onDrawingDelete = async (drawingId: string) => {
    const success = await store.deleteDrawing(drawingId);
    if (success) {
      toast.success("けしたよ");
    } else {
      toast.error("けせず・・・むねん");
    }
  };

  const onDrawEnd = async () => {
    // Create new drawing if this is first draw operation and no current drawing exists
    if (!store.currentDrawingId) {
      await store.createDrawing();
    }
    const blob = await canvasToBlob(canvasRef.current);
    await store.updateCurrentDrawing(blob);
    await history.pushHistory();
  };

  const value: DrawingContextType = {
    canvasRef,
    drawingStyle: store.drawingStyle,
    updateDrawingStyle: store.updateDrawingStyle,
    isLoading: store.isLoading,
    drawings: store.drawings,
    currentDrawingId: store.currentDrawingId,
    onDrawingChange,
    onDrawingCreate,
    onDrawEnd,
    undo: history.undo,
    onDrawingDelete,
  };

  return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>;
};

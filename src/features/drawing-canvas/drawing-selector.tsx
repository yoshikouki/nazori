"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Drawing } from "./models/drawing";

interface DrawingDialogProps {
  drawings: Drawing[];
  onDrawingSelect: (drawing: Drawing) => void;
  onCreateNewDrawing: () => void;
  onDeleteDrawing: (drawingId: string) => Promise<void>;
  isLoading: boolean;
}

export const DrawingSelector = ({
  drawings,
  onDrawingSelect,
  onCreateNewDrawing,
  onDeleteDrawing,
  isLoading,
}: DrawingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const imageUrls = Object.fromEntries(
    drawings.map((drawing) => [drawing.id, URL.createObjectURL(drawing.image)]),
  );

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmDeleteId(null);
    }
  };

  // Clean up URLs when component unmounts to free memory
  useEffect(() => {
    return () => {
      for (const url of Object.values(imageUrls)) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageUrls]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Button
        type="button"
        variant="outline"
        className="aspect-square select-none p-0"
        onClick={() => onOpenChange(true)}
      >
        <PlusIcon />
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>なぞりを選ぶ</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4 py-4">
            {isLoading ? (
              <div className="flex aspect-square w-full items-center justify-center">
                よみこみちゅう...
              </div>
            ) : (
              drawings.map((drawing) => (
                <div
                  key={drawing.id}
                  className="group relative overflow-hidden rounded-lg border text-left"
                >
                  <div className="cursor-pointer hover:bg-background">
                    <div
                      className="relative aspect-square w-full"
                      onClick={() => {
                        onDrawingSelect(drawing);
                        onOpenChange(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        onDrawingSelect(drawing);
                        onOpenChange(false);
                      }}
                      aria-label={`${drawing.createdAt.toLocaleDateString()}のなぞりを選択`}
                    >
                      <Image
                        src={imageUrls[drawing.id]}
                        alt={`Drawing from ${drawing.createdAt.toLocaleDateString()}`}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className="relative flex items-center justify-between p-2">
                      <span className="text-gray-500 text-xs">
                        {drawing.createdAt.toLocaleDateString()}
                      </span>
                      {confirmDeleteId === drawing.id ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDrawing(drawing.id);
                            setConfirmDeleteId(null);
                          }}
                          className="absolute inset-0 rounded bg-destructive px-2 py-1 font-bold text-destructive-foreground text-xs hover:bg-destructive/90"
                          aria-label="けしていい？"
                        >
                          けしていい？
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(drawing.id);
                          }}
                          className="ml-2 text-foreground/30 transition-opacity group-hover:text-foreground/100 "
                          aria-label="削除"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <button
              type="button"
              className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-300 border-dashed p-2 hover:bg-gray-50"
              onClick={() => {
                onCreateNewDrawing();
                onOpenChange(false);
              }}
              aria-label="あたらしくつくる"
            >
              <PlusIcon className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-gray-500 text-sm">あたらしくつくる</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

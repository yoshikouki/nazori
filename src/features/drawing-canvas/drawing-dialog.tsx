"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Drawing } from "@/lib/client-db";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface DrawingDialogProps {
  drawings: Drawing[];
  onDrawingSelect: (drawing: Drawing) => void;
  onCreateNewDrawing: () => void;
  isLoading: boolean;
  trigger: React.ReactNode;
}

export const DrawingDialog = ({
  drawings,
  onDrawingSelect,
  onCreateNewDrawing,
  isLoading,
  trigger,
}: DrawingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>なぞりを選ぶ</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <button
            type="button"
            className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-300 border-dashed p-2 hover:bg-gray-50"
            onClick={() => {
              onCreateNewDrawing();
              setIsOpen(false);
            }}
            aria-label="あたらしくつくる"
          >
            <PlusIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-gray-500 text-sm">あたらしくつくる</span>
          </button>

          {isLoading ? (
            <div className="flex aspect-square w-full items-center justify-center">
              よみこみちゅう...
            </div>
          ) : (
            drawings.map((drawing) => (
              <button
                type="button"
                key={drawing.id}
                className="cursor-pointer overflow-hidden rounded-lg border text-left hover:bg-gray-50"
                onClick={() => {
                  onDrawingSelect(drawing);
                  setIsOpen(false);
                }}
                aria-label={`Drawing from ${drawing.createdAt.toLocaleDateString()}`}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={URL.createObjectURL(drawing.image)}
                    alt={`Drawing from ${drawing.createdAt.toLocaleDateString()}`}
                    fill
                    style={{ objectFit: "contain" }}
                    onLoad={(e) => {
                      URL.revokeObjectURL((e.target as HTMLImageElement).src);
                    }}
                  />
                </div>
                <div className="p-2 text-gray-500 text-xs">
                  {drawing.createdAt.toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

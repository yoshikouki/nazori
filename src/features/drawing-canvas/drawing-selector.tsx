"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Drawing } from "./models/drawing";

interface DrawingDialogProps {
  drawings: Drawing[];
  onDrawingSelect: (drawing: Drawing) => void;
  onCreateNewDrawing: () => void;
  isLoading: boolean;
}

export const DrawingSelector = ({
  drawings,
  onDrawingSelect,
  onCreateNewDrawing,
  isLoading,
}: DrawingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const imageUrls = Object.fromEntries(
    drawings.map((drawing) => [drawing.id, URL.createObjectURL(drawing.image)]),
  );

  // Clean up URLs when component unmounts to free memory
  useEffect(() => {
    return () => {
      for (const url of Object.values(imageUrls)) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageUrls]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        type="button"
        variant="outline"
        className="aspect-square select-none p-0"
        onClick={() => setIsOpen(true)}
      >
        <PlusIcon />
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>なぞりを選ぶ</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
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
                    src={imageUrls[drawing.id]}
                    alt={`Drawing from ${drawing.createdAt.toLocaleDateString()}`}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className="p-2 text-gray-500 text-xs">
                  {drawing.createdAt.toLocaleDateString()}
                </div>
              </button>
            ))
          )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, PlusIcon, Trash2Icon } from "lucide-react";
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
                  <button
                    type="button"
                    className="w-full cursor-pointer hover:bg-gray-50"
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
                  <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full bg-white/80"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">メニュー</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDrawing(drawing.id);
                          }}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2Icon className="mr-2 h-4 w-4" />
                          <span>削除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

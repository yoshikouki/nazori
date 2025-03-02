"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { OnDrawingStyleChange } from ".";
import { LineWidthOptionsArray, getCurrentLineWidth } from "./drawing-style";
type LineWidthPickerProps = {
  width: number;
  color: string;
  onWidthChange: OnDrawingStyleChange;
};

export const LineWidthPicker = ({ width, color, onWidthChange }: LineWidthPickerProps) => {
  const currentWidth = getCurrentLineWidth(width);
  const calculateSize = (width: number) => width;
  const isCurrentWidth = (width: number) => width === currentWidth?.value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="flex aspect-square gap-2 sm:aspect-auto">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: `${calculateSize(width)}px`,
                height: `${calculateSize(width)}px`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="hidden sm:inline">{currentWidth?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-1">
        {LineWidthOptionsArray.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onClick={() => onWidthChange({ lineWidth: option.value })}
            onPointerUp={() => onWidthChange({ lineWidth: option.value })}
            className={cn(
              "relative flex h-10 items-center justify-start font-bold",
              isCurrentWidth(option.value) && "bg-secondary",
            )}
          >
            <div
              className="absolute inset-x-0 bottom-0 w-full rounded-full"
              style={{
                height: `${calculateSize(option.value)}px`,
                backgroundColor: color,
              }}
            />
            <span className="z-1">{option.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

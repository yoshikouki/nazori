"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OnDrawingStyleChange } from ".";
import { WidthOptionsArray, getCurrentWidth } from "./line-style";
type LineWidthPickerProps = {
  width: number;
  color: string;
  onWidthChange: OnDrawingStyleChange;
};

export const LineWidthPicker = ({ width, color, onWidthChange }: LineWidthPickerProps) => {
  const currentWidth = getCurrentWidth(width);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="flex aspect-square gap-2 sm:aspect-auto">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: `${Math.min(16, width * 2)}px`,
                height: `${Math.min(16, width * 2)}px`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="hidden sm:inline">{currentWidth?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {WidthOptionsArray.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onClick={() => onWidthChange({ width: option.value })}
            onPointerUp={() => onWidthChange({ width: option.value })}
            className="flex gap-2"
          >
            <div className="flex w-4 items-center justify-center">
              <div
                className="rounded-full bg-current"
                style={{
                  width: `${Math.min(16, option.value * 2)}px`,
                  height: `${Math.min(16, option.value * 2)}px`,
                }}
              />
            </div>
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

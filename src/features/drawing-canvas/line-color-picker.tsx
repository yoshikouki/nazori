"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OnDrawingStyleChange } from ".";
import { LineColorOptionsArray, getCurrentLineColor } from "./drawing-style";

type LineColorPickerProps = {
  color: string;
  onColorChange: OnDrawingStyleChange;
};

export const LineColorPicker = ({ color, onColorChange }: LineColorPickerProps) => {
  const currentColor = getCurrentLineColor(color);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={currentColor?.lightness === "dark" ? "default" : "outline"}
          size="lg"
          className="flex aspect-square gap-2 font-bold sm:aspect-auto"
          style={{ backgroundColor: color }}
        >
          <span className="hidden sm:inline">{currentColor?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {LineColorOptionsArray.map((colorOption) => (
          <DropdownMenuItem
            key={colorOption.key}
            onClick={() => onColorChange({ lineColor: colorOption.value })}
            onPointerUp={() => onColorChange({ lineColor: colorOption.value })}
            className="flex gap-2"
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: colorOption.value }}
            />
            {colorOption.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

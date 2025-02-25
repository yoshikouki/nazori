"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OnLineStyleChange } from ".";
import { ColorOptionsArray, getCurrentColor } from "./line-style";

type LineColorPickerProps = {
  color: string;
  onColorChange: OnLineStyleChange;
};

export const LineColorPicker = ({ color, onColorChange }: LineColorPickerProps) => {
  const currentColor = getCurrentColor(color);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={currentColor?.lightness === "dark" ? "default" : "outline"}
          className="flex aspect-square gap-2 font-bold sm:aspect-auto"
          style={{ backgroundColor: color }}
        >
          <span className="hidden sm:inline">{currentColor?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {ColorOptionsArray.map((colorOption) => (
          <DropdownMenuItem
            key={colorOption.key}
            onClick={() => onColorChange({ color: colorOption.value })}
            onPointerUp={() => onColorChange({ color: colorOption.value })}
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

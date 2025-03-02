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
import { LineColorOptionsArray, getCurrentLineColor } from "./drawing-style";

type LineColorPickerProps = {
  color: string;
  onColorChange: OnDrawingStyleChange;
  disabled?: boolean;
};

export const LineColorPicker = ({
  color,
  onColorChange,
  disabled = false,
}: LineColorPickerProps) => {
  const currentColor = getCurrentLineColor(color);
  const isCurrentColor = ({ key }: { key: string }) => {
    return key === currentColor?.key;
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant={currentColor?.lightness === "dark" ? "default" : "outline"}
          size="lg"
          className="flex aspect-square gap-2 font-bold sm:aspect-auto"
          style={{ backgroundColor: color }}
          disabled={disabled}
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
            className={cn("flex gap-2", isCurrentColor(colorOption) && "bg-secondary")}
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

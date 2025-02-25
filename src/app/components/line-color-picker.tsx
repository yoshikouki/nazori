"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LineColorPickerProps = {
  color: string;
  onColorChange: (color: string) => void;
};

export const LineColorPicker = ({
  color,
  onColorChange,
}: LineColorPickerProps) => {
  const colorOptions = [
    { name: "黒", value: "#000000" },
    { name: "赤", value: "#FF0000" },
    { name: "青", value: "#0000FF" },
    { name: "緑", value: "#008000" },
    { name: "黄", value: "#FFFF00" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="hidden sm:inline">色</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {colorOptions.map((colorOption) => (
          <DropdownMenuItem
            key={colorOption.value}
            onClick={() => onColorChange(colorOption.value)}
            className="flex gap-2"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colorOption.value }}
            />
            {colorOption.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

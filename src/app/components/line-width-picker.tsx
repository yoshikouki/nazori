"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LineWidthPickerProps = {
  width: number;
  onWidthChange: (width: number) => void;
};

export const LineWidthPicker = ({
  width,
  onWidthChange,
}: LineWidthPickerProps) => {
  const lineWidthOptions = [
    { name: "細", value: 1 },
    { name: "中", value: 2 },
    { name: "太", value: 4 },
    { name: "極太", value: 8 },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <div className="flex items-center justify-center">
            <div
              className="rounded-full bg-current"
              style={{
                width: `${Math.min(16, width * 2)}px`,
                height: `${Math.min(16, width * 2)}px`,
              }}
            />
          </div>
          <span className="hidden sm:inline">太さ</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {lineWidthOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onWidthChange(option.value)}
            className="flex gap-2"
          >
            <div className="flex items-center justify-center w-4">
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

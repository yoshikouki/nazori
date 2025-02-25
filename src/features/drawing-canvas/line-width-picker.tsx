"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OnLineStyleChange } from ".";
import { WidthOptionsArray, getCurrentWidth } from "./line-style";

type LineWidthPickerProps = {
  width: number;
  onWidthChange: OnLineStyleChange;
};

export const LineWidthPicker = ({ width, onWidthChange }: LineWidthPickerProps) => {
  const currentWidth = getCurrentWidth(width);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex min-w-10 gap-2">
          <div className="flex items-center justify-center">
            <div
              className="rounded-full bg-current"
              style={{
                width: `${Math.min(16, width * 2)}px`,
                height: `${Math.min(16, width * 2)}px`,
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

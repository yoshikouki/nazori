"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

interface SaveImageButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const SaveImageButton = ({ canvasRef }: SaveImageButtonProps) => {
  const onSaveImage = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();
    const title = `おもいで-${new Date().toLocaleString().replace(/[\s/:]/g, "")}`;

    if (navigator.share) {
      try {
        await navigator.share({
          files: [new File([blob], `${title}.png`, { type: "image/png" })],
          title,
        });
        return;
      } catch (error) {
        console.error("保存に失敗しました:", error);
      }
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${title}.png`;
    link.click();
  };

  return (
    <Button type="button" onClick={onSaveImage}>
      <DownloadIcon />
      ほぞん
    </Button>
  );
};

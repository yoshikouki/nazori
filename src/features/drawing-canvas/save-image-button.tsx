"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";

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
        toast.success("ほぞんしました");
        return;
      } catch (error) {
        console.error("保存に失敗しました:", error);
        toast.error("ほぞんできませんでした");
        return;
      }
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${title}.png`;
    link.click();
    toast.success("ほぞんしました");
  };

  return (
    <Button type="button" onClick={onSaveImage}>
      <DownloadIcon />
      <span className="hidden sm:inline">ほぞん</span>
    </Button>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BookOpen, TextIcon } from "lucide-react";
import { useDrawing } from "./components/drawing-provider";
import type { Template, TemplateCategory } from "./models/template";
import { getTemplatesByCategory } from "./models/template";

interface TemplateSelectorProps {
  className?: string;
}

export const TemplateSelector = ({ className }: TemplateSelectorProps) => {
  const { currentTemplate, setCurrentTemplate, templateDirection, setTemplateDirection } =
    useDrawing();

  const handleSelectTemplate = (template: Template) => {
    // 同じテンプレートを選択した場合はクリア
    if (currentTemplate?.id === template.id) {
      setCurrentTemplate(null);
    } else {
      setCurrentTemplate(template);
    }
  };

  const toggleDirection = () => {
    setTemplateDirection(templateDirection === "horizontal" ? "vertical" : "horizontal");
  };

  const renderTemplateGroup = (category: TemplateCategory, label: string) => {
    const categoryTemplates = getTemplatesByCategory(category);
    if (categoryTemplates.length === 0) return null;

    return (
      <>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuGroup>
          {categoryTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={cn(
                currentTemplate?.id === template.id && "bg-accent text-accent-foreground",
              )}
            >
              {template.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </>
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full p-0",
              currentTemplate && "bg-accent text-accent-foreground",
              className,
            )}
            title="お手本を選択"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentTemplate && (
            <>
              <DropdownMenuItem onClick={() => setCurrentTemplate(null)}>
                お手本を非表示
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleDirection}>
                {templateDirection === "horizontal" ? "縦書きに変更" : "横書きに変更"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {renderTemplateGroup("hiragana", "ひらがな")}
          {renderTemplateGroup("word", "単語")}
          {renderTemplateGroup("shape", "形")}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* テンプレートが選択されている場合のみ表示する縦書き/横書き切り替えボタン */}
      {currentTemplate && (
        <Button
          variant="outline"
          size="icon"
          className="mt-2 h-9 w-9 rounded-full p-0"
          title={templateDirection === "horizontal" ? "縦書きに変更" : "横書きに変更"}
          onClick={toggleDirection}
        >
          <TextIcon
            className={cn("h-5 w-5", templateDirection === "vertical" && "rotate-90")}
          />
        </Button>
      )}
    </>
  );
};

/**
 * Template model for displaying example text/shapes as drawing guides
 */

export interface Template {
  id: string;
  name: string;
  content: string;
  category: TemplateCategory;
}

export type TemplateCategory = "hiragana" | "katakana" | "kanji" | "word" | "shape";

/**
 * 基本的なテンプレートのコレクション
 */
export const templates: Template[] = [
  // ひらがな
  { id: "hiragana-a", name: "あ", content: "あ", category: "hiragana" },
  { id: "hiragana-i", name: "い", content: "い", category: "hiragana" },
  { id: "hiragana-u", name: "う", content: "う", category: "hiragana" },
  { id: "hiragana-e", name: "え", content: "え", category: "hiragana" },
  { id: "hiragana-o", name: "お", content: "お", category: "hiragana" },

  // 単語
  { id: "word-ringo", name: "りんご", content: "りんご", category: "word" },
  { id: "word-banana", name: "バナナ", content: "バナナ", category: "word" },
  { id: "word-mikan", name: "みかん", content: "みかん", category: "word" },

  // 形
  { id: "shape-circle", name: "まる", content: "○", category: "shape" },
  { id: "shape-triangle", name: "さんかく", content: "△", category: "shape" },
  { id: "shape-square", name: "しかく", content: "□", category: "shape" },
];

/**
 * カテゴリー別にテンプレートを取得する
 */
export const getTemplatesByCategory = (category: TemplateCategory): Template[] => {
  return templates.filter((template) => template.category === category);
};

/**
 * IDでテンプレートを取得する
 */
export const getTemplateById = (id: string): Template | undefined => {
  return templates.find((template) => template.id === id);
};

// Color options derived from shadcn-ui color palette
// ref: https://github.com/shadcn-ui/ui/blob/d44971b6c23d60ccef11e303fddaf94b90c01eda/apps/www/registry/registry-colors.ts#L1477
const LineColorOptions = {
  black: { key: "black", name: "くろ", value: "#000000", lightness: "dark" },
  red: { key: "red", name: "あか", value: "#ef4444", lightness: "dark" },
  orange: { key: "orange", name: "オレンジ", value: "#f97316", lightness: "dark" },
  amber: { key: "amber", name: "こはく", value: "#f59e0b", lightness: "dark" },
  yellow: { key: "yellow", name: "きいろ", value: "#eab308", lightness: "dark" },
  lime: { key: "lime", name: "ライム", value: "#84cc16", lightness: "dark" },
  green: { key: "green", name: "みどり", value: "#22c55e", lightness: "dark" },
  emerald: { key: "emerald", name: "エメラルド", value: "#10b981", lightness: "dark" },
  teal: { key: "teal", name: "ティール", value: "#14b8a6", lightness: "dark" },
  cyan: { key: "cyan", name: "シアン", value: "#06b6d4", lightness: "dark" },
  sky: { key: "sky", name: "みずいろ", value: "#0ea5e9", lightness: "dark" },
  blue: { key: "blue", name: "あお", value: "#3b82f6", lightness: "dark" },
  indigo: { key: "indigo", name: "こいあお", value: "#6366f1", lightness: "dark" },
  violet: { key: "violet", name: "むらさき", value: "#8b5cf6", lightness: "dark" },
  purple: { key: "purple", name: "パープル", value: "#a855f7", lightness: "dark" },
  fuchsia: { key: "fuchsia", name: "フュージャ", value: "#d946ef", lightness: "dark" },
  pink: { key: "pink", name: "ピンク", value: "#ec4899", lightness: "dark" },
  rose: { key: "rose", name: "ばら", value: "#f43f5e", lightness: "dark" },
} as const;
export const LineColorOptionsArray = Object.values(LineColorOptions);

// Line width options with child-friendly names
const LineWidthOptions = {
  thin: { key: "thin", name: "ほそい", value: 4 },
  medium: { key: "medium", name: "ふつう", value: 8 },
  thick: { key: "thick", name: "ふとい", value: 20 },
  extraThick: { key: "extraThick", name: "ごくぶと", value: 40 },
} as const;
export const LineWidthOptionsArray = Object.values(LineWidthOptions);

// Core drawing style configuration type
export type DrawingStyle = {
  lineWidth: number;
  lineColor: string;
  penOnly: boolean;
  isEraser: boolean;
};

// Default drawing style settings
export const DefaultDrawingStyle: DrawingStyle = {
  lineWidth: LineWidthOptions.medium.value,
  lineColor: LineColorOptions.black.value,
  penOnly: false,
  isEraser: false,
};

// Helper functions to find color/width options by value
export const getCurrentLineColor = (color: string) => {
  return LineColorOptionsArray.find((option) => option.value === color);
};
export const getCurrentLineWidth = (width: number) => {
  return LineWidthOptionsArray.find((option) => option.value === width);
};

// Type for drawing style change handler
export type OnDrawingStyleChange = (newDrawingStyle: Partial<DrawingStyle>) => void;

export const LineColorOptions = {
  black: { key: "black", name: "くろ", value: "#000000", lightness: "dark" },
  red: { key: "red", name: "あか", value: "#FF0000", lightness: "dark" },
  blue: { key: "blue", name: "あお", value: "#0000FF", lightness: "dark" },
  green: { key: "green", name: "みどり", value: "#008000", lightness: "dark" },
  yellow: { key: "yellow", name: "きいろ", value: "#FFFF00", lightness: "light" },
} as const;
export const LineColorOptionsArray = Object.values(LineColorOptions);

export const LineWidthOptions = {
  thin: { key: "thin", name: "ほそい", value: 2 },
  medium: { key: "medium", name: "ふつう", value: 4 },
  thick: { key: "thick", name: "ふとい", value: 6 },
  extraThick: { key: "extraThick", name: "ごくぶと", value: 12 },
} as const;
export const LineWidthOptionsArray = Object.values(LineWidthOptions);

export type DrawingStyle = {
  lineWidth: number;
  lineColor: string;
  penOnly: boolean;
};

export const DefaultDrawingStyle: DrawingStyle = {
  lineWidth: LineWidthOptions.medium.value,
  lineColor: LineColorOptions.black.value,
  penOnly: false,
};

export const getCurrentLineColor = (color: string) => {
  return LineColorOptionsArray.find((option) => option.value === color);
};
export const getCurrentLineWidth = (width: number) => {
  return LineWidthOptionsArray.find((option) => option.value === width);
};

// 後方互換性のために残しておく
export type LineStyle = Omit<DrawingStyle, "penOnly">;
export const DefaultLineStyle: LineStyle = {
  lineWidth: DefaultDrawingStyle.lineWidth,
  lineColor: DefaultDrawingStyle.lineColor,
};

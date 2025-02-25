export const ColorOptions = {
  black: { key: "black", name: "くろ", value: "#000000", lightness: "dark" },
  red: { key: "red", name: "あか", value: "#FF0000", lightness: "dark" },
  blue: { key: "blue", name: "あお", value: "#0000FF", lightness: "dark" },
  green: { key: "green", name: "みどり", value: "#008000", lightness: "dark" },
  yellow: { key: "yellow", name: "きいろ", value: "#FFFF00", lightness: "light" },
} as const;
export const ColorOptionsArray = Object.values(ColorOptions);

export const WidthOptions = {
  thin: { key: "thin", name: "ほそい", value: 2 },
  medium: { key: "medium", name: "ふつう", value: 4 },
  thick: { key: "thick", name: "ふとい", value: 6 },
  extraThick: { key: "extraThick", name: "ごくぶと", value: 12 },
} as const;
export const WidthOptionsArray = Object.values(WidthOptions);

export type LineStyle = {
  width: number;
  color: string;
};
export const DefaultLineStyle: LineStyle = {
  width: WidthOptions.medium.value,
  color: ColorOptions.black.value,
};

export const getCurrentColor = (color: string) => {
  return ColorOptionsArray.find((option) => option.value === color);
};
export const getCurrentWidth = (width: number) => {
  return WidthOptionsArray.find((option) => option.value === width);
};

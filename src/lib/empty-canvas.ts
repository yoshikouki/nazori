export const EMPTY_CANVAS_SIZE = 512;

const createEmptyCanvasBase64 = (): string => {
  const canvas = new OffscreenCanvas(EMPTY_CANVAS_SIZE, EMPTY_CANVAS_SIZE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // 白で塗りつぶし
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Blobに変換
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buffer = imageData.data.buffer;

  // Base64に変換
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
};

// Base64形式の空のキャンバスデータ
// 512x512の白い画像のBase64エンコードされたデータ
export const EMPTY_CANVAS_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAQMAAADOtka5AAAAA1BMVEX///+nxBvIAAAAWklEQVR42u3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AcUIAAFkqh/QAAAAAElFTkSuQmCC";

// スクリプトとして実行された場合
if (import.meta.main) {
  const base64 = createEmptyCanvasBase64();
  console.log(base64);
}

/**
 * 描画関連の純粋関数を定義するモジュール
 * 状態変更を返り値として表現し、副作用を分離します
 */

import type { DrawingStyle } from "./drawing-style";

/**
 * 座標点を表すインターフェース
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 描画コンテキストの設定を適用する
 * @param ctx キャンバスコンテキスト
 * @param drawingStyle 描画スタイル
 * @returns 設定を適用したコンテキスト
 */
export const applyDrawingStyle = (
  ctx: CanvasRenderingContext2D,
  drawingStyle: DrawingStyle,
): CanvasRenderingContext2D => {
  ctx.lineWidth = drawingStyle.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (drawingStyle.isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)"; // 透明度は関係ないが、形式上設定
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = drawingStyle.lineColor;
  }

  return ctx;
};

/**
 * 2点間の中点を計算する
 * @param point1 1つ目の点
 * @param point2 2つ目の点
 * @returns 中点
 */
export const calculateMidPoint = (point1: Point, point2: Point): Point => {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
};

/**
 * 点列を滑らかな曲線として描画する
 * @param ctx キャンバスコンテキスト
 * @param points 描画する点列
 * @param lastPos 最後の描画位置
 * @param midPoint 中間点
 * @returns 更新された最後の位置と中間点
 */
export const drawSmoothLine = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  lastPos: Point,
  midPoint: Point,
): { lastPos: Point; midPoint: Point } => {
  if (points.length === 0) return { lastPos, midPoint };

  let currentLastPos = { ...lastPos };
  let currentMidPoint = { ...midPoint };

  for (const currentPos of points) {
    const newMidPoint = calculateMidPoint(currentLastPos, currentPos);

    ctx.beginPath();
    ctx.moveTo(currentMidPoint.x, currentMidPoint.y);
    ctx.quadraticCurveTo(currentLastPos.x, currentLastPos.y, newMidPoint.x, newMidPoint.y);
    ctx.stroke();

    currentLastPos = currentPos;
    currentMidPoint = newMidPoint;
  }

  return { lastPos: currentLastPos, midPoint: currentMidPoint };
};

/**
 * キャンバスをクリアする
 * @param ctx キャンバスコンテキスト
 * @param width キャンバスの幅
 * @param height キャンバスの高さ
 */
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  ctx.clearRect(0, 0, width, height);
};

/**
 * キャンバスのサイズを親要素に合わせて調整する
 * @param canvas キャンバス要素
 * @param drawingStyle 描画スタイル
 * @returns リサイズされたかどうか
 */
export const resizeCanvasToParent = (
  canvas: HTMLCanvasElement,
  drawingStyle: DrawingStyle,
): boolean => {
  const parent = canvas.parentElement;
  if (!parent) return false;

  const { width, height } = parent.getBoundingClientRect();
  if (canvas.width === width && canvas.height === height) return false;

  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  // 現在の描画内容を保存
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // キャンバスサイズ変更
  canvas.width = width;
  canvas.height = height;

  // 描画内容を復元
  ctx.putImageData(imageData, 0, 0);

  // 描画スタイルを再設定
  applyDrawingStyle(ctx, drawingStyle);

  return true;
};

/**
 * 指定されたポインタータイプが許可されているかチェックする
 * @param type ポインタータイプ
 * @param penOnly ペンのみモードかどうか
 * @returns 許可されているかどうか
 */
export const isAllowedPointerType = (type: string, penOnly: boolean): boolean => {
  const allowedTypes = penOnly ? ["pen"] : ["pen", "mouse", "touch"];
  return allowedTypes.includes(type);
};

# 「なぞり」プロジェクト技術ドキュメント

## アプリケーション概要

「なぞり」は、Next.jsとReactを使用したシンプルな描画キャンバスアプリケーションです。ユーザーはペン、マウス、タッチを使って自由に絵や文字を描くことができます。

## 技術スタック

- **フロントエンド**:
  - Next.js 15.1.7 (React 19)
  - TypeScript
  - Tailwind CSS 4.0.8
  - shadcn/ui (Radix UIベース)
  - Lucide React (アイコン)

- **開発ツール**:
  - Biome (リンター・フォーマッター)
  - ESLint
  - Bun (パッケージマネージャー)
  - Turbopack (開発サーバー)

## アーキテクチャ

プロジェクトは、以下のような構造に基づいて設計されています：

1. **コンポーネント指向**: 機能ごとにコンポーネントを分割し、再利用性と保守性を高めています。
2. **フィーチャーベース**: 関連する機能はまとめて管理し、機能の追加や変更を容易にしています。
3. **クライアントサイド中心**: Next.jsのクライアントコンポーネントを使用して、インタラクティブな描画体験を提供しています。

## 主要コンポーネント解説

### 1. 描画キャンバス (`src/features/drawing-canvas/index.tsx`)

アプリケーションの中核となるコンポーネントで、HTML5 Canvasを使用して描画機能を実装しています。

**主要機能**:

- **ポインターイベント処理**: ペン、マウス、タッチ入力に対応
- **描画処理**: 滑らかな線を描画するための二次ベジェ曲線の実装
- **履歴管理**: 描画履歴の保存と「元に戻す」機能の実装
- **リサイズ対応**: キャンバスのリサイズ時にも描画内容を保持

**実装のポイント**:
```typescript
// 滑らかな線を描画するための二次ベジェ曲線の実装
const onPointerMove = (e: PointerEvent) => {
  const ctx = canvasRef.current?.getContext("2d");
  if (!ctx || !isDrawingRef.current || !isAllowedPointerType(e.pointerType)) return;
  const currentPos = { x: e.offsetX, y: e.offsetY };
  const newMidPoint = {
    x: (lastPosRef.current.x + currentPos.x) / 2,
    y: (lastPosRef.current.y + currentPos.y) / 2,
  };
  ctx.beginPath();
  ctx.moveTo(midPointRef.current.x, midPointRef.current.y);
  ctx.quadraticCurveTo(
    lastPosRef.current.x,
    lastPosRef.current.y,
    newMidPoint.x,
    newMidPoint.y,
  );
  ctx.stroke();
  lastPosRef.current = currentPos;
  midPointRef.current = newMidPoint;
};
```

### 2. 線スタイル設定 (`src/features/drawing-canvas/line-style.ts`)

描画線の色や太さなどのスタイル設定を管理します。

**主要機能**:
- 線の色設定（黒、赤、青、緑、黄色）
- 線の太さ設定（細い、普通、太い、極太）

```typescript
export const ColorOptions = {
  black: { key: "black", name: "くろ", value: "#000000", lightness: "dark" },
  red: { key: "red", name: "あか", value: "#FF0000", lightness: "dark" },
  blue: { key: "blue", name: "あお", value: "#0000FF", lightness: "dark" },
  green: { key: "green", name: "みどり", value: "#008000", lightness: "dark" },
  yellow: { key: "yellow", name: "きいろ", value: "#FFFF00", lightness: "light" },
};

export const WidthOptions = {
  thin: { key: "thin", name: "ほそい", value: 2 },
  medium: { key: "medium", name: "ふつう", value: 4 },
  thick: { key: "thick", name: "ふとい", value: 6 },
  extraThick: { key: "extraThick", name: "ごくぶと", value: 12 },
};
```

### 3. UI関連コンポーネント

- **LineColorPicker**: 線の色選択UI
- **LineWidthPicker**: 線の太さ選択UI
- **SaveImageButton**: 描画した内容を画像として保存する機能

## 実装上の考慮点

### パフォーマンス最適化

- **useRef** を使用して不要な再レンダリングを防止
- ポインターイベントの最適化による滑らかな描画体験
- キャンバスのリサイズ処理の最適化

### アクセシビリティ

- 適切なARIAラベルの使用
- キーボード操作のサポート
- 十分なコントラスト比の確保

### レスポンシブ対応

- 様々な画面サイズに対応したレイアウト
- タッチデバイス対応の操作性

## 今後の機能追加予定

1. **描画データの保存機能**: ローカルストレージやIndexedDBを使用して、描画データを保存する機能
2. **画像のインポート機能**: 背景画像をインポートして、その上に描画する機能
3. **複数レイヤーのサポート**: 複数のレイヤーを使用した描画機能
4. **テキスト入力機能**: キャンバス上にテキストを配置する機能
5. **図形描画ツール**: 直線、円、四角形などの基本図形を描画するツール

## 開発のヒント

### キャンバス操作

Canvas APIの理解が重要です。特に以下の点に注意してください：

- `getContext("2d")` メソッドを使用して描画コンテキストを取得
- 線の描画には `beginPath()`, `moveTo()`, `lineTo()`, `stroke()` などのメソッドを使用
- 画像データの操作には `getImageData()` と `putImageData()` を使用

### イベント処理

ポインターイベントの処理に関するヒント：

- `pointerdown`, `pointermove`, `pointerup` イベントを使用することで、マウス、タッチ、ペンの入力を統一的に処理できます
- `e.preventDefault()` を適切に使用して、ブラウザのデフォルト動作を防止しましょう
- `e.pointerType` を確認することで、入力デバイスの種類に応じた処理が可能です

## トラブルシューティング

### 描画がぎこちない場合

滑らかな線を描画するために、二次ベジェ曲線を使用しています。もし描画がぎこちない場合は、以下を確認してください：

1. ポインターイベントが適切に処理されているか
2. `quadraticCurveTo()` メソッドが正しいパラメータで呼び出されているか
3. 中間点の計算が正確か

### リサイズ後に描画内容が消える場合

キャンバスのリサイズ時には、以下の手順で描画内容を保持する必要があります：

1. 現在の描画内容を一時的なキャンバスに保存
2. メインキャンバスのサイズを変更
3. 一時的なキャンバスから描画内容をメインキャンバスに復元

## 参考リソース

- [HTML Canvas API ドキュメント](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [React ドキュメント](https://reactjs.org/docs/getting-started.html)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs/)

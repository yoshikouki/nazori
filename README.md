# なぞり

手書きの絵や文字を描くためのシンプルなウェブアプリケーションです。

## 概要

「なぞり」は、Next.jsとTailwind CSSを使用して構築された、シンプルな描画キャンバスアプリケーションです。ペン、マウス、タッチを使って直感的に描画ができます。

### 主な機能

- マルチデバイス対応（ペン、マウス、タッチ操作）
- カラーピッカー（黒、赤、青、緑、黄色）
- 線の太さ調整（細い、普通、太い、極太）
- 手書き入力のサポート
- 描画履歴（元に戻す機能）
- 画像として保存

## インストール方法

```bash
# リポジトリをクローン
git clone https://github.com/yoshikouki/nazori.git
cd nazori

# 依存関係をインストール
bun install

# 開発サーバーを起動
bun dev
```

ブラウザで [http://localhost:80](http://localhost:80) を開くと、アプリケーションにアクセスできます。

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [React](https://reactjs.org/) - UIライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型付きJavaScript
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [Radix UI](https://www.radix-ui.com/) - アクセシブルなUIコンポーネント
- [Lucide React](https://lucide.dev/) - アイコンライブラリ
- [Biome](https://biomejs.dev/) - リンターとフォーマッター

## プロジェクト構造

```
nazori/
├── src/
│   ├── app/              # Next.jsアプリケーションのルート
│   │   ├── globals.css   # グローバルスタイル
│   │   ├── layout.tsx    # ルートレイアウト
│   │   └── page.tsx      # メインページ
│   ├── components/       # 再利用可能なUIコンポーネント
│   │   └── drawing-canvas/  # 描画キャンバス機能
│   │       ├── index.tsx    # メインの描画コンポーネント
│   │       ├── line-color-picker.tsx  # 色選択コンポーネント
│   │       ├── line-width-picker.tsx  # 線幅選択コンポーネント
│   │       ├── line-style.ts          # 線のスタイル定義
│   │       └── save-image-button.tsx  # 画像保存機能
│   └── lib/              # ユーティリティ関数やフック
├── public/               # 静的ファイル
└── ...                   # 各種設定ファイル
```

## 開発ルール

### コード規約

- TypeScriptの型を適切に使用する
- コンポーネントは機能ごとにディレクトリを分ける
- UIコンポーネントは`src/components`に、機能コンポーネントは`src/features`に配置
- Biomeを使用してコードのフォーマットとリントを行う

### ブランチ管理

- `main`: 安定版ブランチ
- 機能追加は機能ブランチで行い、PRを通してマージする

### コミットメッセージ

コミットメッセージは以下の形式に従う：
```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントの変更
style: コードスタイルの変更
refactor: リファクタリング
test: テストの追加や修正
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

# なぞりプロジェクト：ファイルターゲットルール

このルールファイルでは、プロジェクト内の特定のファイルタイプやディレクトリに対して、どのルールを適用するかを定義します。

## TypeScriptファイル

```glob
**/*.ts
```

```reference
@file .cursor/rules/typescript.md
@file .cursor/rules/general.md
```

## Reactコンポーネントファイル

```glob
**/*.tsx
```

```reference
@file .cursor/rules/next-react.md
@file .cursor/rules/typescript.md
@file .cursor/rules/general.md
```

## 描画キャンバス関連ファイル

```glob
src/features/drawing-canvas/**/*
```

```reference
@file .cursor/rules/drawing-canvas.md
```

## ドキュメントファイル

```glob
**/*.md
```

```reference
@file .cursor/rules/japanese.md
```

## Next.js設定ファイル

```glob
next.config.ts
```

```reference
@file .cursor/rules/next-react.md
```

## スタイリングファイル

```glob
**/*.css
src/app/globals.css
```

```reference
@file .cursor/rules/general.md
```

## 画像ファイル

```glob
public/**/*.{png,jpg,svg,ico}
```

## テストファイル

```glob
**/*.test.{ts,tsx}
```

```reference
@file .cursor/rules/typescript.md
```

## 設定ファイル

```glob
*.json
*.mjs
biome.json
tsconfig.json
```

```reference
@file .cursor/rules/general.md
``` 
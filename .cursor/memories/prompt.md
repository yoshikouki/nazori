---
description: 過去に指摘されたエラーを記録する
globs: *
alwaysApply: true
---

- パッケージマネジャーとして bun を使用する
- テスト実行は `bun run test` を使用する
- useCallback, useMemo は記述しない。React Compiler を使用しているため
- コメントは英語で記述する
- 自明なコメントを削除する (e.g. × `clearHistory(); // Clear history`)

# なぞりプロジェクト - SOLID原則に基づく改修計画

## 現状の評価

### SOLID原則の観点からの分析

#### 1. 単一責任の原則 (Single Responsibility Principle)

事実:
- `drawing-core.ts` は純粋関数を中心に実装されており、描画ロジックに特化している
- `use-canvas.ts` はキャンバス操作のイベント処理に集中している
- `use-drawing-store.ts` はデータの永続化と状態管理を担当している
- `use-drawing-history.ts` は履歴管理に特化している

良い点:
- 機能ごとにファイルが分割されており、各モジュールの責任が比較的明確
- `drawing-core.ts` は副作用を含まない純粋関数で構成されている
- UIコンポーネントとロジックが分離されている

悪い点:
- `index.tsx` の `DrawingCanvas` コンポーネントが多くの責任を持ちすぎている（描画管理、履歴管理、UI状態管理など）
- `use-drawing-store.ts` が描画スタイル、描画履歴、プロファイル管理など複数の責任を持っている
- 一部のコンポーネントで、表示とロジックの分離が不十分

#### 2. オープン・クローズドの原則 (Open/Closed Principle)

事実:
- `drawing-style.ts` で描画スタイルの型と定数が定義されている
- `drawing-core.ts` は汎用的な描画関数を提供している

良い点:
- `drawing-core.ts` の関数は拡張しやすい設計になっている
- 型定義が明確で、拡張性を考慮している

悪い点:
- 新しい描画ツールや機能を追加する際の拡張ポイントが明確でない
- 描画スタイルの拡張方法が限定的

#### 3. リスコフの置換原則 (Liskov Substitution Principle)

事実:
- 継承関係が少なく、主に関数とフックを使用している
- インターフェイスは型定義として明示されている

良い点:
- 型安全性が確保されている
- 関数の入出力が明確に定義されている

悪い点:
- とくに大きな問題は見られない

#### 4. インターフェイス分離の原則 (Interface Segregation Principle)

事実:
- 各コンポーネントは必要なプロパティのみを受け取るように設計されている
- カスタムフックは特定の機能に特化している

良い点:
- コンポーネントのプロパティが必要最小限に保たれている
- フックが特定の機能に集中している

悪い点:
- `DrawingCanvas` が多くの状態と関数を子コンポーネントに渡している
- `useDrawingStore` が大きすぎて、使用する側が不要な機能も含めて依存することになる

#### 5. 依存性逆転の原則 (Dependency Inversion Principle)

事実:
- リポジトリパターンを使用してデータアクセスを抽象化している
- カスタムフックを通じて機能を提供している

良い点:
- データアクセスが抽象化されている
- 依存関係が明示的

悪い点:
- テスト時の依存性注入が難しい構造になっている
- `useDrawingStore` が直接リポジトリに依存しており、モック化が困難

### テスタビリティの観点からの分析

事実:
- テストファイルが存在する (`drawing-core.test.ts`, `index.test.tsx`, `use-canvas.test.tsx`)
- 純粋関数は比較的テストしやすい

良い点:
- `drawing-core.ts` の純粋関数はテストしやすい
- コンポーネントの分離により、単体テストが可能

悪い点:
- 状態管理とUIが密結合しており、単体テストが難しい
- 依存性注入の仕組みが不十分で、モックが困難
- 副作用を含む関数のテストが複雑

## 改修計画

### 1. コンポーネントの責任分離

- `DrawingCanvas` コンポーネントの責任を分割する
- 状態管理とUIを明確に分離する

### 2. 状態管理の改善

- `useDrawingStore` を機能ごとに分割する
  - `useDrawingStyleStore`
  - `useDrawingDataStore`
  - `useProfileStore`
- 依存性注入の仕組みを導入する

### 3. インターフェイスの改善

- 明確なインターフェイスを定義し、実装から分離する
- リポジトリのインターフェイスを定義し、実装を交換可能にする

### 4. テスタビリティの向上

- モック可能な設計に変更する
- 副作用を分離し、テスト可能にする
- テストヘルパーを作成する

### 5. 拡張性の向上

- 新機能追加のための拡張ポイントを明確にする
- プラグイン的な機能追加の仕組みを検討する

## 実施計画

### フェーズ0: ドメインモデルの移行

現在、`src/lib/client-db/index.ts`に定義されているドメインモデルのインターフェースを、機能ディレクトリに移動します。これにより、ドメインモデルとデータアクセス層を分離し、依存性逆転の原則に従った設計にします。

```typescript
// src/features/drawing-canvas/models/profile.ts
export interface Profile {
  id: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/features/drawing-canvas/models/drawing.ts
export interface Drawing {
  id: string;
  profileId: string;
  image: Blob;
  createdAt: Date;
  updatedAt: Date;
}

// src/features/drawing-canvas/models/drawing-history.ts
export interface DrawingHistory {
  id: string;
  profileId: string;
  imageList: Blob[];
  currentIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// src/features/drawing-canvas/models/drawing-style-record.ts
import type { DrawingStyle } from "../drawing-style";

export interface DrawingStyleRecord extends DrawingStyle {
  id: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

その後、`src/lib/client-db/index.ts`を更新して、新しいモデルをインポートするように変更します：

```typescript
// src/lib/client-db/index.ts
import type { Profile } from "@/features/drawing-canvas/models/profile";
import type { Drawing } from "@/features/drawing-canvas/models/drawing";
import type { DrawingHistory } from "@/features/drawing-canvas/models/drawing-history";
import type { DrawingStyleRecord } from "@/features/drawing-canvas/models/drawing-style-record";
import { type DBSchema, openDB } from "idb";
import { ulid } from "ulid";

// 以下のインターフェース定義を削除し、インポートに置き換える
// export interface Profile { ... }
// export interface Drawing { ... }
// export interface DrawingHistory { ... }
// export interface DrawingStyleRecord extends DrawingStyle { ... }

interface NazoriDB extends DBSchema {
  // ... 既存のコード ...
}

// ... 既存のコード ...
```

### フェーズ1: 依存性逆転とコロケーションパターンの適用

#### 1.1 ドメインインターフェイスの定義

```typescript
// src/features/drawing-canvas/interfaces/repositories.ts
import type { Profile } from "../models/profile";
import type { Drawing } from "../models/drawing";
import type { DrawingHistory } from "../models/drawing-history";
import type { DrawingStyleRecord } from "../models/drawing-style-record";
import type { DrawingStyle } from "../drawing-style";

export interface DrawingStyleRepository {
  getByProfileId(profileId: string): Promise<DrawingStyleRecord | null>;
  create(profileId: string, style: DrawingStyle): Promise<DrawingStyleRecord>;
  update(id: string, style: Partial<DrawingStyle>): Promise<DrawingStyleRecord | null>;
}

export interface DrawingRepository {
  getByProfileId(profileId: string): Promise<Drawing[]>;
  getById(id: string): Promise<Drawing | null>;
  create(profileId: string): Promise<Drawing>;
  updateImage(id: string, image: Blob): Promise<Drawing | null>;
  delete(id: string): Promise<boolean>;
}

export interface ProfileRepository {
  getFirst(): Promise<Profile | null>;
  getById(id: string): Promise<Profile | null>;
  create(): Promise<Profile>;
  update(id: string, data: Partial<Profile>): Promise<Profile | null>;
}

export interface DrawingHistoryRepository {
  getByProfileId(profileId: string): Promise<DrawingHistory | null>;
  getById(id: string): Promise<DrawingHistory | null>;
  create(profileId: string): Promise<DrawingHistory>;
  addImage(id: string, image: Blob): Promise<DrawingHistory | null>;
  undo(id: string): Promise<DrawingHistory | null>;
  redo(id: string): Promise<DrawingHistory | null>;
  clear(id: string): Promise<DrawingHistory | null>;
}
```

#### 1.2 状態管理フックの分割

```typescript
// src/features/drawing-canvas/stores/use-drawing-style-store.ts
import type { DrawingStyle } from "../drawing-style";
import type { DrawingStyleRepository } from "../interfaces/repositories";

export interface DrawingStyleStore {
  drawingStyle: DrawingStyle;
  updateDrawingStyle: (newStyle: Partial<DrawingStyle>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDrawingStyleStore = (
  repository: DrawingStyleRepository,
  profileId: string | null
): DrawingStyleStore => {
  // 実装...
};

// src/features/drawing-canvas/stores/use-drawing-data-store.ts
import type { Drawing } from "../models/drawing";
import type { DrawingRepository } from "../interfaces/repositories";

export interface DrawingDataStore {
  drawings: Drawing[];
  currentDrawingId: string | null;
  createDrawing: () => Promise<Drawing | undefined>;
  updateCurrentDrawing: (image: Blob) => Promise<Drawing | undefined>;
  selectDrawing: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useDrawingDataStore = (
  repository: DrawingRepository,
  profileId: string | null
): DrawingDataStore => {
  // 実装...
};

// src/features/drawing-canvas/stores/use-profile-store.ts
import type { Profile } from "../models/profile";
import type { ProfileRepository } from "../interfaces/repositories";

export interface ProfileStore {
  currentProfile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProfileStore = (
  repository: ProfileRepository
): ProfileStore => {
  // 実装...
};
```

#### 1.3 コンテキストプロバイダーの作成

```typescript
// src/features/drawing-canvas/contexts/drawing-context.tsx
import { createContext, useContext } from "react";
import type { DrawingStyle } from "../drawing-style";
import type { Drawing } from "../models/drawing";
import type {
  DrawingStyleRepository,
  DrawingRepository,
  ProfileRepository,
  DrawingHistoryRepository
} from "../interfaces/repositories";

export interface DrawingContextValue {
  drawingStyle: DrawingStyle;
  updateDrawingStyle: (newStyle: Partial<DrawingStyle>) => Promise<void>;
  drawings: Drawing[];
  currentDrawingId: string | null;
  createDrawing: () => Promise<Drawing | undefined>;
  updateCurrentDrawing: (image: Blob) => Promise<Drawing | undefined>;
  selectDrawing: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export const DrawingContext = createContext<DrawingContextValue | null>(null);

export const DrawingProvider: React.FC<{
  children: React.ReactNode;
  repositories?: {
    drawingStyleRepository?: DrawingStyleRepository;
    drawingRepository?: DrawingRepository;
    profileRepository?: ProfileRepository;
    drawingHistoryRepository?: DrawingHistoryRepository;
  };
}> = ({ children, repositories }) => {
  // 実装...
  
  return (
    <DrawingContext.Provider value={contextValue}>
      {children}
    </DrawingContext.Provider>
  );
};

export const useDrawingContext = (): DrawingContextValue => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawingContext must be used within a DrawingProvider');
  }
  return context;
};
```

### フェーズ2: リポジトリ実装のアダプター作成

#### 2.1 リポジトリアダプターの実装

```typescript
// src/features/drawing-canvas/adapters/drawing-style-repository-adapter.ts
import { drawingStyleRepository as dbRepository } from "@/lib/client-db/repositories";
import type { DrawingStyleRepository } from "../interfaces/repositories";
import type { DrawingStyle } from "../drawing-style";
import type { DrawingStyleRecord } from "../models/drawing-style-record";

export class DrawingStyleRepositoryAdapter implements DrawingStyleRepository {
  async getByProfileId(profileId: string) {
    const result = await dbRepository.getByProfileId(profileId);
    return result || null;
  }
  
  async create(profileId: string, style: DrawingStyle) {
    return dbRepository.create(profileId, style);
  }
  
  async update(id: string, style: Partial<DrawingStyle>) {
    const result = await dbRepository.update(id, style);
    return result || null;
  }
}

// 他のリポジトリも同様にアダプターを実装
```

#### 2.2 依存性注入のためのファクトリ

```typescript
// src/features/drawing-canvas/adapters/repository-factory.ts
import type {
  DrawingStyleRepository,
  DrawingRepository,
  ProfileRepository,
  DrawingHistoryRepository
} from "../interfaces/repositories";
import { DrawingStyleRepositoryAdapter } from "./drawing-style-repository-adapter";
import { DrawingRepositoryAdapter } from "./drawing-repository-adapter";
import { ProfileRepositoryAdapter } from "./profile-repository-adapter";
import { DrawingHistoryRepositoryAdapter } from "./drawing-history-repository-adapter";

export const createRepositories = (options?: {
  drawingStyleRepository?: DrawingStyleRepository;
  drawingRepository?: DrawingRepository;
  profileRepository?: ProfileRepository;
  drawingHistoryRepository?: DrawingHistoryRepository;
}) => {
  return {
    drawingStyleRepository: options?.drawingStyleRepository ?? new DrawingStyleRepositoryAdapter(),
    drawingRepository: options?.drawingRepository ?? new DrawingRepositoryAdapter(),
    profileRepository: options?.profileRepository ?? new ProfileRepositoryAdapter(),
    drawingHistoryRepository: options?.drawingHistoryRepository ?? new DrawingHistoryRepositoryAdapter(),
  };
};
```

### フェーズ3: コンポーネントのリファクタリング

#### 3.1 DrawingCanvasコンポーネントの分割

```typescript
// src/features/drawing-canvas/index.tsx
import { createRepositories } from "./adapters/repository-factory";
import { DrawingProvider } from "./contexts/drawing-context";
import { DrawingCanvasContent } from "./components/drawing-canvas-content";

export const DrawingCanvas = () => {
  const repositories = createRepositories();
  
  return (
    <DrawingProvider repositories={repositories}>
      <DrawingCanvasContent />
    </DrawingProvider>
  );
};

// src/features/drawing-canvas/components/drawing-canvas-content.tsx
import { useDrawingContext } from "../contexts/drawing-context";

export const DrawingCanvasContent = () => {
  // DrawingContextから状態を取得
  const {
    drawingStyle,
    updateDrawingStyle,
    isLoading,
    drawings,
    createDrawing,
    selectDrawing,
    currentDrawingId,
  } = useDrawingContext();
  
  // 実装...
};
```

### フェーズ4: テストの改善

#### 4.1 テスト用モックの作成

```typescript
// src/features/drawing-canvas/test/mocks/mock-drawing-style-repository.ts
import type { DrawingStyleRepository } from "../../interfaces/repositories";
import type { DrawingStyle } from "../../drawing-style";
import type { DrawingStyleRecord } from "../../models/drawing-style-record";

export class MockDrawingStyleRepository implements DrawingStyleRepository {
  // モック実装...
}

// 他のリポジトリも同様にモック実装
```

#### 4.2 テストヘルパーの作成

```typescript
// src/features/drawing-canvas/test/utils.tsx
import { render } from "@testing-library/react";
import type {
  DrawingStyleRepository,
  DrawingRepository,
  ProfileRepository,
  DrawingHistoryRepository
} from "../interfaces/repositories";
import { DrawingProvider } from "../contexts/drawing-context";

export const renderWithDrawingContext = (
  ui: React.ReactElement,
  options?: {
    repositories?: {
      drawingStyleRepository?: DrawingStyleRepository;
      drawingRepository?: DrawingRepository;
      profileRepository?: ProfileRepository;
      drawingHistoryRepository?: DrawingHistoryRepository;
    };
  }
) => {
  return render(
    <DrawingProvider repositories={options?.repositories}>
      {ui}
    </DrawingProvider>
  );
};
```

## 次のステップ

1. ドメインモデルの移行から着手する ✅
2. ドメインインターフェイスの定義を行う ✅
3. リポジトリアダプターを実装する ✅
4. 状態管理フックを分割する ✅
5. コンポーネントのリファクタリングを行う
6. テストを改善する

## 進捗状況

### フェーズ0: ドメインモデルの移行 (完了)

2024-03-13に完了

- ✅ src/features/drawing-canvas/models/profile.ts を作成
- ✅ src/features/drawing-canvas/models/drawing.ts を作成
- ✅ src/features/drawing-canvas/models/drawing-history.ts を作成
- ✅ src/features/drawing-canvas/models/drawing-style-record.ts を作成
- ✅ src/lib/client-db/index.ts を更新してモデルをインポートするように変更

### フェーズ1: 依存性逆転とコロケーションパターンの適用 (完了)

#### 1.1 ドメインインターフェイスの定義 (完了)

2024-03-13に完了

- ✅ src/features/drawing-canvas/interfaces/repositories.ts を作成
  - ✅ DrawingStyleRepository インターフェイスを定義
  - ✅ DrawingRepository インターフェイスを定義
  - ✅ ProfileRepository インターフェイスを定義
  - ✅ DrawingHistoryRepository インターフェイスを定義

#### 1.2 状態管理フックの分割 (完了)

2024-03-13に完了

- ✅ src/features/drawing-canvas/stores/use-drawing-style-store.ts の作成
- ✅ src/features/drawing-canvas/stores/use-drawing-data-store.ts の作成
- ✅ src/features/drawing-canvas/stores/use-profile-store.ts の作成

#### 1.3 コンテキストプロバイダーの作成 (完了)

2024-03-13に完了

- ✅ src/features/drawing-canvas/contexts/drawing-context.tsx の作成

### フェーズ2: リポジトリ実装のアダプター作成 (完了)

2024-03-13に完了

- ✅ src/features/drawing-canvas/adapters/ ディレクトリ構造の作成
- ✅ リポジトリアダプターの実装
  - ✅ src/features/drawing-canvas/adapters/profile-repository-adapter.ts の作成
  - ✅ src/features/drawing-canvas/adapters/drawing-style-repository-adapter.ts の作成
  - ✅ src/features/drawing-canvas/adapters/drawing-repository-adapter.ts の作成
  - ✅ src/features/drawing-canvas/adapters/drawing-history-repository-adapter.ts の作成
- ✅ 依存性注入のためのファクトリ作成
  - ✅ src/features/drawing-canvas/adapters/repository-factory.ts の作成

### フェーズ3: コンポーネントのリファクタリング (未着手)

- ❌ DrawingCanvasコンポーネントの分割

### フェーズ4: テストの改善 (未着手)

- ❌ テスト用モックの作成
- ❌ テストヘルパーの作成

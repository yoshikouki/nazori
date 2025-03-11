# Feature Improvement Plan

## Current Feature Analysis

### Drawing Canvas

The current Drawing Canvas component has the following structure:

- `index.tsx`: Main Drawing Canvas component (359 lines)
- `use-drawing-store.ts`: Custom hook for managing drawing state (196 lines)
- `use-drawing-history.ts`: Custom hook for managing drawing history (47 lines)
- `drawing-style.ts`: Definition of drawing styles (60 lines)
- `line-color-picker.tsx`: Color picker component (61 lines)
- `line-width-picker.tsx`: Line width picker component (67 lines)
- `save-image-button.tsx`: Save image button component (47 lines)

### Issues

1. **Single Responsibility Principle (SRP) Violation**:
   - `index.tsx` is very long with 359 lines and has multiple responsibilities
   - Drawing logic, UI display, and event handling are mixed

2. **Complex State Management**:
   - Unclear separation of responsibilities between `useDrawingStore` and `useDrawingHistory`
   - History management is done in two places (`useDrawingHistory` and IndexedDB)

3. **Code Duplication**:
   - Canvas operation logic is scattered in multiple places

4. **Low Testability**:
   - Difficult to write unit tests due to unclear separation of responsibilities

5. **Scalability Constraints**:
   - High possibility of needing to change existing code when adding new features

## Improvement Strategies

### Phase 1: Component Responsibility Separation

1. **Split Drawing Canvas Component**:
   - `DrawingCanvas`: Container component for the entire canvas
   - `CanvasArea`: Component specialized in drawing area and canvas operations
   - `ToolBar`: Component for managing drawing tools (color, line width, eraser, etc.)
   - `DrawingDialog`: Component for displaying drawing list dialog

2. **Organize Custom Hooks**:
   - `useCanvas`: Aggregate logic related to canvas operations
   - `useDrawingStore`: Specialize in data persistence
   - `useDrawingHistory`: Specialize in history management

### Phase 2: Refactor Drawing Logic

1. **Separate Drawing Logic with Pure Functions**:
   - Create `drawing-core.ts` module: Define pure functions related to drawing
   - Design functions to express state changes as return values
   - Optimize pointer event handling

2. **Improve State Management**:
   - Use immutable data structures for state updates
   - Separate and clarify side effects

### Phase 3: Improve Data Persistence

1. **Strengthen Integration with IndexedDB**:
   - Abstract data access layer
   - Improve error handling

2. **Unify History Management**:
   - Integrate in-memory history and IndexedDB history

## Implementation Steps

### Batch 1: Component Separation

1. Create `CanvasArea` Component
   - Move canvas element and pointer event handling
   - Create `useCanvas` hook

2. Create `ToolBar` Component
   - Move drawing tool UI
   - Organize tool selection logic

3. Create `DrawingDialog` Component
   - Separate drawing list display dialog

### Batch 2: Improve Drawing Logic

1. Implement `drawing-core.ts` Module
   - Define pure functions related to drawing
   - Design functions with clear input and output
   - Express state changes as return values
   - Optimize pointer event handling

2. Organize Custom Hooks
   - Extend `useCanvas` functionality
   - Clarify responsibilities of `useDrawingStore` and `useDrawingHistory`
   - Remove `useCallback` introduced in Batch 1 (unnecessary due to React Compiler)

### Batch 3: Improve Data Persistence and History Management

1. Abstract Data Access Layer
   - Consider introducing repository pattern

2. Unify History Management
   - Integrate in-memory history and IndexedDB history

## Expected Effects

1. **Improved Code Readability**:
   - Clear separation of responsibilities, reducing the number of lines in each file
   - Easier to understand due to separation of concerns

2. **Improved Maintainability**:
   - Limited impact of changes
   - Easier bug fixes

3. **Improved Scalability**:
   - Minimal changes to existing code when adding new features
   - Loosely coupled design through interfaces

4. **Improved Testability**:
   - Easier to write unit tests
   - Easier to mock

5. **Benefits of Pure Functional Approach**:
   - Predictable behavior and explicit management of side effects
   - Easier debugging and state tracking
   - Reusability and flexibility of functions
   - Improved safety in concurrent processing

## Notes

- Evaluate actual complexity in each phase to avoid over-engineering
- Always consider performance to avoid degrading user experience
- Maintain existing functionality to prevent regression
- Avoid `useCallback` and `useMemo` due to React Compiler usage

## Progress

### 2025-03-06: Batch 1 Completed

Separated component responsibilities and created the following files:

1. `useCanvas.ts` - Custom hook aggregating canvas operation logic
   - Drawing processing
   - Pointer event handling
   - Resize processing

2. `CanvasArea.tsx` - Drawing area component
   - Display canvas element
   - Use `useCanvas` hook

3. `ToolBar.tsx` - Toolbar component
   - Color and line width selection
   - Eraser and pen-only mode switching
   - History operations
   - Save function

4. `DrawingDialog.tsx` - Drawing list display dialog
   - Display drawing list
   - Select drawing
   - Create new drawing

The main `index.tsx` has been simplified to act as a container combining these components. This has clarified the responsibilities of each component, improving code readability and maintainability.

The next step is to further improve drawing logic and optimize state management.

### 2025-03-07: Batch 2 Completed

Refactored drawing logic and made the following improvements:

1. Created `drawing-core.ts` module defining pure functions related to drawing
   - `applyDrawingStyle`: Apply drawing style
   - `calculateMidPoint`: Calculate midpoint
   - `drawSmoothLine`: Draw smooth line
   - `clearCanvas`: Clear canvas
   - `resizeCanvasToParent`: Resize canvas
   - `isAllowedPointerType`: Determine pointer type

2. Refactored `useCanvas.ts` to use pure functions
   - Moved drawing logic to `drawing-core.ts`
   - Separated state management and side effects

3. Replaced drawing style application logic in `CanvasArea.tsx` with pure functions

4. Improved history management in `useDrawingHistory.ts`
   - Timestamped history entries
   - Limited maximum history count
   - Added history clear function
   - Separated database save logic

These changes have resulted in the following benefits:

- **Separation of Concerns**: Clear separation of drawing logic and state management
- **Improved Reusability**: Easier to reuse functions with pure functions
- **Testability**: Pure functions are easier to test with clear input and output
- **Code Readability**: Clear responsibilities for each function, making code easier to understand
- **Improved Maintainability**: Limited impact of changes

The next step is to further improve data persistence and history management.

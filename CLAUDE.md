# Nazori Development Guide

## Build Commands
- `bun run dev` - Start dev server (Turbopack, port 80)
- `bun run build` - Build production bundle
- `bun run start` - Start production server

## Lint/Format Commands
- `bun run lint` - Run Biome linter
- `bun run format` - Format with Biome (safe)
- `bun run format:unsafe` - Format with Biome (all changes)

## Test Commands
- `bun run test` - Run all Vitest tests
- `bun run test:unit` - Run unit tests only
- `bun run test:chrome` - Run Chrome browser tests
- Run single test: `bun run vitest path/to/file.test.ts`
- Filter tests: `bun run vitest -t "test name" path/to/file`

## Code Style
- TypeScript with strict typing
- React functional components with hooks
- Feature-based organization in `src/features/`
- 2-space indentation, 96 char line width, double quotes
- Components: PascalCase
- Variables/functions: camelCase
- Path alias: `@/*` maps to `./src/*`
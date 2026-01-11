# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Build, Lint, and Test Commands

### Development Commands

- `npm run build` - Build the TypeScript source files using Rollup
- `npm run build:dev` - Build with inline sourcemaps for debugging
- `npm run build:watch` - Build and watch for changes (development mode)

### Linting Commands

- `npm run lint` - Run ESLint with auto-fix and Prettier formatting
- `npm run lint:check` - Check linting without auto-fixing

### Testing Commands

- `npm test` - Run tests in watch mode (Vitest)
- `npm run test:watch` - Run tests in watch mode (alias for npm test)
- `npm run test:run` - Run all tests once without watch mode

### Running Single Tests

To run a single test file:

```bash
npm run test:run src/utilities/directory.test.ts
```

To run tests matching a pattern:

```bash
npm run test:run -- -g "directory utilities"
```

## Code Style Guidelines

### TypeScript Configuration

- Target: ESNext
- Module: ESNext
- Strict mode enabled
- Module resolution: Node
- Source files located in `src/` directory

### Import Style

- Use ES6 import/export syntax
- Import external libraries first, then internal modules
- Use named imports when possible
- Example:

```typescript
import fs from "fs";
import path from "node:path";
import { Image } from "./types/image";
import { processInfoTemplate } from "./utilities/info-template";
```

### Formatting (Prettier)

- Tab width: 2 spaces
- Use spaces, not tabs
- Run `npm run lint` to auto-format

### Naming Conventions

- **Files**: kebab-case for utilities (e.g., `directory.ts`), PascalCase for main modules
- **Variables**: camelCase
- **Functions**: camelCase, descriptive names
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase, descriptive names
- **Enums**: PascalCase

### Error Handling

- Use try-catch blocks for file system operations
- Log errors using `console.error()` or `Log.error()` for MagicMirror logging
- Return null or undefined for expected failures
- Throw exceptions for unexpected errors
- Example:

```typescript
try {
  const result = fs.readFileSync(filePath);
  return result;
} catch (err: any) {
  if (err?.code !== "ENOENT") {
    console.error("Error reading file:", err);
  }
  return null;
}
```

### Type Safety

- Use TypeScript interfaces for all data structures
- Prefer explicit type annotations over inference
- Use Pick<T, K> for selecting specific properties
- Use union types for limited value sets
- Example:

```typescript
export type DateFormat = "MM/DD/YYYY" | "DD.MM.YYYY" | "YYYY-MM-DD";

export type ModulConfig = {
  photoDir: string;
  backupDir?: string;
  // ... other properties
};
```

### MagicMirror Module Patterns

- Use `Module.register()` for main module files
- Use `NodeHelper.create()` for node helper files
- Follow MagicMirror's socket notification pattern
- Use `Log.info()`, `Log.debug()`, `Log.error()` for logging
- Example:

```typescript
Module.register("MMM-Random-local-image", {
  defaults: {
    // default configuration
  },

  start: function () {
    Log.info(`Module ${this.name} started...`);
  },

  socketNotificationReceived: function (notification, payload) {
    // handle notifications
  },
});
```

### Testing Guidelines

- Use Vitest as the test framework
- Use memfs for file system mocking
- Structure tests with describe/it blocks
- Use beforeEach/afterEach for setup/teardown
- Mock external dependencies
- Example:

```typescript
import { describe, expect, it, vi } from "vitest";
import { vol } from "memfs";

describe("directory utilities", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("should handle directory operations", () => {
    // test implementation
  });
});
```

### File Organization

- `src/types/` - TypeScript interfaces and type definitions
- `src/utilities/` - Helper functions and utilities
- `src/MMM-Random-local-image.ts` - Main MagicMirror module
- `src/node_helper.ts` - Node helper for backend operations
- Test files should be co-located with source files using `.test.ts` suffix

### Git Workflow

- This is a MagicMirror module repository
- Main branch is `master`
- Use conventional commit messages
- Build runs automatically on postinstall

### Dependencies

- Main dependencies: `mime-types`, `recursive-readdir`
- Dev dependencies: TypeScript, ESLint, Prettier, Vitest, Rollup
- Use `npm ci` for clean installs in CI/CD

### MagicMirror Integration

- Module name: "MMM-Random-local-image"
- Supports both images and videos
- Uses socket notifications for client-server communication
- Handles media chunks for large directories
- Supports subdirectory selection and backup directories

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MMM-Random-local-image is a MagicMirror module that displays random images and videos from local directories. It's written in TypeScript and compiled to JavaScript for use in the MagicMirror framework.

## Build & Development Commands

```bash
# Install dependencies
npm ci

# Build (TypeScript → JavaScript via Rollup)
npm run build

# Build with inline source maps
npm run build:dev

# Build in watch mode
npm run build:watch

# Run tests
npm test              # Watch mode
npm run test:run      # Single run

# Lint and format (using Biome)
npm run lint          # Auto-fix
npm run lint:check    # Check only
npm run format        # Same as lint
```

## Architecture

### Build System

The module uses **Rollup** to compile two separate entry points:

1. **Frontend** (`src/MMM-Random-local-image.ts` → `MMM-Random-local-image.js`):
   - IIFE format for browser
   - Uses CommonJS and Node resolve plugins
   - Registers with MagicMirror's `Module.register()` API

2. **Backend** (`src/node_helper.ts` → `node_helper.js`):
   - UMD format for Node.js
   - Node helper for file system operations
   - Created via `NodeHelper.create()` from MagicMirror

### Communication Pattern

The module uses **socket notifications** for frontend-backend communication:

- Frontend sends `GET_IMAGES` → Backend processes files
- Backend sends `MEDIA_CHUNK` → Frontend displays images
- Images are sent in **chunks of 50** to avoid memory issues with large directories

### Directory Structure

```
src/
├── MMM-Random-local-image.ts    # Frontend module (DOM, intervals, UI)
├── node_helper.ts               # Backend helper (file system, image processing)
├── backend/                     # Node.js-specific code
│   ├── directory.ts            # Directory scanning and subdirectory selection
│   ├── file.ts                 # File type detection (images/videos)
│   ├── path.ts                 # Path resolution
│   ├── backend-error.ts        # Error type guard
│   └── errors/                 # Custom error classes with image generation
├── frontend/                    # Browser-specific code
│   ├── shuffle.ts              # Fisher-Yates shuffle for random order
│   ├── info-template.ts        # Template rendering for image metadata
│   └── node-js-error.ts        # Error types
├── types/                       # TypeScript definitions
│   ├── config.ts               # Module configuration types
│   ├── image.ts                # Image/video data types
│   └── socket-notification.ts  # Communication protocol
└── utilities/
    └── error-image-generator.ts # SVG → PNG error image generation
```

### Error Handling Strategy

When media loading fails, the backend generates **visual error images** (PNG data URIs) using Sharp:

- Custom error classes extend base error with `generateErrorImage()` method
- Each error type (NoMediaFilesError, DirectoryReadError, BackupDirNotFoundError) creates a specific SVG
- SVG includes warning icon, error title, message, technical details, and help text
- Sharp converts SVG to PNG and encodes as base64 data URI
- Error image is sent to frontend as a regular image chunk

**Error types:**
- `BackupDirNotFoundError`: Both photoDir and backupDir are empty/missing
- `DirectoryReadError`: File system read failure
- `NoMediaFilesError`: No valid image/video files found
- `FileProcessingError`: Individual file processing failure

### Key Features & Implementation

**Backup Directory Fallback:**
- If `photoDir` is empty/unavailable, module tries `backupDir`
- Automatically retries `photoDir` every 60 seconds when using backup
- Useful for NFS mount scenarios where connection may be temporarily down

**Subdirectory Selection:**
- When `selectFromSubdirectories: true`, picks a random subdirectory
- Subdirectories are filtered by `ignoreDirRegex`
- Changes subdirectory every `photoLoadUpdateInterval` (default: 12 hours)
- Optimizes performance for large photo collections organized by year/event

**Random Order:**
- Uses Fisher-Yates shuffle algorithm
- Images are shuffled per chunk and removed after display
- When all images shown, automatically reloads

**Info Template System:**
- Supports placeholders: `{{date}}`, `{{currentCount}}`, `{{totalCount}}`
- Date formatting: `DD.MM.YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`
- Implemented in `frontend/info-template.ts`

## Testing

- **Framework:** Vitest with Node environment
- **Mock filesystem:** Uses `memfs` for file system mocking
- Test files: `*.test.ts` files alongside source code
- Setup file: `vitest.setup.ts`

## Code Style

- **Formatter/Linter:** Biome (replaces ESLint + Prettier)
- **Indentation:** 2 spaces
- **Quotes:** Double quotes
- **Import organization:** Auto-organized by Biome
- Run `npm run lint` before committing

## Important Notes

- **Module context:** This runs inside MagicMirror, which provides global `Module`, `Log`, and `NodeHelper`
- **File paths:** All paths in config are relative to MagicMirror root directory, not this module
- **MIME types:** Uses `mime-types` package to detect image/video files
- **Sharp dependency:** Required for error image generation; handles SVG → PNG conversion
- **Chunked loading:** Critical for large directories (thousands of images); prevents memory issues

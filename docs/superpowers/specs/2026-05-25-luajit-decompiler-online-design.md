# LuaJIT Decompiler Online Design

**Date:** 2026-05-25
**Project:** luajit-decompiler-online

## Overview

A pure web application for decompiling LuaJIT bytecode (.lua/.luac files) using a WebAssembly module. Users can select a folder, browse files in a tree structure, and view decompiled Lua source code in Monaco Editor.

## Tech Stack

- **Build:** Vite 5.x
- **Framework:** Vue 3 (Composition API)
- **Styling:** Tailwind CSS 3.x
- **Editor:** Monaco Editor (via vite-plugin-monaco-editor)
- **WASM:** luajit-decompiler-v2-wasi.wasm (WASI target)

## Browser Compatibility

- **Primary:** Chrome/Edge 86+ (File System Access API)
- **Fallback:** Firefox/Safari (drag-and-drop upload only)

## Architecture

### Components

1. **FolderTree.vue** - Left panel folder tree
   - Recursive rendering of directory structure
   - Expand/collapse directories
   - Different icons for .lua, .luac, and directory

2. **CodeViewer.vue** - Right panel Monaco Editor
   - Read-only mode
   - Lua syntax highlighting
   - Shows decompiled result or raw content

3. **DropZone.vue** - Drag-and-drop area
   - Accepts folder or file drops
   - Visual feedback on dragover

4. **App.vue** - Main layout
   - Top toolbar with project name
   - Split panel: left tree + right editor

### Data Flow

```
User selects directory → showDirectoryPicker() → get directory Handle
         ↓
Traverse directory → build file tree structure
         ↓
User clicks file → getFile() → read as ArrayBuffer
         ↓
Call WASM decompile → process(ArrayBuffer) → get Lua source
         ↓
Display in Monaco Editor
```

## Features

- [x] Folder selection via button (File System Access API)
- [x] Drag-and-drop folder upload (with File System Access API)
- [x] Recursive folder tree display
- [x] Click-to-decompile (all file types)
- [x] Monaco Editor with Lua syntax highlighting
- [x] WASM loading indicator
- [x] Error handling with inline messages

## GitHub Actions Deployment

```yaml
- name: Deploy
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./public
```

## File Structure

```
/
├── public/
│   └── luajit-decompiler-v2-wasi.wasm  (copied during build)
├── src/
│   ├── components/
│   │   ├── FolderTree.vue
│   │   ├── CodeViewer.vue
│   │   └── DropZone.vue
│   ├── composables/
│   │   ├── useFileSystem.ts
│   │   └── useWasmDecompiler.ts
│   ├── utils/
│   │   └── buildFileTree.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── .github/workflows/deploy.yml
```

## TODO

- [ ] Initialize Vite + Vue 3 project
- [ ] Configure Tailwind CSS
- [ ] Install and configure Monaco Editor
- [ ] Copy WASM file to public/
- [ ] Implement file tree utilities
- [ ] Implement WASM decompiler composable
- [ ] Build FolderTree component
- [ ] Build CodeViewer component
- [ ] Build DropZone component
- [ ] Build main App layout
- [ ] Create GitHub Actions workflow
- [ ] Test and deploy
# LuaJIT 反编译器在线版

一款功能强大的基于浏览器的 LuaJIT 字节码反编译器，完全运行在客户端，使用 WebAssembly 技术。无需服务器 —— 直接在浏览器中反编译您的 `.luac` 文件，配有现代化、直观的界面。

![演示](resources/luajit-decompiler-online-demo.png)

## 功能特点

- **100% 客户端运行**：所有处理都在浏览器中使用 WebAssembly（Wasmer）完成，不会向任何服务器发送数据。
- **文件夹浏览**：打开本地文件夹，通过树形视图浏览项目结构。
- **拖放支持**：直接将文件夹或文件拖放到界面上。
- **文件类型检测**：自动检测 Lua 字节码与 Lua 源代码文件。
- **语法高亮**：使用 Monaco Editor 和 Lua 语法高亮显示专业代码。
- **媒体预览**：内置图片、音频和视频文件预览功能。
- **状态栏**：实时显示文件信息，包括大小、编码、行数及反编译状态。
- **现代化界面**：使用 Vue 3、Tailwind CSS 和 TypeScript 构建的精美毛玻璃效果设计界面。

## 工作原理

反编译器使用运行在 [Wasmer](https://wasmer.io/) WebAssembly 运行时上的 [LuaJIT](https://luajit.org/)：

1. LuaJIT 字节码文件（`.luac`）通过 Wasmer 的 WASIX 功能加载到虚拟文件系统
2. 调用 LuaJIT 的字节码转储模式将 `.luac` 转换回 Lua 源代码
3. 将反编译后的 Lua 源代码以语法高亮方式显示

## 技术栈

- **前端框架**：Vue 3, TypeScript, Tailwind CSS
- **代码编辑器**：Monaco Editor
- **WebAssembly 运行时**：Wasmer SDK
- **构建工具**：Vite

## 快速开始

### 前置要求

- Node.js 18+ 和 npm

### 安装

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

在浏览器中打开 http://localhost:5173。

### 构建

```bash
npm run build
```

构建后的文件将位于 `dist/` 目录。

### GitHub Pages 构建

用于部署到 GitHub Pages 子目录：

```bash
npm run build:github
```

## 使用方法

1. **打开文件夹**：点击"打开文件夹"按钮，选择包含 Lua 文件的本地目录。
2. **浏览文件**：在左侧面板的文件树中导航。
3. **查看反编译代码**：点击任意 `.luac` 文件查看其反编译后的 Lua 源代码。
4. **文件预览**：非 Lua 文件直接在浏览器中预览（图片、音频、视频）。

## 支持的文件类型

| 文件类型 | 说明 | 操作 |
|---------|------|------|
| `.luac` | LuaJIT 字节码 | 尝试反编译为 Lua 源代码 |
| `.lua` | Lua 源代码 | 直接显示 |
| 图片 | PNG、JPG、GIF、WebP、SVG | 在浏览器中预览 |
| 音频 | MP3、WAV、OGG | 音频播放器 |
| 视频 | MP4、WebM | 视频播放器 |
| 其他 | 任何其他文件类型 | 十六进制视图显示原始数据 |

## 隐私保护

所有文件处理都在您的浏览器中完全完成。**不会有任何文件被上传到服务器。** 您的字节码和源代码绝不会离开您的设备。

## 浏览器兼容性

- Chrome 89+
- Firefox 79+
- Safari 15.2+
- Edge 89+

需要支持以下功能：
- WebAssembly
- WebAssembly SIMD
- File System Access API（用于文件夹浏览）

## 许可证

MIT 许可证

版权所有 (c) 2026 liudonghua123

## 相关项目

- [LuaJIT](https://luajit.org/) - 底层 Lua 即时编译器
- [Wasmer](https://wasmer.io/) - 用于在浏览器中运行 LuaJIT 的 WebAssembly 运行时
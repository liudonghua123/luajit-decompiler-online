// File System Access API types
export type FileSystemHandle = globalThis.FileSystemHandle
export type FileSystemFileHandle = globalThis.FileSystemFileHandle
export type FileSystemDirectoryHandle = globalThis.FileSystemDirectoryHandle

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
  handle?: FileSystemDirectoryHandle | FileSystemFileHandle
}

export interface DecompileResult {
  success: boolean
  output: string
  error?: string
}

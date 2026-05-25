// File System Access API type augmentations
// These augment the global types for browsers that support the File System Access API

declare global {
  // Ensure the native types are available
  interface DataTransferItem {
    getAsFileSystemHandle(): Promise<FileSystemHandle | null>
  }

  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
  }
}

// Re-export the types that may be missing from some TypeScript configurations
export type { FileSystemHandle, FileSystemFileHandle, FileSystemDirectoryHandle }
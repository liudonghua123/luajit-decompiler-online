import { ref } from 'vue'
import type { FileNode } from '../types'
import { buildFileTree } from '../utils/buildFileTree'

// File System Access API type augmentation for TypeScript
// The File System Access API is not fully typed in TypeScript's DOM lib,
// so we need type assertions when using certain methods.
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>
  }
  interface DataTransferItem {
    getAsFileSystemHandle(): Promise<FileSystemFileHandle | FileSystemDirectoryHandle | null>
  }
}

export function useFileSystem() {
  const rootHandle = ref<FileSystemDirectoryHandle | null>(null)
  const fileTree = ref<FileNode[]>([])
  const projectName = ref('')

  const isSupported = 'showDirectoryPicker' in window

  async function selectFolder(): Promise<boolean> {
    try {
      rootHandle.value = await window.showDirectoryPicker()
      projectName.value = rootHandle.value.name
      fileTree.value = await buildFileTree(rootHandle.value)
      return true
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Failed to select folder:', e)
      }
      return false
    }
  }

  async function handleDrop(dataTransfer: DataTransfer): Promise<boolean> {
    const item = dataTransfer.items[0]
    if (!item) return false

    try {
      const handle = await item.getAsFileSystemHandle()
      if (handle && handle.kind === 'directory') {
        const dirHandle = handle as FileSystemDirectoryHandle
        rootHandle.value = dirHandle
        projectName.value = dirHandle.name
        fileTree.value = await buildFileTree(dirHandle)
        return true
      }
    } catch (e) {
      console.error('Failed to handle drop:', e)
    }
    return false
  }

  async function readFile(
    fileHandle: FileSystemFileHandle
  ): Promise<ArrayBuffer | null> {
    try {
      const file = await fileHandle.getFile()
      return await file.arrayBuffer()
    } catch (e) {
      console.error('Failed to read file:', e)
      return null
    }
  }

  function clearProject() {
    rootHandle.value = null
    fileTree.value = []
    projectName.value = ''
  }

  async function getFileInfo(fileHandle: FileSystemFileHandle): Promise<{ size: number; encoding: string; modified?: Date; lastModified?: number } | null> {
    try {
      const file = await fileHandle.getFile()
      return {
        size: file.size,
        encoding: 'UTF-8',
        modified: file.lastModified ? new Date(file.lastModified) : undefined,
        lastModified: file.lastModified
      }
    } catch (e) {
      console.error('Failed to get file info:', e)
      return null
    }
  }

  return {
    rootHandle,
    fileTree,
    projectName,
    isSupported,
    selectFolder,
    handleDrop,
    readFile,
    clearProject,
    getFileInfo
  }
}
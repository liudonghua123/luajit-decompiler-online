import type { FileNode } from '../types'

// File System Access API type augmentation
declare global {
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>
  }
}

export async function buildFileTree(
  dirHandle: FileSystemDirectoryHandle,
  path = ''
): Promise<FileNode[]> {
  const nodes: FileNode[] = []

  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name

    if (entry.kind === 'directory') {
      const subHandle = await dirHandle.getDirectoryHandle(entry.name)
      const children = await buildFileTree(subHandle, entryPath)
      nodes.push({
        name: entry.name,
        path: entryPath,
        isDirectory: true,
        children,
        handle: subHandle
      })
    } else {
      nodes.push({
        name: entry.name,
        path: entryPath,
        isDirectory: false,
        handle: entry
      })
    }
  }

  // Sort: directories first, then alphabetically
  return nodes.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1
    if (!a.isDirectory && b.isDirectory) return 1
    return a.name.localeCompare(b.name)
  })
}

export async function findFileInTree(
  nodes: FileNode[],
  path: string
): Promise<FileNode | null> {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = await findFileInTree(node.children, path)
      if (found) return found
    }
  }
  return null
}
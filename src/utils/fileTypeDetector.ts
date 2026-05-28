export type FileCategory = 'lua' | 'text' | 'audio' | 'video' | 'image' | 'binary'

export interface FileTypeResult {
  category: FileCategory
  mimeType: string
  description: string
}

const MAGIC_BYTES: Array<{ bytes: number[]; mask?: number[]; category: FileCategory; mimeType: string; description: string }> = [
  // Lua Bytecode (ESC + "Lua")
  { bytes: [0x1b, 0x4c, 0x75, 0x61], category: 'lua', mimeType: 'application/x-luac', description: 'Lua Bytecode' },
  // JPEG
  { bytes: [0xff, 0xd8, 0xff], category: 'image', mimeType: 'image/jpeg', description: 'JPEG Image' },
  // PNG
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], category: 'image', mimeType: 'image/png', description: 'PNG Image' },
  // GIF
  { bytes: [0x47, 0x49, 0x46, 0x38], category: 'image', mimeType: 'image/gif', description: 'GIF Image' },
  // WebP
  { bytes: [0x52, 0x49, 0x46, 0x46], mask: [0xff, 0xff, 0xff, 0xff], category: 'image', mimeType: 'image/webp', description: 'WebP Image' },
  // MP3 (ID3)
  { bytes: [0x49, 0x44, 0x33], category: 'audio', mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  // MP3 (no ID3)
  { bytes: [0xff, 0xfb], category: 'audio', mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  // WAV
  { bytes: [0x52, 0x49, 0x46, 0x46], mask: [0xff, 0xff, 0xff, 0xff], category: 'audio', mimeType: 'audio/wav', description: 'WAV Audio' },
  // FLAC
  { bytes: [0x66, 0x4c, 0x61, 0x43], category: 'audio', mimeType: 'audio/flac', description: 'FLAC Audio' },
  // MP4 - partial match, need more context
  { bytes: [0x00, 0x00, 0x00], category: 'video', mimeType: 'video/mp4', description: 'MP4 Video' },
  // AVI
  { bytes: [0x52, 0x49, 0x46, 0x46], mask: [0xff, 0xff, 0xff, 0xff], category: 'video', mimeType: 'video/x-msvideo', description: 'AVI Video' },
  // WebM
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], category: 'video', mimeType: 'video/webm', description: 'WebM Video' },
]

export function detectFileType(buffer: ArrayBuffer, filename: string): FileTypeResult {
  const ext = filename.toLowerCase().split('.').pop() || ''

  // Check by extension first
  if (ext === 'lua' || ext === 'luac') {
    const data = new Uint8Array(buffer)
    // Check magic bytes for luac
    if (ext === 'luac' || (data.length >= 4 && data[0] === 0x1b && data[1] === 0x4c && data[2] === 0x75 && data[3] === 0x61)) {
      return { category: 'lua', mimeType: 'application/x-luac', description: 'Lua Bytecode' }
    }
    return { category: 'lua', mimeType: 'text/x-lua', description: 'Lua Source' }
  }

  // Check magic bytes
  const data = new Uint8Array(buffer.slice(0, 16))

  for (const magic of MAGIC_BYTES) {
    const matches = magic.bytes.every((byte, i) => {
      const mask = magic.mask?.[i] ?? 0xff
      return (data[i] & mask) === (byte & mask)
    })
    if (matches) {
      return { category: magic.category, mimeType: magic.mimeType, description: magic.description }
    }
  }

  // Check if it's readable as text (UTF-8 or ASCII)
  let isText = true
  let nullCount = 0
  for (let i = 0; i < Math.min(data.length, 512); i++) {
    if (data[i] === 0) {
      nullCount++
      if (nullCount > 2) {
        isText = false
        break
      }
    }
    if (data[i] < 32 && data[i] !== 9 && data[i] !== 10 && data[i] !== 13) {
      isText = false
      break
    }
  }

  if (isText) {
    return { category: 'text', mimeType: 'text/plain', description: 'Text File' }
  }

  return { category: 'binary', mimeType: 'application/octet-stream', description: 'Binary File' }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
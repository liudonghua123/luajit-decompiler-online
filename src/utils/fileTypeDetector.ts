export type FileCategory = 'lua' | 'text' | 'audio' | 'video' | 'image' | 'binary'

export interface FileTypeResult {
  category: FileCategory
  mimeType: string
  description: string
}

// Magic bytes constants
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46] // 'RIFF'
const RIFF_WAVE = [0x57, 0x41, 0x56, 0x45] // 'WAVE' at offset 8
const RIFF_AVI = [0x41, 0x56, 0x49, 0x20]  // 'AVI ' at offset 8
const RIFF_WEBP = [0x57, 0x45, 0x42, 0x50] // 'WEBP' at offset 8
const MP4_FTYP = [0x66, 0x74, 0x79, 0x70] // 'ftyp' at offset 4

const MAGIC_BYTES: Array<{ bytes: number[]; mask?: number[]; category: FileCategory; mimeType: string; description: string; offset?: number }> = [
  // Lua Bytecode (ESC + "Lua")
  { bytes: [0x1b, 0x4c, 0x75, 0x61], category: 'lua', mimeType: 'application/x-luac', description: 'Lua Bytecode' },
  // JPEG
  { bytes: [0xff, 0xd8, 0xff], category: 'image', mimeType: 'image/jpeg', description: 'JPEG Image' },
  // PNG
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], category: 'image', mimeType: 'image/png', description: 'PNG Image' },
  // GIF
  { bytes: [0x47, 0x49, 0x46, 0x38], category: 'image', mimeType: 'image/gif', description: 'GIF Image' },
  // MP3 (ID3)
  { bytes: [0x49, 0x44, 0x33], category: 'audio', mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  // MP3 (no ID3)
  { bytes: [0xff, 0xfb], category: 'audio', mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  // FLAC
  { bytes: [0x66, 0x4c, 0x61, 0x43], category: 'audio', mimeType: 'audio/flac', description: 'FLAC Audio' },
  // WebM
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], category: 'video', mimeType: 'video/webm', description: 'WebM Video' },
]

function bytesMatch(data: Uint8Array, pattern: number[], offset: number, mask?: number[]): boolean {
  if (offset + pattern.length > data.length) return false
  for (let i = 0; i < pattern.length; i++) {
    const m = mask?.[i] ?? 0xff
    if ((data[offset + i] & m) !== (pattern[i] & m)) {
      return false
    }
  }
  return true
}

export function detectFileType(buffer: ArrayBuffer, filename: string): FileTypeResult {
  const ext = filename.toLowerCase().split('.').pop() || ''
  const data = new Uint8Array(buffer.slice(0, 16))

  // Check by extension first
  if (ext === 'lua' || ext === 'luac') {
    // Check magic bytes for luac
    if (ext === 'luac' || bytesMatch(data, [0x1b, 0x4c, 0x75, 0x61], 0)) {
      return { category: 'lua', mimeType: 'application/x-luac', description: 'Lua Bytecode' }
    }
    return { category: 'lua', mimeType: 'text/x-lua', description: 'Lua Source' }
  }

  // Check for RIFF-based formats first (WAV, AVI, WebP)
  if (bytesMatch(data, RIFF_SIGNATURE, 0)) {
    if (bytesMatch(data, RIFF_WAVE, 8)) {
      return { category: 'audio', mimeType: 'audio/wav', description: 'WAV Audio' }
    }
    if (bytesMatch(data, RIFF_AVI, 8)) {
      return { category: 'video', mimeType: 'video/x-msvideo', description: 'AVI Video' }
    }
    if (bytesMatch(data, RIFF_WEBP, 8)) {
      return { category: 'image', mimeType: 'image/webp', description: 'WebP Image' }
    }
  }

  // Check for MP4 (ftyp box at offset 4)
  if (data.length >= 12 && bytesMatch(data, MP4_FTYP, 4)) {
    return { category: 'video', mimeType: 'video/mp4', description: 'MP4 Video' }
  }

  // Check other magic bytes
  for (const magic of MAGIC_BYTES) {
    if (bytesMatch(data, magic.bytes, 0, magic.mask)) {
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
import { ref } from 'vue'
import type { DecompileResult } from '../types'
import WASI from '@wasmer/wasi'
import { WasmFs } from '@wasmer/wasmfs'

export function useWasmDecompiler() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let wasi: WASI | null = null
  let wasmFs: WasmFs | null = null

  async function initWasm() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/luajit-decompiler-v2-wasi.wasm')
      const buffer = await response.arrayBuffer()
      const bytes = new Uint8Array(buffer)

      console.log('[WASM] Loading WASM module, bytes:', bytes.length)

      // Create filesystem
      wasmFs = new WasmFs()
      console.log('[WASM] Created WasmFs')

      // Create WASI instance
      wasi = new WASI({
        args: ['-'],
        env: {},
        bindings: {
          hrtime: () => BigInt(Date.now()) * BigInt(1000000),
          exit: (code: number) => console.log('[WASM] Exit called with code:', code),
          kill: () => console.log('[WASM] Kill called'),
          randomFillSync: <T>(buffer: T, offset: number, size: number): T => {
            if (buffer instanceof Uint8Array) {
              for (let i = offset; i < offset + size; i++) {
                if (i < buffer.length) {
                  buffer[i] = Math.floor(Math.random() * 256)
                }
              }
            }
            return buffer
          },
          isTTY: () => false,
          fs: wasmFs.fs,
          path: {}
        },
        preopens: {}
      })
      console.log('[WASM] Created WASI instance')

      // Get imports
      const imports = wasi.getImports(new WebAssembly.Module(bytes.buffer as ArrayBuffer))
      console.log('[WASM] Got imports, namespaces:', Object.keys(imports))

      // Instantiate
      const result = await WebAssembly.instantiate(bytes.buffer as ArrayBuffer, imports)
      console.log('[WASM] Instantiated, exports:', Object.keys(result.instance.exports))

      wasi.setMemory(result.instance.exports.memory as WebAssembly.Memory)

      // Start
      try {
        console.log('[WASM] Starting...')
        wasi.start(result.instance)
        console.log('[WASM] Started successfully (no exception)')
      } catch (e) {
        console.log('[WASM] Start threw exception (expected):', e)
      }
    } catch (e) {
      error.value = `Failed to load WASM: ${e}`
      console.error('[WASM] Load error:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function decompile(buffer: ArrayBuffer): Promise<DecompileResult> {
    console.log('[DECOMPILE] Starting decompile, input size:', buffer.byteLength)

    if (!wasi || !wasmFs) {
      console.log('[DECOMPILE] WASM not initialized, calling initWasm')
      await initWasm()
    }

    if (!wasi || !wasmFs) {
      return { success: false, output: '', error: 'WASM not loaded' }
    }

    try {
      const response = await fetch('/luajit-decompiler-v2-wasi.wasm')
      const wasmBuffer = await response.arrayBuffer()
      const wasmBytes = new Uint8Array(wasmBuffer)

      console.log('[DECOMPILE] Creating new WasmFs instance')
      const newWasmFs = new WasmFs()

      // Write input to stdin
      console.log('[DECOMPILE] Writing', buffer.byteLength, 'bytes to /dev/stdin')
      newWasmFs.fs.writeFileSync('/dev/stdin', new Uint8Array(buffer))
      console.log('[DECOMPILE] Written to stdin')

      const newWasi = new WASI({
        args: ['-'],
        env: {},
        bindings: {
          hrtime: () => BigInt(Date.now()) * BigInt(1000000),
          exit: (code: number) => console.log('[DECOMPILE] Exit called with code:', code),
          kill: () => console.log('[DECOMPILE] Kill called'),
          randomFillSync: <T>(buffer: T, offset: number, size: number): T => {
            if (buffer instanceof Uint8Array) {
              for (let i = offset; i < offset + size; i++) {
                if (i < buffer.length) {
                  buffer[i] = Math.floor(Math.random() * 256)
                }
              }
            }
            return buffer
          },
          isTTY: () => false,
          fs: newWasmFs.fs,
          path: {}
        },
        preopens: {}
      })
      console.log('[DECOMPILE] Created new WASI instance')

      // Get imports
      const imports = newWasi.getImports(new WebAssembly.Module(wasmBytes.buffer as ArrayBuffer))
      console.log('[DECOMPILE] Got imports, namespaces:', Object.keys(imports))

      // Instantiate
      const result = await WebAssembly.instantiate(wasmBytes.buffer as ArrayBuffer, imports)
      console.log('[DECOMPILE] Instantiated, exports:', Object.keys(result.instance.exports))

      newWasi.setMemory(result.instance.exports.memory as WebAssembly.Memory)

      // Start - reads from stdin, writes to stdout
      console.log('[DECOMPILE] Starting WASM with stdin input...')
      try {
        newWasi.start(result.instance)
        console.log('[DECOMPILE] Start completed without exception')
      } catch (e) {
        console.log('[DECOMPILE] Start exception (expected):', e)
      }

      // Get stdout from wasmFs
      console.log('[DECOMPILE] Getting stdout from WasmFs')
      const stdout = await newWasmFs.getStdOut()
      console.log('[DECOMPILE] Raw stdout:', stdout)
      console.log('[DECOMPILE] Stdout type:', typeof stdout)
      const output = stdout ? String(stdout) : ''
      console.log('[DECOMPILE] Output string:', output.substring(0, 200))

      if (output) {
        return { success: true, output }
      }

      return {
        success: false,
        output: '',
        error: 'No output captured. Check console for debug logs.'
      }
    } catch (e) {
      console.error('[DECOMPILE] Error:', e)
      return { success: false, output: '', error: String(e) }
    }
  }

  return {
    isLoading,
    error,
    initWasm,
    decompile
  }
}
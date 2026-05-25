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

      // Create filesystem
      wasmFs = new WasmFs()

      // Create WASI instance
      wasi = new WASI({
        args: [],
        env: {},
        bindings: {
          hrtime: () => BigInt(Date.now()) * BigInt(1000000),
          exit: (code: number) => console.log('WASI exit:', code),
          kill: () => {},
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

      // Get imports
      const imports = wasi.getImports(new WebAssembly.Module(bytes.buffer as ArrayBuffer))

      // Instantiate
      const result = await WebAssembly.instantiate(bytes.buffer as ArrayBuffer, imports)
      wasi.setMemory(result.instance.exports.memory as WebAssembly.Memory)

      // Start - this will run and read from stdin
      try {
        wasi.start(result.instance)
      } catch (e) {
        // Expected - WASI programs exit
      }
    } catch (e) {
      error.value = `Failed to load WASM: ${e}`
      console.error('WASM load error:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function decompile(buffer: ArrayBuffer): Promise<DecompileResult> {
    if (!wasi || !wasmFs) {
      await initWasm()
    }

    if (!wasi || !wasmFs) {
      return { success: false, output: '', error: 'WASM not loaded' }
    }

    try {
      const response = await fetch('/luajit-decompiler-v2-wasi.wasm')
      const wasmBuffer = await response.arrayBuffer()
      const wasmBytes = new Uint8Array(wasmBuffer)

      // Create new WASI instance for each decompile
      const newWasmFs = new WasmFs()

      // Write input to stdin as sync (use sync method directly)
      newWasmFs.fs.writeFileSync('/dev/stdin', new Uint8Array(buffer))

      const newWasi = new WASI({
        args: [],
        env: {},
        bindings: {
          hrtime: () => BigInt(Date.now()) * BigInt(1000000),
          exit: (code: number) => console.log('WASI exit:', code),
          kill: () => {},
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

      // Get imports
      const imports = newWasi.getImports(new WebAssembly.Module(wasmBytes.buffer as ArrayBuffer))

      // Instantiate
      const result = await WebAssembly.instantiate(wasmBytes.buffer as ArrayBuffer, imports)
      newWasi.setMemory(result.instance.exports.memory as WebAssembly.Memory)

      // Start - reads from stdin, writes to stdout
      try {
        newWasi.start(result.instance)
      } catch (e) {
        // Expected - WASI programs exit
      }

      // Get stdout from wasmFs
      const stdout = await newWasmFs.getStdOut()
      const output = stdout ? String(stdout) : ''

      if (output) {
        return { success: true, output }
      }

      return {
        success: false,
        output: '',
        error: 'No output captured'
      }
    } catch (e) {
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
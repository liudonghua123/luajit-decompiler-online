import { ref } from 'vue'
import type { DecompileResult } from '../types'
import WASI from '@wasmer/wasi'
import { WasmFs } from '@wasmer/wasmfs'

export function useWasmDecompiler() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let wasmModule: WebAssembly.Instance | null = null
  let wasi: WASI | null = null

  // Capture stdout
  let outputBuffer = ''

  async function initWasm() {
    if (wasmModule) return

    isLoading.value = true
    error.value = null
    outputBuffer = ''

    try {
      const response = await fetch('/luajit-decompiler-v2-wasi.wasm')
      const buffer = await response.arrayBuffer()
      const bytes = new Uint8Array(buffer)

      // Create filesystem
      const wasmFs = new WasmFs()

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
      wasmModule = result.instance
      wasi.setMemory(wasmModule.exports.memory as WebAssembly.Memory)

      // Start
      try {
        wasi.start(wasmModule)
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
    outputBuffer = ''

    if (!wasmModule || !wasi) {
      await initWasm()
    }

    if (!wasmModule || !wasi) {
      return { success: false, output: '', error: 'WASM not loaded' }
    }

    try {
      const exports = wasmModule.exports

      // If there's a decompile function, call it
      if (typeof exports.decompile === 'function') {
        const input = new Uint8Array(buffer)
        const mem = new Uint8Array((wasi.memory as WebAssembly.Memory).buffer)
        const inputPtr = 4096

        mem.set(input, inputPtr)

        try {
          (exports.decompile as Function)(inputPtr, input.length)
        } catch (e) {
          // Expected
        }

        // Try to get stdout from wasmFs
        const wasmFs = (wasi as any).bindings?.fs
        if (wasmFs?.getStdOut) {
          const stdout = await wasmFs.getStdOut()
          if (stdout) {
            outputBuffer = String(stdout)
          }
        }
      }

      if (outputBuffer) {
        return { success: true, output: outputBuffer }
      }

      const availableExports = Object.keys(exports).filter(k => typeof exports[k] === 'function')
      return {
        success: false,
        output: '',
        error: 'No output captured. Available: ' + availableExports.join(', ')
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
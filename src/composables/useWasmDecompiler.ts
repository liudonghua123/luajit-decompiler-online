import { ref } from 'vue'
import type { DecompileResult } from '../types'
import { init, runWasix, initializeLogger  } from '@wasmer/sdk'
import wasmerSDKModule from "@wasmer/sdk/wasm-inline";

export function useWasmDecompiler() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let modulePromise: Promise<WebAssembly.Module> | null = null

  async function getModule(): Promise<WebAssembly.Module> {
    if (!modulePromise) {
      await init({ module: wasmerSDKModule }); // This uses the inline wasmer SDK version
      initializeLogger("debug")
      modulePromise = WebAssembly.compileStreaming(
        fetch('/luajit-decompiler-v2-wasi.wasm')
      )
    }
    return modulePromise
  }

  async function decompile(buffer: ArrayBuffer): Promise<DecompileResult> {
    console.log('[DECOMPILE] Starting decompile, input size:', buffer.byteLength)
    isLoading.value = true
    error.value = null

    try {
      const module = await getModule()
      const inputData = new Uint8Array(buffer)

      console.log('[DECOMPILE] Creating WASM instance with virtual filesystem...')
      const instance = await runWasix(module, {
        args: ['/input/input.luac'],
        mount: {
          '/input': {
            'input.luac': inputData
          }
        }
      })
      console.log('[DECOMPILE] Instance created, waiting for completion...')
      const result = await instance.wait()

      if (result.ok) {
        const output = result.stdout
        console.log('[DECOMPILE] Success, output length:', output.length)
        return { success: true, output }
      } else {
        console.log('[DECOMPILE] Process failed with code:', result.code)
        return {
          success: false,
          output: '',
          error: `Process exited with code ${result.code}\n${result.stderr}`
        }
      }
    } catch (e) {
      console.error('[DECOMPILE] Error:', e)
      error.value = String(e)
      return { success: false, output: '', error: String(e) }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    decompile
  }
}
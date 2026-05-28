import { ref } from 'vue'
import type { DecompileResult } from '../types'
import { init, runWasix, initializeLogger  } from '@wasmer/sdk'
import wasmUrl from "@wasmer/sdk/wasm?url";
import sdkUrl from "@wasmer/sdk?url";

const BASE_URL = import.meta.env.BASE_URL || '/'
const WASM_PATH = `${BASE_URL}luajit-decompiler-v2-wasi.wasm`

export function useWasmDecompiler() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let modulePromise: Promise<WebAssembly.Module> | null = null

  async function getModule(): Promise<WebAssembly.Module> {
    if (!modulePromise) {
      // the sdkUrl need to be full url, or you will got error like "Failed to resolve module specifier '/assets/index-DgoQWoIK.mjs'"
      await init({ module: `${BASE_URL}${wasmUrl.replace(/^\//, '')}`, sdkUrl: new URL(`${BASE_URL}${sdkUrl.replace(/^\//, '')}`, window.location.origin).href })
      initializeLogger("debug")
      modulePromise = WebAssembly.compileStreaming(
        fetch(WASM_PATH)
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
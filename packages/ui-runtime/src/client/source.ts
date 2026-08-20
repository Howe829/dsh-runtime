/** Observable Remote snapshot with single-flight refresh and open-only polling. */

import type { RuntimeExplorerSnapshot } from '@deepseek-ai/dsh-api-remotes/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'

const SUPPORTED_SCHEMA_VERSION = 3

/** Current browser view of the Host snapshot request lifecycle. */
export interface RuntimeSourceSnapshot {
  readonly data: RuntimeExplorerSnapshot | undefined
  readonly loading: boolean
  readonly error: string | undefined
}

/** Observable runtime snapshot source controlled by overlay visibility. */
export interface RuntimeSource extends HostObservable<RuntimeSourceSnapshot> {
  refresh(): void
  setActive(active: boolean): void
  dispose(): void
}

/**
 * Build the browser source over the generated Remote call.
 * @param read - Invoke the mounted runtimeExplorer snapshot Remote.
 * @param onError - Report a failed read without exposing transport detail in product copy.
 * @returns An observable source with single-flight refresh and visible-only polling.
 */
export function createRuntimeSource(
  read: () => Promise<RuntimeExplorerSnapshot>,
  onError: (error: unknown) => void,
): RuntimeSource {
  const listeners = new Set<() => void>()
  let snapshot: RuntimeSourceSnapshot = { data: undefined, loading: false, error: undefined }
  let inFlight: Promise<void> | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let active = false
  let disposed = false

  const publish = (next: RuntimeSourceSnapshot): void => {
    snapshot = next
    for (const listener of [...listeners]) listener()
  }
  const clearTimer = (): void => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }
  const schedule = (delay: number): void => {
    clearTimer()
    if (!active || disposed) return
    timer = setTimeout(() => { source.refresh() }, delay)
  }
  const source: RuntimeSource = {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    refresh: () => {
      if (disposed || inFlight !== undefined) return
      publish({ ...snapshot, loading: snapshot.data === undefined, error: undefined })
      inFlight = read().then(
        (data) => {
          if (disposed) return
          if (data.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
            const error = new Error('unsupported runtime snapshot schema')
            onError(error)
            publish({ ...snapshot, loading: false, error: error.message })
            return
          }
          publish({ data, loading: false, error: undefined })
          schedule(data.refreshIntervalMs)
        },
        (error: unknown) => {
          if (disposed) return
          onError(error)
          publish({ ...snapshot, loading: false, error: error instanceof Error ? error.message : 'runtime snapshot failed' })
        },
      ).then(() => { inFlight = undefined })
    },
    setActive: (next) => {
      active = next
      if (active) source.refresh()
      else clearTimer()
    },
    dispose: () => {
      disposed = true
      active = false
      clearTimer()
      listeners.clear()
    },
  }
  return source
}

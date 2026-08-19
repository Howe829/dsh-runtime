import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RuntimeExplorerSnapshot } from '@deepseek-ai/dsh-api-remotes/client'
import { createRuntimeSource } from '../src/client/source.ts'

const snapshot = (observedAt: number, refreshIntervalMs = 500): RuntimeExplorerSnapshot => ({
  profile: 'fixture-web',
  observedAt,
  refreshIntervalMs,
  graph: { nodes: [], edges: [] },
  trace: [],
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('runtime Remote source', () => {
  it('single-flights an open refresh, publishes its result, polls at the Host cadence, and stops when hidden', async () => {
    vi.useFakeTimers()
    const first = Promise.withResolvers<RuntimeExplorerSnapshot>()
    const read = vi.fn<() => Promise<RuntimeExplorerSnapshot>>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue(snapshot(2))
    const source = createRuntimeSource(read, vi.fn())
    const listener = vi.fn()
    const off = source.subscribe(listener)

    source.setActive(true)
    source.refresh()
    expect(read).toHaveBeenCalledOnce()
    expect(source.getSnapshot()).toEqual({ data: undefined, loading: true, error: undefined })
    first.resolve(snapshot(1))
    await first.promise
    await Promise.resolve()
    expect(source.getSnapshot().data?.observedAt).toBe(1)

    await vi.advanceTimersByTimeAsync(500)
    expect(read).toHaveBeenCalledTimes(2)
    expect(source.getSnapshot().data?.observedAt).toBe(2)
    source.setActive(false)
    await vi.advanceTimersByTimeAsync(1000)
    expect(read).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalled()
    off()
    source.dispose()
  })

  it('keeps the previous snapshot on failure, reports the error, and ignores a late result after disposal', async () => {
    const report = vi.fn()
    const read = vi.fn<() => Promise<RuntimeExplorerSnapshot>>()
      .mockResolvedValueOnce(snapshot(1))
      .mockRejectedValueOnce(new Error('wire unavailable'))
    const source = createRuntimeSource(read, report)
    source.refresh()
    await vi.waitFor(() => { expect(source.getSnapshot().data?.observedAt).toBe(1) })
    source.refresh()
    await vi.waitFor(() => { expect(source.getSnapshot().error).toBe('wire unavailable') })
    expect(source.getSnapshot().data?.observedAt).toBe(1)
    expect(report).toHaveBeenCalledOnce()

    const late = Promise.withResolvers<RuntimeExplorerSnapshot>()
    const pending = createRuntimeSource(() => late.promise, vi.fn())
    const listener = vi.fn()
    pending.subscribe(listener)
    pending.refresh()
    listener.mockClear()
    pending.dispose()
    late.resolve(snapshot(3))
    await late.promise
    await Promise.resolve()
    expect(listener).not.toHaveBeenCalled()
    expect(pending.getSnapshot().data).toBeUndefined()
    pending.setActive(true)
    pending.refresh()

    const lateFailure = Promise.withResolvers<RuntimeExplorerSnapshot>()
    const disposedFailure = createRuntimeSource(() => lateFailure.promise, report)
    disposedFailure.refresh()
    disposedFailure.dispose()
    lateFailure.reject(new Error('late wire failure'))
    await lateFailure.promise.catch(() => undefined)
    await Promise.resolve()
    expect(report).toHaveBeenCalledOnce()
  })

  it('normalizes a non-Error rejection without scheduling a retry', async () => {
    const read = vi.fn<() => Promise<RuntimeExplorerSnapshot>>().mockRejectedValue('offline')
    const source = createRuntimeSource(read, vi.fn())
    source.setActive(true)
    await vi.waitFor(() => { expect(source.getSnapshot().error).toBe('runtime snapshot failed') })
    source.setActive(false)
  })
})

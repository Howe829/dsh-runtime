// @vitest-environment jsdom
import { Context, Service } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { RuntimeAction } from '../src/client/RuntimeAction.tsx'
import { RuntimeExplorer } from '../src/client/RuntimeExplorer.tsx'
import type { RuntimeExplorerFace } from '../src/client/faces.ts'
import type { RuntimeActionFace } from '../src/client/faces.ts'
import { apply, inject } from '../src/client/index.ts'
import { apply as applyNode } from '../src/index.ts'

afterEach(cleanup)

const SNAPSHOT = {
  schemaVersion: 5,
  bootId: 'fixture-boot',
  snapshotSeq: 1,
  profile: 'fixture-web',
  observedAt: 1,
  refreshIntervalMs: 1000,
  overview: {
    status: 'running', uptimeMs: 1_000,
    contexts: 1, plugins: 0, fibers: 0, turns: 0,
    active: 0, effects: 0, events: 0, errors: 0,
    loaderBreakdown: { total: 0, statuses: { pending: 0, active: 0, disposed: 0, failed: 0 }, byType: [] },
    fiberBreakdown: { total: 0, statuses: { pending: 0, active: 0, disposed: 0, failed: 0 }, byType: [] },
    serviceBreakdown: {
      total: 0, implementations: 0,
      statuses: { pending: 0, active: 0, disposed: 0, failed: 0 }, byType: [],
    },
  },
  effectActivity: {
    windowMs: 300_000, availableSince: 1, complete: true, droppedTransitions: 0,
    current: 0, created: 0, disposed: 0, delta: 0, churn: 0, plugins: [], recent: [],
  },
  graph: { nodes: [], edges: [], services: [], serviceRelations: [] },
  trace: [],
  capabilities: {
    fiberInstances: false,
    ownershipEdges: false,
    scopes: false,
    lifecycleTransitions: true,
    turnPluginAttribution: false,
    eventDispatch: 'none',
    payloadCapture: false,
  },
  limits: { transitionLimit: 4096, traceEventLimit: 256 },
}

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.provide('locale', new LocaleRuntime(ctx))
  class RemoteService extends Service {
    constructor(serviceCtx: Context) { super(serviceCtx, 'remote') }
  }
  new RemoteService(ctx)
  const snapshot = vi.fn().mockResolvedValue({ ok: true, value: SNAPSHOT })
  ctx.provide('remote.runtimeExplorer', { snapshot })
  return { ctx, slots: ctx.get('slots') as SlotRegistry, snapshot }
}

function declare(slots: SlotRegistry): () => void {
  return slots.register({
    name: 'root',
    children: {
      'sidebar.footer.action': { kind: 'list', scope: 'root' },
      'shell.overlay': { kind: 'list', scope: 'root' },
    },
  } as never, () => null)
}

describe('ui-runtime browser plugin', () => {
  it('keeps the Node half as an inert plugin entrypoint', () => {
    expect(() => { applyNode() }).not.toThrow()
  })

  it('registers both real DSH seats, reads lazily, and removes both contributions on unload', async () => {
    expect(inject).toEqual(['slots', 'locale', 'remote', 'remote.runtimeExplorer'])
    const b = await bench()
    declare(b.slots)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    const action = b.slots.entries('sidebar.footer.action')[0]!
    const overlay = b.slots.entries('shell.overlay')[0]!
    expect(action.options).toMatchObject({ id: 'dsh-runtime', order: 80 })
    expect(action.component).toBe(RuntimeAction)
    expect(overlay.options).toMatchObject({ id: 'dsh-runtime', order: 80 })
    expect(overlay.component).toBe(RuntimeExplorer)
    expect(b.snapshot).not.toHaveBeenCalled()

    const actionFace = (action.inject as unknown as () => RuntimeActionFace)()
    actionFace.onVisibilityChange(false)
    const face = (overlay.inject as unknown as () => RuntimeExplorerFace)()
    face.onVisibilityChange(true)
    await vi.waitFor(() => { expect(b.snapshot).toHaveBeenCalledOnce() })
    await vi.waitFor(() => { expect(face.hooks.runtime.getSnapshot().data).toEqual(SNAPSHOT) })
    face.onRefresh()
    await vi.waitFor(() => { expect(b.snapshot).toHaveBeenCalledTimes(2) })
    face.onVisibilityChange(false)

    await fiber.dispose()
    expect(b.slots.entries('sidebar.footer.action')).toHaveLength(0)
    expect(b.slots.entries('shell.overlay')).toHaveLength(0)
    await b.ctx.fiber.dispose()
  })

  it('waits for late slot declarations and re-registers after declarer replacement', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries('sidebar.footer.action')).toHaveLength(0)
    const stop = declare(b.slots)
    await vi.waitFor(() => { expect(b.slots.entries('shell.overlay')).toHaveLength(1) })
    stop()
    expect(b.slots.entries('shell.overlay')).toHaveLength(0)
    declare(b.slots)
    await vi.waitFor(() => { expect(b.slots.entries('sidebar.footer.action')).toHaveLength(1) })
    await b.ctx.fiber.dispose()
  })

  it('surfaces a failed Remote envelope through the bounded browser source error state', async () => {
    const b = await bench()
    b.snapshot.mockResolvedValue({
      ok: false,
      error: { code: 'RUNTIME_UNAVAILABLE', message: 'snapshot unavailable' },
    })
    declare(b.slots)
    const report = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const overlay = b.slots.entries('shell.overlay')[0]!
    const face = (overlay.inject as unknown as () => RuntimeExplorerFace)()
    face.onVisibilityChange(true)
    await vi.waitFor(() => {
      expect(face.hooks.runtime.getSnapshot().error).toContain('RUNTIME_UNAVAILABLE')
    })
    expect(report).toHaveBeenCalledOnce()
    await b.ctx.fiber.dispose()
  })
})

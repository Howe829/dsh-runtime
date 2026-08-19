// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-test-runtime'
import type { RuntimeExplorerSnapshot } from '@deepseek-ai/dsh-api-remotes/client'
import { RuntimeAction, type RuntimeActionProps } from '../src/client/RuntimeAction.tsx'
import { RuntimeExplorer, type RuntimeExplorerProps } from '../src/client/RuntimeExplorer.tsx'
import { en, type RuntimeLocaleKey } from '../src/client/locales.ts'
import { createRuntimeStore } from '../src/client/store.ts'
import type { RuntimeSourceSnapshot } from '../src/client/source.ts'

afterEach(cleanup)

const t = ((key: RuntimeLocaleKey): string => en[key]) as RuntimeExplorerProps['t']

const DATA: RuntimeExplorerSnapshot = {
  profile: 'fixture-web',
  observedAt: 100,
  refreshIntervalMs: 1500,
  graph: {
    nodes: [
      {
        id: 'provider', entryId: 'provider-entry', moduleName: '@fixture/provider', label: 'provider',
        enabled: true, phase: 'active', provides: ['llm'], injects: [], missing: [],
        effects: ['provide llm'], effectCount: 1,
      },
      {
        id: 'consumer', entryId: 'consumer-entry', moduleName: '@fixture/consumer', label: 'consumer',
        enabled: true, phase: 'pending', provides: [], injects: ['llm', 'tools'], missing: ['tools'],
        effects: [], effectCount: 0,
      },
      {
        id: 'unmounted', entryId: 'unmounted-entry', moduleName: '@fixture/unmounted', label: 'unmounted',
        enabled: false, phase: null, provides: [], injects: [], missing: [],
        effects: [], effectCount: 0,
      },
    ],
    edges: [{ source: 'consumer', target: 'provider', services: ['llm'] }],
  },
  trace: [
    {
      id: 'session:1', sessionId: 'session', type: 'turn/start', seq: 1, time: 100,
      lane: 'agent', payloadChars: 12, turn: 1,
    },
    {
      id: 'session:2', sessionId: 'session', type: 'user/message', seq: 2, time: 105,
      lane: 'user', payloadChars: 42, turn: 1,
    },
    {
      id: 'session:3', sessionId: 'session', type: 'step/start', seq: 3, time: 110,
      lane: 'agent', payloadChars: 16, turn: 1, step: 1,
    },
    {
      id: 'session:4', sessionId: 'session', type: 'tool/call', seq: 4, time: 120,
      lane: 'tool', payloadChars: 80, turn: 1, step: 1, callId: 'call-1', name: 'bash',
    },
    {
      id: 'session:5', sessionId: 'session', type: 'turn/end', seq: 5, time: 150,
      lane: 'agent', payloadChars: 20, turn: 1, outcome: 'completed',
    },
    {
      id: 'session:6', sessionId: 'session', type: 'session/title', seq: 6, time: 160,
      lane: 'session', payloadChars: 30,
    },
    {
      id: 'session-b:1', sessionId: 'session-b', type: 'turn/start', seq: 1, time: 200,
      lane: 'agent', payloadChars: 12, turn: 2,
    },
  ],
}

function sourceHook(snapshot: RuntimeSourceSnapshot) {
  return function useRuntime<S>(selector: (state: RuntimeSourceSnapshot) => S): S { return selector(snapshot) }
}

function explorer(snapshot: RuntimeSourceSnapshot = { data: DATA, loading: false, error: undefined }) {
  const store = createRuntimeStore().create()
  store.actions.setOpen(true)
  const onVisibilityChange = vi.fn()
  const onRefresh = vi.fn()
  const props = {
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    useRuntime: sourceHook(snapshot),
    onVisibilityChange,
    onRefresh,
    t,
  } as RuntimeExplorerProps
  const view = render(<RuntimeExplorer {...props} />)
  return { store, onVisibilityChange, onRefresh, view }
}

describe('RuntimeAction', () => {
  it('opens and closes the shared overlay state from the sidebar row and measures the sidebar edge', () => {
    const store = createRuntimeStore().create()
    const onVisibilityChange = vi.fn()
    const props = {
      wide: true,
      useStore: bindSnapshotSelector(store),
      actions: store.actions,
      onVisibilityChange,
      t,
    } as RuntimeActionProps
    render(<RuntimeAction {...props} />)
    const button = screen.getByRole('button', { name: en.open })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true)
    expect(store.getSnapshot().sidebarOffset).toBe(12)
    fireEvent.click(button)
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false)
  })

  it('renders the compact rail entry without the text label', () => {
    const store = createRuntimeStore().create()
    const props = {
      wide: false,
      useStore: bindSnapshotSelector(store),
      actions: store.actions,
      onVisibilityChange: vi.fn(),
      t,
    } as RuntimeActionProps
    const view = render(<RuntimeAction {...props} />)
    expect(view.container.querySelector('button span')).toBeNull()
  })
})

describe('RuntimeExplorer', () => {
  it('filters the real graph projection, selects a plugin, and renders service/effect diagnostics', () => {
    const b = explorer()
    expect(screen.getByRole('heading', { name: en.title })).toBeTruthy()
    expect(screen.getByLabelText(`${en.currentProfile}: fixture-web`).textContent).toBe('Profilefixture-web')
    expect(screen.getByRole('img', { name: en.graphLabel })).toBeTruthy()
    const summary = within(screen.getByLabelText(en.pluginSummary))
    expect(summary.getByText(en.pending).nextElementSibling?.textContent).toBe('1')
    expect(summary.getByText(en.active).nextElementSibling?.textContent).toBe('1')
    expect(summary.getByText(en.disposed).nextElementSibling?.textContent).toBe('1')
    expect(summary.getByText(en.failed).nextElementSibling?.textContent).toBe('0')
    const filter = screen.getByLabelText(en.allStates)
    expect(within(filter).getAllByRole('option').map(option => option.textContent)).toEqual([
      en.allStates, en.pending, en.active, en.disposed, en.failed,
    ])
    const viewport = b.view.container.querySelector('[class*="graphScroller"]') as HTMLDivElement
    viewport.scrollLeft = 90
    viewport.scrollTop = 70
    fireEvent.click(screen.getByRole('button', { name: /consumer/ }))
    expect(viewport.scrollLeft).toBe(0)
    expect(viewport.scrollTop).toBe(0)
    expect(screen.getByText('consumer-entry')).toBeTruthy()
    expect(screen.getAllByText('tools')).toHaveLength(2)
    expect(screen.getByText(en.missing)).toBeTruthy()
    expect(screen.getByRole('button', { name: /provider/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /unmounted/ })).toBeNull()
    expect(screen.getByText(en.focusedNode).parentElement?.textContent).toBe(`${en.focusedNode}consumer`)
    expect(screen.getByText((_, element) => (
      element?.tagName === 'SPAN' && element.textContent === `${en.relatedPlugins} 2 / 3`
    ))).toBeTruthy()
    expect(b.view.container.querySelector('path[data-relation="dependency"]')).toBeTruthy()
    expect(screen.getByText(en.dependencies)).toBeTruthy()
    expect(screen.getByText(en.dependants)).toBeTruthy()
    viewport.scrollLeft = 50
    viewport.scrollTop = 40
    fireEvent.click(screen.getByRole('button', { name: en.closeInspector }))
    expect(viewport.scrollLeft).toBe(0)
    expect(viewport.scrollTop).toBe(0)
    expect(screen.queryByText('consumer-entry')).toBeNull()
    expect(screen.getByRole('button', { name: /unmounted/ })).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText(en.searchGraph), { target: { value: 'provider' } })
    expect(screen.getByRole('button', { name: /provider/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /consumer/ })).toBeNull()
    fireEvent.change(screen.getByLabelText(en.allStates), { target: { value: 'pending' } })
    expect(screen.getByText(en.emptyGraph)).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(en.searchGraph), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(en.allStates), { target: { value: 'disposed' } })
    expect(screen.getByRole('button', { name: /unmounted/ })).toBeTruthy()
    act(() => { b.store.actions.setPhase('all'); b.store.actions.setQuery('') })
  })

  it('keeps graph selection consistent with search and offers an explicit show-all action', () => {
    const b = explorer()
    fireEvent.click(screen.getByRole('button', { name: /consumer/ }))
    expect(b.store.getSnapshot().selection).toEqual({ kind: 'node', id: 'consumer' })
    fireEvent.click(screen.getByRole('button', { name: en.showAll }))
    expect(b.store.getSnapshot().selection).toBeUndefined()
    expect(screen.getByRole('button', { name: /unmounted/ })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /consumer/ }))
    fireEvent.change(screen.getByPlaceholderText(en.searchGraph), { target: { value: 'provider' } })
    expect(b.store.getSnapshot().selection).toBeUndefined()
    expect(screen.queryByText('consumer-entry')).toBeNull()
    expect(screen.queryByRole('button', { name: en.showAll })).toBeNull()
    expect(screen.getByRole('button', { name: /provider/ })).toBeTruthy()
  })

  it('drills from Session-owned Agent Turns into one waterfall and event metadata', () => {
    const b = explorer()
    fireEvent.click(screen.getByRole('button', { name: en.traceTab }))
    const summary = within(screen.getByLabelText(en.traceSummary))
    expect(summary.getByText(en.sessions).nextElementSibling?.textContent).toBe('2')
    expect(summary.getByText(en.agentTurns).nextElementSibling?.textContent).toBe('2')
    expect(summary.getByText(en.runningTurns).nextElementSibling?.textContent).toBe('1')
    expect(screen.getByText(`${en.sessionEvents}: 1`)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: `${en.turn} 1, ${en.turnCompleted}` }))
    expect(b.store.getSnapshot().traceTurnKey).toBe('session:1')
    expect(screen.getByText(en.laneTool)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /tool\/call/ }))
    expect(screen.getByText('call-1')).toBeTruthy()
    expect(screen.getByText(en.privacy)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: en.closeInspector }))
    expect(screen.getByRole('button', { name: en.backToTurns })).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(en.searchTurnTrace), { target: { value: 'missing-event' } })
    expect(screen.getByText(en.emptyTurnTrace)).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(en.searchTurnTrace), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: en.backToTurns }))
    expect(b.store.getSnapshot().traceTurnKey).toBeUndefined()
    fireEvent.change(screen.getByPlaceholderText(en.searchTrace), { target: { value: 'missing-event' } })
    expect(screen.getByText(en.emptyTrace)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: en.graphTab }))
    expect(screen.getByRole('img', { name: en.graphLabel })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: en.refresh }))
    expect(b.onRefresh).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: en.close }))
    expect(b.store.getSnapshot().open).toBe(false)
    expect(b.onVisibilityChange).toHaveBeenCalledWith(false)
  })

  it('zooms the graph through bounded steps and resets the viewport origin', () => {
    const b = explorer()
    const level = screen.getByLabelText(en.zoomLevel)
    const zoomIn = screen.getByRole<HTMLButtonElement>('button', { name: en.zoomIn })
    const zoomOut = screen.getByRole<HTMLButtonElement>('button', { name: en.zoomOut })
    const fitView = screen.getByRole<HTMLButtonElement>('button', { name: en.fitView })
    expect(level.textContent).toBe('100%')
    expect(zoomIn.querySelector('svg')).toBeTruthy()
    expect(zoomOut.querySelector('svg')).toBeTruthy()
    expect(fitView.querySelector('svg')).toBeTruthy()
    expect(zoomIn.textContent).toBe('')
    expect(zoomOut.textContent).toBe('')
    fireEvent.click(zoomIn)
    expect(level.textContent).toBe('120%')
    fireEvent.click(zoomIn)
    expect(level.textContent).toBe('140%')
    expect(zoomIn.disabled).toBe(true)

    const viewport = b.view.container.querySelector('[class*="graphScroller"]') as HTMLDivElement
    viewport.scrollLeft = 90
    viewport.scrollTop = 70
    fireEvent.click(screen.getByRole('button', { name: en.resetZoom }))
    expect(level.textContent).toBe('100%')
    expect(viewport.scrollLeft).toBe(0)
    expect(viewport.scrollTop).toBe(0)

    fireEvent.click(zoomOut)
    fireEvent.click(zoomOut)
    expect(level.textContent).toBe('80%')
    expect(zoomOut.disabled).toBe(true)

    fireEvent.click(zoomIn)
    expect(level.textContent).toBe('100%')
    fireEvent.click(fitView)
    expect(level.textContent).toBe('80%')
  })

  it('pans the entire graph by dragging blank canvas without stealing node interaction', () => {
    const b = explorer()
    const viewport = screen.getByLabelText(en.panCanvas) as HTMLDivElement
    viewport.scrollLeft = 80
    viewport.scrollTop = 60
    const releasePointerCapture = vi.fn()
    viewport.setPointerCapture = vi.fn()
    viewport.hasPointerCapture = vi.fn(() => true)
    viewport.releasePointerCapture = releasePointerCapture

    fireEvent.pointerDown(viewport, { button: 0, isPrimary: true, pointerId: 7, clientX: 180, clientY: 140 })
    expect(viewport.getAttribute('data-panning')).toBe('true')
    fireEvent.pointerMove(viewport, { pointerId: 7, clientX: 120, clientY: 90 })
    expect(viewport.scrollLeft).toBe(140)
    expect(viewport.scrollTop).toBe(110)
    fireEvent.pointerUp(viewport, { pointerId: 7 })
    expect(viewport.hasAttribute('data-panning')).toBe(false)
    expect(releasePointerCapture).toHaveBeenCalledWith(7)

    const node = screen.getByRole('button', { name: /provider/ })
    fireEvent.pointerDown(node, { button: 0, isPrimary: true, pointerId: 8, clientX: 120, clientY: 90 })
    expect(viewport.hasAttribute('data-panning')).toBe(false)
    fireEvent.click(node)
    expect(b.store.getSnapshot().selection).toEqual({ kind: 'node', id: 'provider' })
  })

  it('shows loading and retryable failure states without exposing transport details', () => {
    const loading = explorer({ data: undefined, loading: true, error: undefined })
    expect(screen.getByText(en.loadingSnapshot)).toBeTruthy()
    loading.view.unmount()

    const failed = explorer({ data: undefined, loading: false, error: 'private wire detail' })
    expect(screen.getByText(en.loadFailed)).toBeTruthy()
    expect(screen.queryByText('private wire detail')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.retry }))
    expect(failed.onRefresh).toHaveBeenCalledOnce()
  })

  it('renders nothing while closed', () => {
    const store = createRuntimeStore().create()
    const props = {
      useStore: bindSnapshotSelector(store),
      actions: store.actions,
      useRuntime: sourceHook({ data: DATA, loading: false, error: undefined }),
      onVisibilityChange: vi.fn(),
      onRefresh: vi.fn(),
      t,
    } as RuntimeExplorerProps
    const view = render(<RuntimeExplorer {...props} />)
    expect(view.container.childElementCount).toBe(0)
  })
})

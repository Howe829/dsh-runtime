/** Shared viewing state for the sidebar action and frame overlay. */

import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { RuntimeLifecycleStatus } from './graph.ts'

/** Explorer tab selected by the user. */
export type RuntimeTab = 'graph' | 'trace'
/** Client-side filter over the four product-facing lifecycle states. */
export type RuntimePhaseFilter = RuntimeLifecycleStatus | 'all'
/** Current graph-node or trace-event inspector selection. */
export type RuntimeSelection = { kind: 'node' | 'event'; id: string }

/** Root-scoped view state shared by the sidebar action and overlay. */
export interface RuntimeStoreState {
  open: boolean
  tab: RuntimeTab
  query: string
  phase: RuntimePhaseFilter
  selection: RuntimeSelection | undefined
  traceTurnKey: string | undefined
  sidebarOffset: number
}

type RuntimeStoreActions = {
  setOpen: (draft: RuntimeStoreState, open: boolean) => void
  setTab: (draft: RuntimeStoreState, tab: RuntimeTab) => void
  setQuery: (draft: RuntimeStoreState, query: string) => void
  setPhase: (draft: RuntimeStoreState, phase: RuntimePhaseFilter) => void
  select: (draft: RuntimeStoreState, selection?: RuntimeSelection) => void
  selectTraceTurn: (draft: RuntimeStoreState, key?: string) => void
  setSidebarOffset: (draft: RuntimeStoreState, px: number) => void
}

/**
 * Create the root-scoped store shared by both dsh-runtime slot entries.
 * @returns A store handle whose action and overlay adapters share one state instance.
 */
export function createRuntimeStore(): EngineStoreHandle<RuntimeStoreState, RuntimeStoreActions> {
  return defineStore({
    init: (): RuntimeStoreState => ({
      open: false,
      tab: 'graph',
      query: '',
      phase: 'all',
      selection: undefined,
      traceTurnKey: undefined,
      sidebarOffset: 0,
    }),
    actions: {
      setOpen: (draft, open: boolean) => { draft.open = open },
      setTab: (draft, tab: RuntimeTab) => {
        draft.tab = tab
        draft.selection = undefined
        draft.traceTurnKey = undefined
        draft.query = ''
      },
      setQuery: (draft, query: string) => {
        draft.query = query
        draft.selection = undefined
      },
      setPhase: (draft, phase: RuntimePhaseFilter) => {
        draft.phase = phase
        draft.selection = undefined
      },
      select: (draft, selection?: RuntimeSelection) => { draft.selection = selection },
      selectTraceTurn: (draft, key?: string) => {
        draft.traceTurnKey = key
        draft.selection = undefined
        draft.query = ''
      },
      setSidebarOffset: (draft, px: number) => { draft.sidebarOffset = px },
    },
  })
}

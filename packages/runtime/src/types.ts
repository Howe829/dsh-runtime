/** Client-safe snapshot vocabulary for dsh-runtime. @module @deepseek-ai/dsh-runtime/types */

/** Lifecycle phase of one configured Loader entry's root Fiber. */
export type RuntimeFiberPhase =
  | 'pending'
  | 'loading'
  | 'active'
  | 'failed'
  | 'unloading'
  | null

/** One configured plugin in the current Loader tree. */
export interface RuntimeGraphNode {
  /** Stable snapshot identity derived from the Loader entry id. */
  readonly id: string
  /** Loader-tree entry id, including parent include/group prefixes. */
  readonly entryId: string
  /** Exact module specifier imported for this entry. */
  readonly moduleName: string
  /** Short display label derived from the module specifier. */
  readonly label: string
  /** Effective Loader enablement, including disabled ancestor groups. */
  readonly enabled: boolean
  /** Current root Fiber phase, or null when the entry has no live root Fiber. */
  readonly phase: RuntimeFiberPhase
  /** Services provided by this entry's Fiber subtree. */
  readonly provides: readonly string[]
  /** Services declared by this entry's root Fiber. */
  readonly injects: readonly string[]
  /** Declared services with no live provider in the current context. */
  readonly missing: readonly string[]
  /** First configured number of live effect labels, depth-first. */
  readonly effects: readonly string[]
  /** Total number of live effect labels before the configured projection cap. */
  readonly effectCount: number
}

/** Service dependency from one Loader entry to another. */
export interface RuntimeGraphEdge {
  /** Consumer node id. */
  readonly source: string
  /** Provider node id. */
  readonly target: string
  /** Injected services resolving through this provider. */
  readonly services: readonly string[]
}

/** Read-only dependency graph projected from Loader, Fiber, and service state. */
export interface RuntimeGraphSnapshot {
  readonly nodes: readonly RuntimeGraphNode[]
  readonly edges: readonly RuntimeGraphEdge[]
}

/** Stable presentation lane for one captured session event. */
export type RuntimeTraceLane = 'user' | 'agent' | 'llm' | 'tool' | 'session'

/** Privacy-safe metadata for one committed session event. */
export interface RuntimeTraceEvent {
  /** Session id plus event sequence, unique within this process window. */
  readonly id: string
  readonly sessionId: string
  readonly type: string
  readonly seq: number
  readonly time: number
  readonly lane: RuntimeTraceLane
  /** Serialized payload size; the payload itself is never exposed. */
  readonly payloadChars: number
  readonly turn?: number
  readonly step?: number
  readonly callId?: string
  /** Tool name for tool/call; no arguments or result content is retained. */
  readonly name?: string
  /** Terminal turn reason kind; no failure message is retained. */
  readonly outcome?: string
}

/** Point-in-time graph plus the bounded in-process event trace. */
export interface RuntimeExplorerSnapshot {
  /** Exact profile selected by the DSH launcher, or null in a non-DSH embedding host. */
  readonly profile: string | null
  readonly observedAt: number
  readonly refreshIntervalMs: number
  readonly graph: RuntimeGraphSnapshot
  readonly trace: readonly RuntimeTraceEvent[]
}

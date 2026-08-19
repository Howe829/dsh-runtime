/** Read-only Cordis runtime graph and privacy-safe session event trace. */

import type { Context, EffectMeta, Fiber, FiberState } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import z from '@deepseek-ai/schemastery'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-cmdline'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import type {
  RuntimeExplorerSnapshot,
  RuntimeFiberPhase,
  RuntimeGraphEdge,
  RuntimeGraphNode,
  RuntimeGraphSnapshot,
  RuntimeTraceEvent,
  RuntimeTraceLane,
} from './types.ts'

export type * from './types.ts'

const DEFAULT_TRACE_LIMIT = 256
const DEFAULT_EFFECT_LIMIT = 12
const DEFAULT_REFRESH_INTERVAL_MS = 1500

/** Deployment controls for browser refresh and bounded diagnostic projections. */
export interface Config {
  /** Maximum recent event metadata rows retained in process memory. @default 256 */
  traceLimit?: number
  /** Maximum effect labels returned per Loader entry. @default 12 */
  effectLimit?: number
  /** Browser snapshot refresh cadence while the explorer is open. @default 1500 */
  refreshIntervalMs?: number
}

type ResolvedConfig = Required<Config>

/** Runtime mirror: FiberState is a cross-package const enum. */
const FIBER_STATE = {
  PENDING: 0 as FiberState.PENDING,
  LOADING: 1 as FiberState.LOADING,
  ACTIVE: 2 as FiberState.ACTIVE,
  FAILED: 3 as FiberState.FAILED,
  DISPOSED: 4 as FiberState.DISPOSED,
  UNLOADING: 5 as FiberState.UNLOADING,
} as const

/** Complete public projection of Cordis Fiber states. */
const FIBER_PHASE = {
  [FIBER_STATE.PENDING]: 'pending',
  [FIBER_STATE.LOADING]: 'loading',
  [FIBER_STATE.ACTIVE]: 'active',
  [FIBER_STATE.FAILED]: 'failed',
  [FIBER_STATE.DISPOSED]: null,
  [FIBER_STATE.UNLOADING]: 'unloading',
} as const satisfies Record<FiberState, RuntimeFiberPhase>

function shortLabel(moduleName: string): string {
  const slash = moduleName.lastIndexOf('/')
  const tail = slash < 0 ? moduleName : moduleName.slice(slash + 1)
  return tail.replace(/^dsh-(?:client-ui-|client-|host-)?/, '')
}

function entryNodeId(entryId: string): string {
  return `entry:${entryId}`
}

function owningEntryId(fiber: Fiber): string | undefined {
  let current = fiber
  while (true) {
    if (current.entry !== undefined) return current.entry.id
    const parent = current.parent.fiber
    if (parent === current) return undefined
    current = parent
  }
}

function liveImplementations(ctx: Context): Array<{ name: string; fiber: Fiber }> {
  const store = ctx.reflect.store
  return Object.getOwnPropertySymbols(store)
    .map(key => store[key])
    .filter((impl): impl is NonNullable<typeof impl> => impl !== undefined)
}

function effectLabels(effects: readonly EffectMeta[]): string[] {
  return effects.flatMap(effect => [effect.label, ...effectLabels(effect.children)])
}

/**
 * Build one dependency graph from the current Loader and service stores.
 * @param ctx - Cordis context that owns Loader, Fiber, and service state.
 * @param effectLimit - Maximum effect labels retained on each projected node.
 * @returns A point-in-time graph containing non-group Loader entries and service-derived edges.
 */
export function projectRuntimeGraph(ctx: Context, effectLimit: number): RuntimeGraphSnapshot {
  const implementations = liveImplementations(ctx)
  const providerByService = new Map(implementations.map(impl => [impl.name, owningEntryId(impl.fiber)]))
  const providedByEntry = new Map<string, string[]>()
  for (const impl of implementations) {
    const entryId = owningEntryId(impl.fiber)
    if (entryId === undefined) continue
    const services = providedByEntry.get(entryId) ?? []
    services.push(impl.name)
    providedByEntry.set(entryId, services)
  }

  const nodes: RuntimeGraphNode[] = []
  const edgeServices = new Map<string, { source: string; target: string; services: string[] }>()
  for (const entry of ctx.loader.entries()) {
    if (entry.options.group) continue
    const fiber = entry.fiber
    const injects = fiber === undefined ? [] : Object.keys(fiber.inject)
    const source = entryNodeId(entry.id)
    const missing: string[] = []
    for (const service of injects) {
      const providerEntry = providerByService.get(service)
      if (providerEntry === undefined) {
        missing.push(service)
        continue
      }
      const target = entryNodeId(providerEntry)
      if (target === source) continue
      const key = `${source}\u0000${target}`
      const edge = edgeServices.get(key) ?? { source, target, services: [] }
      edge.services.push(service)
      edgeServices.set(key, edge)
    }
    const effects = fiber === undefined ? [] : effectLabels(fiber.getEffects())
    nodes.push({
      id: source,
      entryId: entry.id,
      moduleName: entry.options.name,
      label: shortLabel(entry.options.name),
      enabled: !entry.disabled,
      phase: fiber === undefined ? null : FIBER_PHASE[fiber.state],
      provides: [...(providedByEntry.get(entry.id) ?? [])].sort(),
      injects,
      missing,
      effects: effects.slice(0, effectLimit),
      effectCount: effects.length,
    })
  }
  const edges: RuntimeGraphEdge[] = [...edgeServices.values()].map(edge => ({
    source: edge.source,
    target: edge.target,
    services: edge.services.sort(),
  }))
  return { nodes, edges }
}

function traceLane(type: string): RuntimeTraceLane {
  if (type === 'user/message') return 'user'
  if (type.startsWith('assistant/') || type.startsWith('request/')) return 'llm'
  if (type.startsWith('tool/')) return 'tool'
  if (type.startsWith('turn/') || type.startsWith('step/')) return 'agent'
  return 'session'
}

/**
 * Project one event without retaining model-visible or tool payload content.
 * @param session - Session that owns the event sequence.
 * @param event - Session event whose safe correlation metadata is projected.
 * @returns A trace row that contains no prompt, model output, tool arguments, or tool result content.
 */
export function projectTraceEvent(session: Session, event: SessionEvent): RuntimeTraceEvent {
  const common = {
    id: `${session.id}:${event.seq}`,
    sessionId: String(session.id),
    type: event.type,
    seq: event.seq,
    time: event.time,
    lane: traceLane(event.type),
    payloadChars: JSON.stringify(event.data).length,
  }
  switch (event.type) {
    case 'turn/start':
      return { ...common, turn: event.data.turn }
    case 'turn/end':
      return { ...common, turn: event.data.turn, outcome: event.data.reason.kind }
    case 'step/start':
    case 'step/end':
    case 'assistant/chunk':
    case 'assistant/message':
      return { ...common, turn: event.data.turn, step: event.data.step }
    case 'tool/call':
      return {
        ...common,
        turn: event.data.turn,
        step: event.data.step,
        callId: String(event.data.callId),
        name: event.data.name,
      }
    case 'tool/result':
      return {
        ...common,
        turn: event.data.turn,
        step: event.data.step,
        callId: String(event.data.message.source.callId),
        outcome: event.data.message.content[0].isError ? 'error' : 'success',
      }
    default:
      return common
  }
}

/** Remote gateway backing the dsh-runtime browser plugin. */
export class RuntimeExplorerGateway extends TypertRemoteService {
  static inject = ['loader']

  static Config: z<Config> = z.object({
    traceLimit: z.natural().min(1).default(DEFAULT_TRACE_LIMIT),
    effectLimit: z.natural().default(DEFAULT_EFFECT_LIMIT),
    refreshIntervalMs: z.natural().min(250).default(DEFAULT_REFRESH_INTERVAL_MS),
  })

  private readonly resolved: ResolvedConfig
  private readonly trace: RuntimeTraceEvent[] = []

  constructor(ctx: Context, config: Config) {
    super(ctx, 'runtimeExplorer')
    this.resolved = config as ResolvedConfig
    ctx.on('session/event', (session, event) => {
      this.trace.push(projectTraceEvent(session, event))
      const overflow = this.trace.length - this.resolved.traceLimit
      if (overflow > 0) this.trace.splice(0, overflow)
    })
  }

  /**
   * Read live Loader state and the bounded event-metadata window.
   * @returns A point-in-time graph and trace containing no message, model-output, tool-argument, or tool-result content.
   */
  @Remote('snapshot')
  snapshot(): RuntimeExplorerSnapshot {
    return {
      profile: this.ctx.get('launchProfile')?.get() ?? null,
      observedAt: Date.now(),
      refreshIntervalMs: this.resolved.refreshIntervalMs,
      graph: projectRuntimeGraph(this.ctx, this.resolved.effectLimit),
      trace: [...this.trace],
    }
  }
}

export default RuntimeExplorerGateway

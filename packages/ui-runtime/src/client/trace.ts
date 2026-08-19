/** Session and Agent Turn projections over the bounded runtime event window. */

import type { RuntimeTraceEvent } from '@deepseek-ai/dsh-api-remotes/client'

/** Product-facing state derived from one Turn's retained metadata events. */
export type RuntimeTraceTurnStatus = 'running' | 'completed' | 'failed' | 'stopped' | 'incomplete'

/** One Agent Turn assembled from events sharing a Session id and Turn number. */
export interface RuntimeTraceTurn {
  readonly key: string
  readonly sessionId: string
  readonly turn: number
  readonly events: readonly RuntimeTraceEvent[]
  readonly startedAt: number
  readonly updatedAt: number
  readonly durationMs: number
  readonly eventCount: number
  readonly stepCount: number
  readonly toolCallCount: number
  readonly status: RuntimeTraceTurnStatus
  readonly outcome?: string
}

/** Recent Agent Turns and unassigned events retained for one Session. */
export interface RuntimeTraceSession {
  readonly sessionId: string
  readonly turns: readonly RuntimeTraceTurn[]
  readonly sessionEvents: readonly RuntimeTraceEvent[]
  readonly eventCount: number
  readonly updatedAt: number
}

interface MutableTurn {
  readonly sessionId: string
  readonly turn: number
  readonly events: [RuntimeTraceEvent, ...RuntimeTraceEvent[]]
}

interface MutableSession {
  readonly sessionId: string
  readonly turns: Map<number, MutableTurn>
  readonly sessionEvents: RuntimeTraceEvent[]
}

/**
 * Build the stable selection key for one Session-owned Agent Turn.
 * @param sessionId - Opaque Session id from the trace event.
 * @param turn - Session-local Turn number.
 * @returns A key that remains unique across concurrent Sessions.
 */
export function runtimeTraceTurnKey(sessionId: string, turn: number): string {
  return `${sessionId}:${turn}`
}

function compareEvents(a: RuntimeTraceEvent, b: RuntimeTraceEvent): number {
  return a.time - b.time || a.seq - b.seq
}

function turnStatus(
  events: readonly RuntimeTraceEvent[],
  outcome: string | undefined,
): RuntimeTraceTurnStatus {
  const hasStart = events.some(event => event.type === 'turn/start')
  const hasEnd = events.some(event => event.type === 'turn/end')
  if (!hasStart) return 'incomplete'
  if (!hasEnd) return 'running'
  if (outcome === 'error') return 'failed'
  if (outcome === 'completed' || outcome === 'max-tokens') return 'completed'
  return 'stopped'
}

/**
 * Group the bounded event window into recent Sessions and their Agent Turns.
 * @param events - Privacy-safe events from the latest runtime snapshot.
 * @returns Sessions and Turns sorted by most recent activity.
 */
export function groupRuntimeTrace(events: readonly RuntimeTraceEvent[]): RuntimeTraceSession[] {
  const sessions = new Map<string, MutableSession>()
  for (const event of events) {
    let session = sessions.get(event.sessionId)
    if (session === undefined) {
      session = { sessionId: event.sessionId, turns: new Map(), sessionEvents: [] }
      sessions.set(event.sessionId, session)
    }
    if (event.turn === undefined) {
      session.sessionEvents.push(event)
      continue
    }
    let turn = session.turns.get(event.turn)
    if (turn === undefined) {
      turn = { sessionId: event.sessionId, turn: event.turn, events: [event] }
      session.turns.set(event.turn, turn)
      continue
    }
    turn.events.push(event)
  }

  return [...sessions.values()].map((session): RuntimeTraceSession => {
    const sessionEvents = [...session.sessionEvents].sort(compareEvents)
    const turns = [...session.turns.values()].map((turn): RuntimeTraceTurn => {
      const turnEvents = [...turn.events].sort(compareEvents)
      const start = turnEvents.find(event => event.type === 'turn/start') ?? turn.events[0]
      const end = turnEvents.findLast(event => event.type === 'turn/end')
      const updatedAt = turnEvents.at(-1)?.time ?? start.time
      const outcome = end?.outcome
      return {
        key: runtimeTraceTurnKey(turn.sessionId, turn.turn),
        sessionId: turn.sessionId,
        turn: turn.turn,
        events: turnEvents,
        startedAt: start.time,
        updatedAt,
        durationMs: Math.max(0, (end?.time ?? updatedAt) - start.time),
        eventCount: turnEvents.length,
        stepCount: new Set(turnEvents.flatMap(event => event.step === undefined ? [] : [event.step])).size,
        toolCallCount: turnEvents.filter(event => event.type === 'tool/call').length,
        status: turnStatus(turnEvents, outcome),
        ...(outcome === undefined ? {} : { outcome }),
      }
    }).sort((a, b) => b.updatedAt - a.updatedAt || b.turn - a.turn)
    const updatedAt = Math.max(
      ...turns.map(turn => turn.updatedAt),
      ...sessionEvents.map(event => event.time),
    )
    return {
      sessionId: session.sessionId,
      turns,
      sessionEvents,
      eventCount: turns.reduce((count, turn) => count + turn.eventCount, sessionEvents.length),
      updatedAt,
    }
  }).sort((a, b) => b.updatedAt - a.updatedAt || a.sessionId.localeCompare(b.sessionId))
}

function includesTurn(turn: RuntimeTraceTurn, query: string): boolean {
  return [
    `turn ${turn.turn}`,
    String(turn.turn),
    turn.status,
    turn.outcome,
    ...turn.events.flatMap(event => [event.type, event.name, event.callId]),
  ].filter(value => value !== undefined).join('\n').toLowerCase().includes(query)
}

/**
 * Filter the Turn directory without flattening its Session grouping.
 * @param sessions - Grouped runtime trace Sessions.
 * @param query - Normalized user query.
 * @returns Matching Session groups in their existing activity order.
 */
export function filterRuntimeTrace(
  sessions: readonly RuntimeTraceSession[],
  query: string,
): RuntimeTraceSession[] {
  if (query === '') return [...sessions]
  return sessions.flatMap((session) => {
    if (session.sessionId.toLowerCase().includes(query)) return [session]
    const turns = session.turns.filter(turn => includesTurn(turn, query))
    const sessionEvents = session.sessionEvents.filter(event => [event.type, event.name, event.callId, event.outcome]
      .filter(value => value !== undefined).join('\n').toLowerCase().includes(query))
    if (turns.length === 0 && sessionEvents.length === 0) return []
    return [{
      ...session,
      turns,
      sessionEvents,
      eventCount: turns.reduce((count, turn) => count + turn.eventCount, sessionEvents.length),
    }]
  })
}

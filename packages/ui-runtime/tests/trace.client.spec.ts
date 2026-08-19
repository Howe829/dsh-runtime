import { describe, expect, it } from 'vitest'
import type { RuntimeTraceEvent } from '@deepseek-ai/dsh-api-remotes/client'
import { filterRuntimeTrace, groupRuntimeTrace, runtimeTraceTurnKey } from '../src/client/trace.ts'

function event(input: Partial<RuntimeTraceEvent> & Pick<RuntimeTraceEvent, 'id' | 'sessionId' | 'type' | 'seq' | 'time' | 'lane'>): RuntimeTraceEvent {
  return { payloadChars: 0, ...input }
}

const EVENTS: RuntimeTraceEvent[] = [
  event({ id: 'a:1', sessionId: 'session-a', type: 'turn/start', seq: 1, time: 100, lane: 'agent', turn: 1 }),
  event({ id: 'a:2', sessionId: 'session-a', type: 'step/start', seq: 2, time: 110, lane: 'agent', turn: 1, step: 1 }),
  event({ id: 'a:3', sessionId: 'session-a', type: 'tool/call', seq: 3, time: 120, lane: 'tool', turn: 1, step: 1, name: 'bash', callId: 'call-1' }),
  event({ id: 'a:4', sessionId: 'session-a', type: 'turn/end', seq: 4, time: 150, lane: 'agent', turn: 1, outcome: 'completed' }),
  event({ id: 'a:5', sessionId: 'session-a', type: 'session/title', seq: 5, time: 160, lane: 'session' }),
  event({ id: 'b:2', sessionId: 'session-b', type: 'assistant/chunk', seq: 2, time: 210, lane: 'llm', turn: 2, step: 1 }),
  event({ id: 'b:1', sessionId: 'session-b', type: 'turn/start', seq: 1, time: 200, lane: 'agent', turn: 2 }),
  event({ id: 'b:3', sessionId: 'session-b', type: 'turn/end', seq: 3, time: 220, lane: 'agent', turn: 2, outcome: 'error' }),
  event({ id: 'b:4', sessionId: 'session-b', type: 'tool/result', seq: 4, time: 230, lane: 'tool', turn: 3, step: 1, outcome: 'success' }),
  event({ id: 'c:1', sessionId: 'session-c', type: 'turn/start', seq: 1, time: 300, lane: 'agent', turn: 1 }),
]

describe('runtime trace projection', () => {
  it('groups concurrent Sessions into sorted Agent Turns with useful summaries', () => {
    const sessions = groupRuntimeTrace(EVENTS)
    expect(sessions.map(session => session.sessionId)).toEqual(['session-c', 'session-b', 'session-a'])

    expect(sessions[0]?.turns[0]).toMatchObject({
      key: runtimeTraceTurnKey('session-c', 1), status: 'running', durationMs: 0,
    })
    expect(sessions[1]?.turns.map(turn => ({ turn: turn.turn, status: turn.status }))).toEqual([
      { turn: 3, status: 'incomplete' },
      { turn: 2, status: 'failed' },
    ])
    expect(sessions[1]?.turns[1]).toMatchObject({
      eventCount: 3, stepCount: 1, toolCallCount: 0, durationMs: 20, outcome: 'error',
    })
    expect(sessions[1]?.turns[1]?.events.map(item => item.seq)).toEqual([1, 2, 3])
    expect(sessions[2]?.turns[0]).toMatchObject({
      status: 'completed', eventCount: 4, stepCount: 1, toolCallCount: 1, durationMs: 50,
    })
    expect(sessions[2]?.sessionEvents.map(item => item.type)).toEqual(['session/title'])
    expect(sessions[2]?.eventCount).toBe(5)
  })

  it('keeps Session grouping while matching ids, Turn metadata, tools, and unassigned events', () => {
    const sessions = groupRuntimeTrace(EVENTS)
    expect(filterRuntimeTrace(sessions, 'session-a')[0]?.turns).toHaveLength(1)
    expect(filterRuntimeTrace(sessions, 'bash')[0]?.sessionId).toBe('session-a')
    expect(filterRuntimeTrace(sessions, 'turn 2')[0]?.turns.map(turn => turn.turn)).toEqual([2])
    expect(filterRuntimeTrace(sessions, 'session/title')[0]?.sessionEvents).toHaveLength(1)
    expect(filterRuntimeTrace(sessions, 'absent')).toEqual([])
  })
})

import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service, type Plugin } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { provideCmdline } from '@deepseek-ai/dsh-cmdline'
import { Session, SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import { remoteMethods } from '@deepseek-ai/dsh-typert-protocol'
import RuntimeExplorerGateway, { projectRuntimeGraph, projectTraceEvent } from '../src/index.ts'

const contexts: Context[] = []

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

class AlphaService extends Service {
  constructor(ctx: Context) { super(ctx, 'alpha') }
}

class BetaService extends Service {
  constructor(ctx: Context) { super(ctx, 'beta') }
}

const provider: Plugin.Function = (ctx) => {
  new AlphaService(ctx)
  new BetaService(ctx)
  ctx.effect(() => {
    ctx.effect(() => () => {}, 'provider inner effect')
    return () => {}
  }, 'provider outer effect')
}

const consumer: Plugin.Object = {
  inject: ['alpha', 'beta'],
  apply(ctx) { ctx.effect(() => () => {}, 'consumer effect') },
}

const pending: Plugin.Object = {
  inject: ['missingService'],
  apply() {},
}

const unusedGroup: Plugin.Function = () => {}

async function harness(
  config = { traceLimit: 2, effectLimit: 1, refreshIntervalMs: 900 },
  profile: string | null = 'fixture-profile',
) {
  const ctx = new Context()
  contexts.push(ctx)
  if (profile !== null) provideCmdline(ctx, { profile, args: [], exit: () => {} })
  await ctx.plugin(Loader)
  ctx.loader.builtins.provider = provider
  ctx.loader.builtins.consumer = consumer
  ctx.loader.builtins.pending = pending
  ctx.loader.builtins['unused-group'] = unusedGroup
  await ctx.plugin(RuntimeExplorerGateway, config)
  const runtime = ctx.get('runtimeExplorer') as RuntimeExplorerGateway
  return { ctx, runtime }
}

describe('RuntimeExplorerGateway', () => {
  it('projects Loader nodes, provided services, dependency edges, waits, effects, and disabled rows', async () => {
    const { ctx, runtime } = await harness()
    const providerEntry = await ctx.loader.create({ name: 'cordis:provider' })
    const consumerEntry = await ctx.loader.create({ name: 'cordis:consumer' })
    const pendingEntry = await ctx.loader.create({ name: 'cordis:pending' })
    const disabledEntry = await ctx.loader.create({ name: '@fixture/dsh-host-disabled', disabled: true })
    await ctx.loader.create({ name: 'cordis:unused-group', group: true })
    await ctx.loader.await()
    const providerFiber = [...ctx.loader.entries()].find(entry => entry.id === providerEntry)!.fiber!
    providerFiber.inject.alpha = null

    const graph = projectRuntimeGraph(ctx, 1)
    expect(graph.nodes).toHaveLength(4)
    expect(graph.nodes.find(node => node.entryId === providerEntry)).toMatchObject({
      label: 'cordis:provider',
      phase: 'active',
      provides: ['alpha', 'beta'],
      injects: ['alpha'],
      effects: ['ctx.provide("alpha")'],
      effectCount: 4,
    })
    expect(graph.nodes.find(node => node.entryId === consumerEntry)).toMatchObject({
      phase: 'active', injects: ['alpha', 'beta'], missing: [],
    })
    expect(graph.nodes.find(node => node.entryId === pendingEntry)).toMatchObject({
      phase: 'pending', missing: ['missingService'],
    })
    expect(graph.nodes.find(node => node.entryId === disabledEntry)).toMatchObject({
      label: 'disabled', enabled: false, phase: null, effects: [], effectCount: 0,
    })
    expect(graph.edges).toEqual([{
      source: `entry:${consumerEntry}`,
      target: `entry:${providerEntry}`,
      services: ['alpha', 'beta'],
    }])
    expect(graph.edges.some(edge => edge.source === `entry:${providerEntry}` && edge.target === `entry:${providerEntry}`)).toBe(false)

    expect(runtime.snapshot()).toMatchObject({
      profile: 'fixture-profile',
      refreshIntervalMs: 900,
      graph,
      trace: [],
    })
    expect(remoteMethods(runtime)).toEqual([{ method: 'snapshot', invocation: { kind: 'direct' } }])
  })

  it('retains only bounded event metadata and never exposes prompt or tool payload content', async () => {
    const { ctx, runtime } = await harness()
    const session = Session.create(SessionId('visible-session-id'))
    const secretPrompt = 'PROMPT_MUST_NOT_LEAVE_HOST'
    const secretArguments = 'TOOL_ARGUMENTS_MUST_NOT_LEAVE_HOST'
    const user = {
      type: 'user/message', seq: 1, time: 10,
      data: { role: 'user', content: [{ type: 'text', text: secretPrompt }], source: { kind: 'user' } },
    } as unknown as SessionEvent
    const call = {
      type: 'tool/call', seq: 2, time: 20,
      data: { turn: 3, step: 4, callId: 'call-1', name: 'bash', arguments: secretArguments },
    } as SessionEvent
    const end = {
      type: 'turn/end', seq: 3, time: 30,
      data: { turn: 3, reason: { kind: 'completed' } },
    } as SessionEvent

    ctx.emit('session/event', session, user)
    ctx.emit('session/event', session, call)
    ctx.emit('session/event', session, end)
    const snapshot = runtime.snapshot()
    expect(snapshot.trace).toHaveLength(2)
    expect(snapshot.trace[0]).toMatchObject({
      id: 'visible-session-id:2', lane: 'tool', turn: 3, step: 4,
      callId: 'call-1', name: 'bash',
    })
    expect(snapshot.trace[1]).toMatchObject({ lane: 'agent', outcome: 'completed' })
    expect(JSON.stringify(snapshot)).not.toContain(secretPrompt)
    expect(JSON.stringify(snapshot)).not.toContain(secretArguments)
  })

  it('reports no profile instead of guessing in an embedding host without launcher facts', async () => {
    const { runtime } = await harness(undefined, null)
    expect(runtime.snapshot().profile).toBeNull()
  })
})

describe('trace metadata projection', () => {
  const session = Session.create(SessionId('trace'))
  const event = (type: string, data: unknown, seq = 1): SessionEvent => ({
    type, data, seq, time: 100,
  } as SessionEvent)

  it('maps the complete built-in request flow into stable lanes and safe correlation fields', () => {
    expect(projectTraceEvent(session, event('turn/start', { turn: 1 }))).toMatchObject({ lane: 'agent', turn: 1 })
    expect(projectTraceEvent(session, event('step/start', { turn: 1, step: 2 }))).toMatchObject({ lane: 'agent', step: 2 })
    expect(projectTraceEvent(session, event('step/end', { turn: 1, step: 2 }))).toMatchObject({ lane: 'agent', step: 2 })
    expect(projectTraceEvent(session, event('assistant/chunk', { turn: 1, step: 2, chunk: { type: 'text-delta', index: 0, text: 'secret' } })))
      .toMatchObject({ lane: 'llm', turn: 1, step: 2 })
    expect(projectTraceEvent(session, event('assistant/message', { turn: 1, step: 2, message: { secret: true } })))
      .toMatchObject({ lane: 'llm', turn: 1, step: 2 })
    expect(projectTraceEvent(session, event('request/header', { header: { system: 'secret' }, reason: 'initial' })))
      .toMatchObject({ lane: 'llm' })
    expect(projectTraceEvent(session, event('tool/result', {
      turn: 1,
      step: 2,
      message: { source: { callId: 'call-2' }, content: [{ isError: true, secret: 'result' }] },
    }))).toMatchObject({ lane: 'tool', callId: 'call-2', outcome: 'error' })
    expect(projectTraceEvent(session, event('tool/result', {
      turn: 1,
      step: 3,
      message: { source: { callId: 'call-3' }, content: [{ isError: false, secret: 'result' }] },
    }))).toMatchObject({ lane: 'tool', callId: 'call-3', outcome: 'success' })
    expect(projectTraceEvent(session, event('todo/write', { todos: [] }))).toMatchObject({ lane: 'session' })
  })
})

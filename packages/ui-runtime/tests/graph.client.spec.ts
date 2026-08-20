import { describe, expect, it } from 'vitest'
import type { RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client'
import {
  focusRuntimeGraph, layoutRuntimeGraph, runtimeGraphRelations, runtimeGraphTopologyKey, runtimeLifecycleStatus,
  summarizeRuntimeGraph,
} from '../src/client/graph.ts'

const node = (id: string): RuntimeGraphNode => ({
  id,
  logicalKey: id,
  entryId: id,
  moduleName: `@fixture/${id}`,
  label: id,
  enabled: true,
  phase: 'active',
  provides: [],
  injects: [],
  missing: [],
  effects: [],
  effectCount: 0,
})

const edge = (source: string, target: string, service: string): RuntimeGraphEdge => ({
  id: `injects:${source}->${target}`,
  type: 'injects',
  source,
  target,
  services: [service],
})

describe('runtime graph layout', () => {
  it('settles a deterministic force graph and ignores edges outside the filtered node set', () => {
    const nodes = [node('provider'), node('middle'), node('consumer')]
    const edges: RuntimeGraphEdge[] = [
      edge('middle', 'provider', 'a'),
      edge('consumer', 'middle', 'b'),
      edge('consumer', 'filtered-out', 'c'),
    ]
    const graph = layoutRuntimeGraph(nodes, edges)
    expect(graph.positions).toHaveLength(3)
    expect(graph.width).toBeGreaterThanOrEqual(760)
    expect(graph.height).toBeGreaterThanOrEqual(520)
    const refreshed = layoutRuntimeGraph(nodes.map(item => ({ ...item, phase: 'pending' })), edges.map(item => ({ ...item })))
    expect(refreshed.positions.map(({ node: _node, ...position }) => position))
      .toEqual(graph.positions.map(({ node: _node, ...position }) => position))
  })

  it('keeps a dependency cycle finite and returns an empty usable canvas', () => {
    const cycle = layoutRuntimeGraph([node('a'), node('b')], [
      edge('a', 'b', 'x'),
      edge('b', 'a', 'y'),
    ])
    expect(cycle.positions).toHaveLength(2)
    expect(cycle.positions.every(position => Number.isFinite(position.x) && Number.isFinite(position.y))).toBe(true)

    const empty = layoutRuntimeGraph([], [])
    expect(empty.positions).toEqual([])
    expect(empty.byId.size).toBe(0)
    expect(empty.width).toBe(760)
    expect(empty.height).toBe(520)
  })

  it('sorts peers in one dependency column by their visible label', () => {
    const graph = layoutRuntimeGraph([node('zeta'), node('alpha')], [])
    expect(graph.positions.map(position => position.node.label)).toEqual(['alpha', 'zeta'])
  })

  it('keeps user-pinned logical positions fixed and excludes lifecycle state from topology identity', () => {
    const nodes = [node('provider'), node('consumer')]
    const edges = [edge('consumer', 'provider', 'llm')]
    const layout = layoutRuntimeGraph(nodes, edges, {
      provider: { x: 120, y: 240, pinned: true },
    })
    expect(layout.byId.get('provider')).toMatchObject({ x: 120, y: 240 })

    const before = runtimeGraphTopologyKey(nodes, edges)
    const statusRefresh = runtimeGraphTopologyKey(
      nodes.map(item => ({ ...item, phase: 'failed' as const })),
      edges,
    )
    expect(statusRefresh).toBe(before)
    expect(runtimeGraphTopologyKey([...nodes, node('new')], edges)).not.toBe(before)
  })

  it('resolves circular node collisions while keeping pinned nodes fixed', () => {
    const nodes = Array.from({ length: 32 }, (_, index) => node(`circle-${index}`))
    const graph = layoutRuntimeGraph(nodes, [], {
      'circle-0': { x: 180, y: 180, pinned: true },
    })
    expect(graph.byId.get('circle-0')).toMatchObject({ x: 180, y: 180 })
    for (let left = 0; left < graph.positions.length; left += 1) {
      for (let right = left + 1; right < graph.positions.length; right += 1) {
        const a = graph.positions[left]!
        const b = graph.positions[right]!
        expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThanOrEqual(143.9)
      }
    }
  })

  it('settles the MVP budget of 250 plugins and 1,000 relations into finite bounded coordinates', () => {
    const nodes = Array.from({ length: 250 }, (_, index) => node(`plugin-${index}`))
    const edges = Array.from({ length: 1000 }, (_, index) => edge(
      `plugin-${index % 250}`,
      `plugin-${(index * 37 + 11) % 250}`,
      `service-${index}`,
    ))
    const graph = layoutRuntimeGraph(nodes, edges)
    expect(graph.positions).toHaveLength(250)
    expect(graph.positions.every(position => (
      Number.isFinite(position.x)
      && Number.isFinite(position.y)
      && position.x >= 0
      && position.y >= 0
      && position.x + 116 <= graph.width
      && position.y + 116 <= graph.height
    ))).toBe(true)
  })

  it('focuses one related hop by default and supports bounded or complete expansion', () => {
    const nodes = [
      node('root-provider'), node('provider'), node('middle'), node('consumer'), node('leaf-consumer'), node('isolated'),
    ]
    const edges: RuntimeGraphEdge[] = [
      edge('provider', 'root-provider', 'root'),
      edge('middle', 'provider', 'a'),
      edge('consumer', 'middle', 'b'),
      edge('leaf-consumer', 'consumer', 'leaf'),
    ]
    const focused = focusRuntimeGraph(nodes, edges, 'middle')
    expect(focused.nodes.map(item => item.id)).toEqual(['provider', 'middle', 'consumer'])
    expect(focused.edges).toEqual(edges.slice(1, 3))

    expect(focusRuntimeGraph(nodes, edges, 'middle', 2).nodes.map(item => item.id)).toEqual([
      'root-provider', 'provider', 'middle', 'consumer', 'leaf-consumer',
    ])
    expect(focusRuntimeGraph(nodes, edges, 'middle', 'all').edges).toEqual(edges)

    expect(focusRuntimeGraph(nodes, edges, 'isolated').nodes.map(item => item.id)).toEqual(['isolated'])
    expect(focusRuntimeGraph(nodes, edges, undefined).nodes).toEqual(nodes)
    expect(focusRuntimeGraph(nodes, edges, 'missing').nodes).toEqual(nodes)
  })

  it('classifies transitive dependencies and dependants around the focused node', () => {
    const nodes = [node('root-provider'), node('provider'), node('focus'), node('consumer'), node('leaf-consumer')]
    const edges: RuntimeGraphEdge[] = [
      edge('provider', 'root-provider', 'root'),
      edge('focus', 'provider', 'input'),
      edge('consumer', 'focus', 'output'),
      edge('leaf-consumer', 'consumer', 'leaf'),
    ]
    const relations = runtimeGraphRelations(nodes, edges, 'focus')
    expect(Object.fromEntries(relations.nodes)).toEqual({
      'root-provider': 'dependency',
      provider: 'dependency',
      focus: 'selected',
      consumer: 'dependant',
      'leaf-consumer': 'dependant',
    })
    expect(Object.fromEntries(relations.edges)).toEqual({
      'provider:root-provider': 'dependency',
      'focus:provider': 'dependency',
      'consumer:focus': 'dependant',
      'leaf-consumer:consumer': 'dependant',
    })
    expect(runtimeGraphRelations(nodes, edges, undefined).nodes.size).toBe(0)
  })

  it('collapses detailed Fiber phases into pending, active, disposed, and failed states', () => {
    const active = node('active')
    const pending = { ...node('pending'), phase: 'pending' as const }
    const loading = { ...node('loading'), phase: 'loading' as const }
    const unloading = { ...node('unloading'), phase: 'unloading' as const }
    const unmounted = { ...node('unmounted'), phase: null }
    const failed = { ...node('failed'), phase: 'failed' as const }
    expect([
      runtimeLifecycleStatus(pending.phase),
      runtimeLifecycleStatus(loading.phase),
      runtimeLifecycleStatus(active.phase),
      runtimeLifecycleStatus(unloading.phase),
      runtimeLifecycleStatus(unmounted.phase),
      runtimeLifecycleStatus(failed.phase),
    ]).toEqual(['pending', 'pending', 'active', 'disposed', 'disposed', 'failed'])
    expect(summarizeRuntimeGraph([pending, loading, active, unloading, unmounted, failed])).toEqual({
      pending: 2,
      active: 1,
      disposed: 2,
      failed: 1,
    })
  })
})

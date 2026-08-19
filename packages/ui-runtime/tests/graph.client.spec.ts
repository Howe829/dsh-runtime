import { describe, expect, it } from 'vitest'
import type { RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client'
import {
  focusRuntimeGraph, layoutRuntimeGraph, runtimeGraphRelations, runtimeLifecycleStatus, summarizeRuntimeGraph,
} from '../src/client/graph.ts'

const node = (id: string): RuntimeGraphNode => ({
  id,
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

describe('runtime graph layout', () => {
  it('places providers left of transitive consumers and ignores edges outside the filtered node set', () => {
    const nodes = [node('provider'), node('middle'), node('consumer')]
    const edges: RuntimeGraphEdge[] = [
      { source: 'middle', target: 'provider', services: ['a'] },
      { source: 'consumer', target: 'middle', services: ['b'] },
      { source: 'consumer', target: 'filtered-out', services: ['c'] },
    ]
    const graph = layoutRuntimeGraph(nodes, edges)
    expect(graph.byId.get('provider')!.x).toBeLessThan(graph.byId.get('middle')!.x)
    expect(graph.byId.get('middle')!.x).toBeLessThan(graph.byId.get('consumer')!.x)
    expect(graph.positions).toHaveLength(3)
    expect(graph.width).toBeGreaterThanOrEqual(760)
    expect(graph.height).toBeGreaterThanOrEqual(520)
  })

  it('keeps a dependency cycle finite and returns an empty usable canvas', () => {
    const cycle = layoutRuntimeGraph([node('a'), node('b')], [
      { source: 'a', target: 'b', services: ['x'] },
      { source: 'b', target: 'a', services: ['y'] },
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
    expect(graph.positions[0]!.y).toBeLessThan(graph.positions[1]!.y)
  })

  it('focuses the complete upstream and downstream chain around the selected node', () => {
    const nodes = [node('provider'), node('middle'), node('consumer'), node('isolated')]
    const edges: RuntimeGraphEdge[] = [
      { source: 'middle', target: 'provider', services: ['a'] },
      { source: 'consumer', target: 'middle', services: ['b'] },
    ]
    const focused = focusRuntimeGraph(nodes, edges, 'middle')
    expect(focused.nodes.map(item => item.id)).toEqual(['provider', 'middle', 'consumer'])
    expect(focused.edges).toEqual(edges)

    expect(focusRuntimeGraph(nodes, edges, 'isolated').nodes.map(item => item.id)).toEqual(['isolated'])
    expect(focusRuntimeGraph(nodes, edges, undefined).nodes).toEqual(nodes)
    expect(focusRuntimeGraph(nodes, edges, 'missing').nodes).toEqual(nodes)
  })

  it('classifies transitive dependencies and dependants around the focused node', () => {
    const nodes = [node('root-provider'), node('provider'), node('focus'), node('consumer'), node('leaf-consumer')]
    const edges: RuntimeGraphEdge[] = [
      { source: 'provider', target: 'root-provider', services: ['root'] },
      { source: 'focus', target: 'provider', services: ['input'] },
      { source: 'consumer', target: 'focus', services: ['output'] },
      { source: 'leaf-consumer', target: 'consumer', services: ['leaf'] },
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

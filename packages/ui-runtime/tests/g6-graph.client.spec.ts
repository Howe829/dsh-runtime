import { describe, expect, it, vi } from 'vitest'
import type { RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client'
import {
  buildRuntimeG6Data, runtimeG6CollisionRadius, runtimeG6DisplayLabel, runtimeG6EdgeMetadata,
  runtimeG6NodeCategory, runtimeG6NodeMetadata,
  runtimeG6NodeSize, runtimeG6TopologyKey, syncRuntimeG6Data,
} from '../src/client/g6-graph.ts'
import type { RuntimeGraphRelations } from '../src/client/graph.ts'

const node = (
  id: string,
  phase: RuntimeGraphNode['phase'] = 'active',
  missing: string[] = [],
): RuntimeGraphNode => ({
  id,
  logicalKey: id,
  entryId: `${id}-entry`,
  moduleName: `@fixture/${id}`,
  label: id,
  enabled: phase !== null,
  phase,
  provides: [],
  injects: [],
  missing,
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

const relations: RuntimeGraphRelations = {
  nodes: new Map([
    ['consumer', 'selected'],
    ['provider', 'dependency'],
  ]),
  edges: new Map([['consumer:provider', 'dependency']]),
}

describe('G6 runtime graph projection', () => {
  it('projects plugin state, dependency direction, pinned placement, and missing Cordis services', () => {
    const data = buildRuntimeG6Data(
      [node('provider'), node('consumer', 'pending', ['tools'])],
      [edge('consumer', 'provider', 'llm')],
      relations,
      'consumer',
      { provider: { x: 120, y: 240, pinned: true } },
    )

    expect(data.nodes.map(item => item.id)).toEqual(['provider', 'consumer', 'missing:consumer:tools'])
    expect(data.edges.map(item => item.id)).toEqual(['injects:consumer->provider', 'missing-edge:consumer:tools'])

    const provider = data.nodes[0]!
    expect(provider.style).toMatchObject({ x: 120, y: 240 })
    expect(runtimeG6NodeMetadata(provider)).toMatchObject({
      kind: 'plugin', phase: 'active', category: 'extension', relation: 'dependency', pinned: true,
    })
    expect(runtimeG6NodeMetadata(data.nodes[1]!)).toMatchObject({
      kind: 'plugin', phase: 'pending', relation: 'selected', pinned: false,
      provides: [], injects: [], missing: ['tools'], effectCount: 0,
    })
    expect(runtimeG6NodeMetadata(data.nodes[2]!)).toMatchObject({
      kind: 'missing-service', phase: 'missing', service: 'tools', missing: ['tools'],
    })
    expect(runtimeG6EdgeMetadata(data.edges[0]!)).toEqual({
      kind: 'injects', relation: 'dependency', services: ['llm'],
    })
    expect(runtimeG6EdgeMetadata(data.edges[1]!)).toEqual({
      kind: 'missing', relation: 'dependency', services: ['tools'],
    })
  })

  it('scales hubs within a bounded circular size and reserves collision whitespace', () => {
    expect(runtimeG6NodeSize(0)).toBe(76)
    expect(runtimeG6NodeSize(1, true)).toBeGreaterThan(runtimeG6NodeSize(1))
    expect(runtimeG6NodeSize(10_000)).toBe(108)
    expect(runtimeG6NodeSize(0, false, 'session-persistence')).toBeGreaterThan(runtimeG6NodeSize(0))
    expect(runtimeG6CollisionRadius(108)).toBeGreaterThan(108 / 2)
  })

  it('classifies DSH plugin roles deterministically while keeping third-party extensions neutral', () => {
    expect(runtimeG6NodeCategory('@deepseek-ai/cordis-plugin-loader', 'loader')).toBe('core')
    expect(runtimeG6NodeCategory('@deepseek-ai/dsh-agent-preset', 'agent-preset')).toBe('agent')
    expect(runtimeG6NodeCategory('@deepseek-ai/dsh-llm-deepseek', 'llm-deepseek')).toBe('model')
    expect(runtimeG6NodeCategory('@deepseek-ai/dsh-tool-bash', 'tool-bash')).toBe('tool')
    expect(runtimeG6NodeCategory('@deepseek-ai/dsh-session', 'session')).toBe('session')
    expect(runtimeG6NodeCategory('@deepseek-ai/dsh-client-ui-layout', 'ui-layout')).toBe('interface')
    expect(runtimeG6NodeCategory('@acme/custom-plugin', 'custom-plugin')).toBe('extension')
  })

  it('keeps exact plugin names and wraps long hyphenated labels at semantic boundaries', () => {
    expect(runtimeG6DisplayLabel('session-projection-cache')).toBe('session-\nprojection-\ncache')
    expect(runtimeG6DisplayLabel('storage-domain')).toBe('storage-\ndomain')
    expect(runtimeG6DisplayLabel('conversation')).toBe('conversation')
  })

  it('keeps topology identity stable across lifecycle refreshes', () => {
    const before = buildRuntimeG6Data([node('plugin', 'active')], [], { nodes: new Map(), edges: new Map() }, undefined, {})
    const after = buildRuntimeG6Data([node('plugin', 'failed')], [], { nodes: new Map(), edges: new Map() }, undefined, {})
    expect(runtimeG6TopologyKey(after)).toBe(runtimeG6TopologyKey(before))
  })
})

describe('G6 refresh policy', () => {
  it('lays out structural changes but draws lifecycle-only refreshes in place', async () => {
    const graph = {
      setData: vi.fn(),
      render: vi.fn().mockResolvedValue(undefined),
      draw: vi.fn().mockResolvedValue(undefined),
      getElementPosition: vi.fn().mockReturnValue([420, 260, 0]),
    }
    const first = buildRuntimeG6Data([node('plugin', 'active')], [], { nodes: new Map(), edges: new Map() }, undefined, {})
    expect(await syncRuntimeG6Data(graph, first, undefined)).toBe('render')

    const refreshed = buildRuntimeG6Data([node('plugin', 'failed')], [], { nodes: new Map(), edges: new Map() }, undefined, {})
    expect(await syncRuntimeG6Data(graph, refreshed, runtimeG6TopologyKey(first))).toBe('draw')
    expect(graph.render).toHaveBeenCalledOnce()
    expect(graph.draw).toHaveBeenCalledOnce()
    expect(graph.setData).toHaveBeenLastCalledWith(expect.objectContaining({
      nodes: [expect.objectContaining({ style: expect.objectContaining({ x: 420, y: 260 }) })],
    }))

    const expanded = buildRuntimeG6Data(
      [node('plugin', 'failed'), node('new-plugin')], [], { nodes: new Map(), edges: new Map() }, undefined, {},
    )
    expect(await syncRuntimeG6Data(graph, expanded, runtimeG6TopologyKey(refreshed))).toBe('render')
    expect(graph.render).toHaveBeenCalledTimes(2)
  })
})

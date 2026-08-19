/** Deterministic provider-left graph layout for the runtime SVG. */

import type { RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client'

/** Pixel position of one projected runtime node. */
export interface RuntimeNodePosition {
  readonly node: RuntimeGraphNode
  readonly x: number
  readonly y: number
}

/** Deterministic SVG dimensions and indexed node positions. */
export interface RuntimeGraphLayout {
  readonly width: number
  readonly height: number
  readonly positions: readonly RuntimeNodePosition[]
  readonly byId: ReadonlyMap<string, RuntimeNodePosition>
}

/** Aggregate plugin lifecycle counts shown above the runtime graph. */
export interface RuntimeGraphSummary {
  readonly pending: number
  readonly active: number
  readonly disposed: number
  readonly failed: number
}

/** Nodes and edges visible while the graph is focused on one dependency chain. */
export interface RuntimeGraphFocus {
  readonly nodes: readonly RuntimeGraphNode[]
  readonly edges: readonly RuntimeGraphEdge[]
}

/** How one visible node or edge relates to the current focus node. */
export type RuntimeGraphRelation = 'selected' | 'dependency' | 'dependant' | 'both' | 'related'

/** Directional relationship index for a focused runtime graph. */
export interface RuntimeGraphRelations {
  readonly nodes: ReadonlyMap<string, RuntimeGraphRelation>
  readonly edges: ReadonlyMap<string, RuntimeGraphRelation>
}

/** Product-facing lifecycle states collapsed from the Loader Fiber phases. */
export type RuntimeLifecycleStatus = 'pending' | 'active' | 'disposed' | 'failed'

const NODE_WIDTH = 210
const NODE_HEIGHT = 72
const COLUMN_GAP = 92
const ROW_GAP = 26
const PADDING = 36

/**
 * Keep the complete upstream and downstream dependency chain around one selected node.
 * @param nodes - Graph nodes after search and lifecycle filtering.
 * @param edges - Dependency edges joining the filtered nodes.
 * @param selectedId - Selected node id, or undefined for the complete graph.
 * @returns The selected node's weakly connected dependency component in stable input order.
 */
export function focusRuntimeGraph(
  nodes: readonly RuntimeGraphNode[],
  edges: readonly RuntimeGraphEdge[],
  selectedId: string | undefined,
): RuntimeGraphFocus {
  const nodeIds = new Set(nodes.map(node => node.id))
  const validEdges = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
  if (selectedId === undefined || !nodeIds.has(selectedId)) return { nodes, edges: validEdges }

  const neighbours = new Map<string, string[]>()
  for (const edge of validEdges) {
    const sourceNeighbours = neighbours.get(edge.source) ?? []
    sourceNeighbours.push(edge.target)
    neighbours.set(edge.source, sourceNeighbours)
    const targetNeighbours = neighbours.get(edge.target) ?? []
    targetNeighbours.push(edge.source)
    neighbours.set(edge.target, targetNeighbours)
  }
  const related = new Set<string>()
  const pending = [selectedId]
  while (pending.length > 0) {
    const id = pending.pop() as string
    if (related.has(id)) continue
    related.add(id)
    for (const neighbour of neighbours.get(id) ?? []) pending.push(neighbour)
  }
  return {
    nodes: nodes.filter(node => related.has(node.id)),
    edges: validEdges.filter(edge => related.has(edge.source) && related.has(edge.target)),
  }
}

function reachable(start: string, neighbours: ReadonlyMap<string, readonly string[]>): Set<string> {
  const found = new Set<string>()
  const pending = [...(neighbours.get(start) ?? [])]
  while (pending.length > 0) {
    const id = pending.pop() as string
    if (id === start || found.has(id)) continue
    found.add(id)
    for (const neighbour of neighbours.get(id) ?? []) pending.push(neighbour)
  }
  return found
}

/**
 * Classify the selected plugin's transitive dependencies and dependants.
 * Runtime edges point from a consumer (`source`) to its provider (`target`).
 * @param nodes - Visible nodes in the focused component.
 * @param edges - Visible dependency edges.
 * @param selectedId - Current focus node, or undefined outside focus mode.
 * @returns Stable node and edge relation maps used by graph styling and the legend.
 */
export function runtimeGraphRelations(
  nodes: readonly RuntimeGraphNode[],
  edges: readonly RuntimeGraphEdge[],
  selectedId: string | undefined,
): RuntimeGraphRelations {
  const nodeIds = new Set(nodes.map(node => node.id))
  if (selectedId === undefined || !nodeIds.has(selectedId)) return { nodes: new Map(), edges: new Map() }
  const dependencies = new Map<string, string[]>()
  const dependants = new Map<string, string[]>()
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue
    dependencies.set(edge.source, [...(dependencies.get(edge.source) ?? []), edge.target])
    dependants.set(edge.target, [...(dependants.get(edge.target) ?? []), edge.source])
  }
  const dependencyIds = reachable(selectedId, dependencies)
  const dependantIds = reachable(selectedId, dependants)
  const nodeRelations = new Map<string, RuntimeGraphRelation>()
  for (const node of nodes) {
    if (node.id === selectedId) nodeRelations.set(node.id, 'selected')
    else if (dependencyIds.has(node.id) && dependantIds.has(node.id)) nodeRelations.set(node.id, 'both')
    else if (dependencyIds.has(node.id)) nodeRelations.set(node.id, 'dependency')
    else if (dependantIds.has(node.id)) nodeRelations.set(node.id, 'dependant')
    else nodeRelations.set(node.id, 'related')
  }
  const edgeRelations = new Map<string, RuntimeGraphRelation>()
  for (const edge of edges) {
    const source = nodeRelations.get(edge.source)
    const target = nodeRelations.get(edge.target)
    const relation = edge.source === selectedId
      ? 'dependency'
      : edge.target === selectedId
        ? 'dependant'
        : source === 'dependency' && target === 'dependency'
          ? 'dependency'
          : source === 'dependant' && target === 'dependant'
            ? 'dependant'
            : source === 'both' || target === 'both'
              ? 'both'
              : 'related'
    edgeRelations.set(`${edge.source}:${edge.target}`, relation)
  }
  return { nodes: nodeRelations, edges: edgeRelations }
}

/**
 * Place providers before their consumers; dependency cycles share a column.
 * @param nodes - Visible runtime nodes after Client filtering.
 * @param edges - Visible dependency edges joining those nodes.
 * @returns Stable SVG dimensions and positions for every input node.
 */
export function layoutRuntimeGraph(
  nodes: readonly RuntimeGraphNode[],
  edges: readonly RuntimeGraphEdge[],
): RuntimeGraphLayout {
  const nodeIds = new Set(nodes.map(node => node.id))
  const providers = new Map<string, string[]>()
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue
    const targets = providers.get(edge.source) ?? []
    targets.push(edge.target)
    providers.set(edge.source, targets)
  }
  const memo = new Map<string, number>()
  const visiting = new Set<string>()
  const depthOf = (id: string): number => {
    const known = memo.get(id)
    if (known !== undefined) return known
    if (visiting.has(id)) return 0
    visiting.add(id)
    const targets = providers.get(id) ?? []
    const depth = targets.length === 0 ? 0 : Math.max(...targets.map(target => depthOf(target) + 1))
    visiting.delete(id)
    memo.set(id, depth)
    return depth
  }
  const columns = new Map<number, RuntimeGraphNode[]>()
  for (const node of nodes) {
    const depth = depthOf(node.id)
    const column = columns.get(depth) ?? []
    column.push(node)
    columns.set(depth, column)
  }
  const depths = [...columns.keys()].sort((a, b) => a - b)
  const maxRows = Math.max(1, ...[...columns.values()].map(column => column.length))
  const width = Math.max(760, PADDING * 2 + depths.length * NODE_WIDTH + Math.max(0, depths.length - 1) * COLUMN_GAP)
  const height = Math.max(520, PADDING * 2 + maxRows * NODE_HEIGHT + Math.max(0, maxRows - 1) * ROW_GAP)
  const positions: RuntimeNodePosition[] = []
  for (const [columnIndex, depth] of depths.entries()) {
    const column = columns.get(depth) as RuntimeGraphNode[]
    const columnHeight = column.length * NODE_HEIGHT + Math.max(0, column.length - 1) * ROW_GAP
    const top = Math.max(PADDING, (height - columnHeight) / 2)
    for (const [row, node] of column.sort((a, b) => a.label.localeCompare(b.label)).entries()) {
      positions.push({
        node,
        x: PADDING + columnIndex * (NODE_WIDTH + COLUMN_GAP),
        y: top + row * (NODE_HEIGHT + ROW_GAP),
      })
    }
  }
  return { width, height, positions, byId: new Map(positions.map(position => [position.node.id, position])) }
}

/**
 * Collapse detailed Loader Fiber phases into the four product-facing states.
 * @param phase - Detailed phase projected by the Host, or null without a live Fiber.
 * @returns Stable lifecycle status used by graph cards, nodes, and filters.
 */
export function runtimeLifecycleStatus(phase: RuntimeGraphNode['phase']): RuntimeLifecycleStatus {
  switch (phase) {
    case 'pending':
    case 'loading': return 'pending'
    case 'active': return 'active'
    case 'failed': return 'failed'
    case 'unloading':
    case null: return 'disposed'
  }
}

/**
 * Count the complete Loader projection by product-facing lifecycle state.
 * @param nodes - Unfiltered runtime nodes from the latest Host snapshot.
 * @returns Stable totals for the graph overview cards.
 */
export function summarizeRuntimeGraph(nodes: readonly RuntimeGraphNode[]): RuntimeGraphSummary {
  let pending = 0
  let active = 0
  let disposed = 0
  let failed = 0
  for (const node of nodes) {
    switch (runtimeLifecycleStatus(node.phase)) {
      case 'pending': pending += 1; break
      case 'active': active += 1; break
      case 'disposed': disposed += 1; break
      case 'failed': failed += 1; break
    }
  }
  return { pending, active, disposed, failed }
}

/** Width reserved for every runtime graph node. */
export const RUNTIME_NODE_WIDTH = NODE_WIDTH
/** Height reserved for every runtime graph node. */
export const RUNTIME_NODE_HEIGHT = NODE_HEIGHT

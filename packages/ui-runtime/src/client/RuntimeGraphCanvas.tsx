/** G6-backed force graph canvas for plugin-to-plugin Cordis relationships. */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowsPointingInIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline'
import type { EdgeData, Graph, GraphOptions, IElementEvent, NodeData } from '@antv/g6'
import type { RuntimeFiberPhase, RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import {
  buildRuntimeG6Data, runtimeG6CollisionRadius, runtimeG6DisplayLabel, runtimeG6EdgeMetadata, runtimeG6NodeMetadata,
  type RuntimeG6NodeCategory,
  runtimeG6TopologyKey, syncRuntimeG6Data,
} from './g6-graph.ts'
import { loadG6 } from './g6-runtime.ts'
import type { RuntimeGraphRelations, RuntimeGraphSavedPositions } from './graph.ts'
import type { RuntimeLocaleKey } from './locales.ts'
import type { RuntimeCategoryFilter } from './store.ts'
import css from './RuntimeExplorer.module.css'

const STATUS_COLORS = {
  pending: '#f3a62b',
  active: '#2bcf72',
  disposed: '#777c88',
  failed: '#ff5964',
  missing: '#ff5964',
} as const

const RELATION_COLORS = {
  selected: '#6395ff',
  dependency: '#6395ff',
  dependant: '#f3a62b',
  both: '#a88cff',
  related: '#5d626d',
} as const

const NODE_CATEGORY_COLORS: Record<RuntimeG6NodeCategory, { fill: string; stroke: string }> = {
  core: { fill: '#3730a3', stroke: '#a5b4fc' },
  agent: { fill: '#6d28d9', stroke: '#c4b5fd' },
  model: { fill: '#1d4ed8', stroke: '#93c5fd' },
  tool: { fill: '#047857', stroke: '#6ee7b7' },
  session: { fill: '#b45309', stroke: '#fcd34d' },
  interface: { fill: '#be185d', stroke: '#f9a8d4' },
  extension: { fill: '#334155', stroke: '#94a3b8' },
  missing: { fill: '#991b1b', stroke: '#fca5a5' },
}

const NODE_CATEGORY_KEYS: Array<[Exclude<RuntimeG6NodeCategory, 'missing'>, RuntimeLocaleKey]> = [
  ['core', 'categoryCore'],
  ['agent', 'categoryAgent'],
  ['model', 'categoryModel'],
  ['tool', 'categoryTool'],
  ['session', 'categorySession'],
  ['interface', 'categoryInterface'],
  ['extension', 'categoryExtension'],
]

const NODE_CATEGORY_LOCALE_KEYS: Record<RuntimeG6NodeCategory, RuntimeLocaleKey> = {
  core: 'categoryCore',
  agent: 'categoryAgent',
  model: 'categoryModel',
  tool: 'categoryTool',
  session: 'categorySession',
  interface: 'categoryInterface',
  extension: 'categoryExtension',
  missing: 'missingService',
}

const EDGE_LEGEND_ITEMS: Array<[string, RuntimeLocaleKey]> = [
  ['injects', 'edgeInjects'],
  ['dependency', 'dependencies'],
  ['dependant', 'dependants'],
  ['missing', 'edgeMissing'],
]

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2.4
const ZOOM_STEP = 1.2

export interface RuntimeGraphCanvasProps {
  readonly nodes: readonly RuntimeGraphNode[]
  readonly edges: readonly RuntimeGraphEdge[]
  readonly relations: RuntimeGraphRelations
  readonly selectedId: string | undefined
  readonly savedPositions: RuntimeGraphSavedPositions
  readonly graphLabel: string
  readonly phaseLabel: (phase: RuntimeFiberPhase) => string
  readonly onSelect: (id: string) => void
  readonly onPositionsChange: (positions: RuntimeGraphSavedPositions) => void
  readonly onResetPositions: () => void
  readonly categoryFilter: RuntimeCategoryFilter
  readonly onCategoryFilterChange: (category: RuntimeCategoryFilter) => void
  readonly t: (key: RuntimeLocaleKey) => string
}

function nodeStyle(datum: NodeData): Record<string, unknown> {
  const metadata = runtimeG6NodeMetadata(datum)
  const statusColor = STATUS_COLORS[metadata.phase]
  const categoryColor = NODE_CATEGORY_COLORS[metadata.category]
  const relationColor = metadata.relation === undefined
    ? categoryColor.stroke
    : RELATION_COLORS[metadata.relation as keyof typeof RELATION_COLORS] ?? statusColor
  const missing = metadata.kind === 'missing-service'
  return {
    size: metadata.size,
    fill: categoryColor.fill,
    stroke: relationColor,
    lineWidth: metadata.relation === 'selected' ? 3 : 1.5,
    lineDash: missing ? [5, 4] : undefined,
    cursor: missing ? 'default' : 'grab',
    shadowColor: metadata.relation === 'selected' ? 'rgba(99, 149, 255, 0.34)' : 'rgba(0, 0, 0, 0.28)',
    shadowBlur: metadata.relation === 'selected' ? 18 : 8,
    zIndex: 2,
    icon: false,
    label: true,
    labelText: runtimeG6DisplayLabel(metadata.label),
    labelPlacement: 'center',
    labelFill: '#ffffff',
    labelFontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    labelFontSize: missing ? 9 : metadata.size >= 96 ? 11 : 10,
    labelFontWeight: 600,
    labelLineHeight: missing ? 10 : 12,
    labelMaxLines: 3,
    labelMaxWidth: missing ? '72%' : '80%',
    labelWordWrap: false,
    labelTextOverflow: '...',
    labelBackground: false,
    badge: true,
    badges: [{
      text: '●',
      placement: 'right-top',
      offsetX: -18,
      offsetY: 18,
      background: false,
      fill: statusColor,
      fontSize: 8,
    }],
  }
}

function edgeStyle(datum: EdgeData): Record<string, unknown> {
  const metadata = runtimeG6EdgeMetadata(datum)
  const color = metadata.relation === undefined
    ? '#555a64'
    : RELATION_COLORS[metadata.relation as keyof typeof RELATION_COLORS] ?? '#555a64'
  const missing = metadata.kind === 'missing'
  const lineDash = missing
    ? [6, 4]
    : metadata.relation === 'dependant'
      ? [8, 4]
      : metadata.relation === 'both'
        ? [2, 3]
        : undefined
  return {
    stroke: missing ? STATUS_COLORS.missing : color,
    zIndex: 0,
    lineWidth: metadata.relation === undefined ? 1 : 1.5,
    opacity: metadata.relation === undefined ? 0.38 : 0.74,
    lineDash,
    endArrow: true,
    endArrowFill: missing ? STATUS_COLORS.missing : color,
    endArrowSize: 5,
    lineCap: 'round',
  }
}

function tooltipPill(text: string, className: string): HTMLSpanElement {
  const pill = document.createElement('span')
  pill.className = className
  pill.textContent = text
  return pill
}

function tooltipContent(items: Array<NodeData | EdgeData>, t: (key: RuntimeLocaleKey) => string): HTMLElement {
  const element = document.createElement('div')
  element.className = 'dsh-runtime-g6-tooltip'
  const item = items[0]
  if (item === undefined) return element
  if (typeof (item as EdgeData).source === 'string') {
    const metadata = runtimeG6EdgeMetadata(item as EdgeData)
    element.dataset.kind = metadata.kind
    element.style.setProperty('--runtime-tooltip-accent', metadata.kind === 'missing' ? STATUS_COLORS.missing : '#6395ff')
    const accent = document.createElement('i')
    accent.className = 'dsh-runtime-g6-tooltip__accent'
    accent.setAttribute('aria-hidden', 'true')
    const eyebrow = document.createElement('div')
    eyebrow.className = 'dsh-runtime-g6-tooltip__eyebrow'
    eyebrow.append(tooltipPill(t('edgeTypes'), 'dsh-runtime-g6-tooltip__category'))
    const title = document.createElement('strong')
    title.className = 'dsh-runtime-g6-tooltip__title'
    title.textContent = metadata.kind === 'missing' ? t('edgeMissing') : t('edgeInjects')
    const services = document.createElement('span')
    services.className = 'dsh-runtime-g6-tooltip__module'
    services.textContent = metadata.services.join(' · ')
    element.append(accent, eyebrow, title, services)
    return element
  }
  const metadata = runtimeG6NodeMetadata(item as NodeData)
  const categoryColor = NODE_CATEGORY_COLORS[metadata.category]
  element.dataset.kind = metadata.kind
  element.dataset.phase = metadata.phase
  element.style.setProperty('--runtime-tooltip-accent', categoryColor.stroke)
  const accent = document.createElement('i')
  accent.className = 'dsh-runtime-g6-tooltip__accent'
  accent.setAttribute('aria-hidden', 'true')
  const eyebrow = document.createElement('div')
  eyebrow.className = 'dsh-runtime-g6-tooltip__eyebrow'
  eyebrow.append(
    tooltipPill(t(NODE_CATEGORY_LOCALE_KEYS[metadata.category]), 'dsh-runtime-g6-tooltip__category'),
    tooltipPill(
      metadata.kind === 'missing-service' ? t('missingService') : t(metadata.phase),
      'dsh-runtime-g6-tooltip__phase',
    ),
  )
  const title = document.createElement('strong')
  title.className = 'dsh-runtime-g6-tooltip__title'
  title.textContent = metadata.label
  const moduleName = document.createElement('span')
  moduleName.className = 'dsh-runtime-g6-tooltip__module'
  moduleName.textContent = metadata.kind === 'missing-service'
    ? metadata.service ?? metadata.label
    : metadata.moduleName ?? metadata.label
  element.append(accent, eyebrow, title, moduleName)
  if (metadata.kind === 'plugin') {
    const stats = document.createElement('dl')
    stats.className = 'dsh-runtime-g6-tooltip__stats'
    const values: Array<[RuntimeLocaleKey, number]> = [
      ['provides', metadata.provides.length],
      ['injects', metadata.injects.length],
      ['missing', metadata.missing.length],
    ]
    for (const [key, value] of values) {
      const stat = document.createElement('div')
      stat.className = 'dsh-runtime-g6-tooltip__stat'
      const count = document.createElement('dd')
      count.textContent = String(value)
      const label = document.createElement('dt')
      label.textContent = t(key)
      stat.append(count, label)
      stats.append(stat)
    }
    element.append(stats)
  }
  return element
}

function graphOptions(
  container: HTMLElement,
  data: ReturnType<typeof buildRuntimeG6Data>,
  onDragFinish: (ids: string[]) => void,
  t: (key: RuntimeLocaleKey) => string,
): GraphOptions {
  return {
    container,
    data,
    autoResize: true,
    padding: 76,
    zoomRange: [MIN_ZOOM, MAX_ZOOM],
    node: {
      type: 'circle',
      style: nodeStyle,
      state: {
        selected: {
          lineWidth: 3.5,
          stroke: RELATION_COLORS.selected,
          shadowColor: 'rgba(99, 149, 255, 0.48)',
          shadowBlur: 22,
        },
      },
      animation: false,
    },
    edge: {
      // G6 clips line endpoints against circle boundaries. Opaque nodes stay above
      // the edge layer so relationship lines never render through node bodies.
      type: 'line',
      style: edgeStyle,
      state: {},
      animation: false,
    },
    layout: {
      type: 'd3-force',
      alpha: 0.9,
      alphaMin: 0.08,
      alphaDecay: 0.12,
      alphaTarget: 0,
      velocityDecay: 0.5,
      link: { distance: 178, strength: 0.66 },
      manyBody: { strength: -340 },
      center: { strength: 0.045 },
      collide: {
        radius: (datum: { size?: number }) => runtimeG6CollisionRadius(datum.size ?? 58),
        strength: 1,
        iterations: 5,
      },
    },
    behaviors: [
      { type: 'drag-canvas', key: 'drag-canvas' },
      { type: 'zoom-canvas', key: 'zoom-canvas', sensitivity: 1 },
      {
        type: 'drag-element-force', key: 'drag-element-force', fixed: true, hideEdge: 'none',
        onFinish: (ids: string[]) => { onDragFinish(ids) },
      },
      { type: 'auto-adapt-label', key: 'auto-adapt-label' },
      { type: 'optimize-viewport-transform', key: 'optimize-viewport-transform', debounce: 120 },
    ],
    plugins: [
      {
        type: 'tooltip', key: 'runtime-tooltip', trigger: 'hover',
        style: {
          '.tooltip': {
            padding: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            borderRadius: '12px',
            color: 'inherit',
            fontFamily: 'inherit',
          },
        },
        getContent: (_event: IElementEvent, items: Array<NodeData | EdgeData>) => tooltipContent(items, t),
        onOpenChange: () => undefined,
      },
    ],
  }
}

export function RuntimeGraphCanvas({
  nodes, edges, relations, selectedId, savedPositions, graphLabel, phaseLabel, onSelect,
  onPositionsChange, onResetPositions, categoryFilter, onCategoryFilterChange, t,
}: RuntimeGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph>()
  const topologyRef = useRef<string>()
  const selectedRef = useRef(selectedId)
  const callbacksRef = useRef({ onSelect, onPositionsChange })
  const dataRef = useRef<ReturnType<typeof buildRuntimeG6Data>>()
  const nodesRef = useRef(nodes)
  const savedPositionsRef = useRef(savedPositions)
  const [zoom, setZoom] = useState(1)
  const [rendererFailed, setRendererFailed] = useState(false)
  callbacksRef.current = { onSelect, onPositionsChange }
  nodesRef.current = nodes
  savedPositionsRef.current = savedPositions

  const data = useMemo(
    () => buildRuntimeG6Data(nodes, edges, relations, selectedId, savedPositions),
    [edges, nodes, relations, savedPositions, selectedId],
  )
  dataRef.current = data

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return
    let disposed = false
    const handleDragFinish = (ids: string[]): void => {
      const graph = graphRef.current
      if (graph === undefined) return
      const next = { ...savedPositionsRef.current }
      for (const id of ids) {
        const node = nodesRef.current.find(item => item.id === id)
        if (node === undefined) continue
        const position = graph.getElementPosition(id)
        const x = position[0] ?? 0
        const y = position[1] ?? 0
        next[node.logicalKey] = { x, y, pinned: true }
      }
      callbacksRef.current.onPositionsChange(next)
    }
    void loadG6().then(async ({ Graph: G6Graph }) => {
      if (disposed || dataRef.current === undefined) return
      const graph = new G6Graph(graphOptions(container, dataRef.current, handleDragFinish, t))
      graphRef.current = graph
      graph.on('node:click', (event: IElementEvent) => {
        const id = String(event.target.id)
        if (!id.startsWith('missing:')) callbacksRef.current.onSelect(id)
      })
      const hideRuntimeTooltip = (): void => {
        const tooltip = graph.getPluginInstance('runtime-tooltip') as unknown as { hide?: () => void } | undefined
        tooltip?.hide?.()
      }
      graph.on('node:pointerleave', hideRuntimeTooltip)
      graph.on('edge:pointerleave', hideRuntimeTooltip)
      graph.on('canvas:pointerleave', hideRuntimeTooltip)
      graph.on('aftertransform', () => {
        if (disposed || graphRef.current !== graph) return
        // G6 can emit while its viewport controller is still being initialized.
        try { setZoom(graph.getZoom()) } catch { /* wait for the next transform */ }
      })
      try {
        await graph.render()
        if (disposed) return
        topologyRef.current = runtimeG6TopologyKey(dataRef.current)
        await graph.fitView({ when: 'always', direction: 'both' }, false)
        if (!disposed && graphRef.current === graph) setZoom(graph.getZoom())
      } catch {
        if (!disposed) setRendererFailed(true)
      }
    }).catch(() => { if (!disposed) setRendererFailed(true) })
    return () => {
      disposed = true
      graphRef.current?.destroy()
      graphRef.current = undefined
      topologyRef.current = undefined
    }
  }, [])

  useEffect(() => {
    const graph = graphRef.current
    if (graph === undefined) return
    let disposed = false
    const topology = runtimeG6TopologyKey(data)
    const selectionChanged = selectedRef.current !== selectedId
    selectedRef.current = selectedId
    void syncRuntimeG6Data(graph, data, topologyRef.current).then(async () => {
      if (disposed) return
      topologyRef.current = topology
      if (selectionChanged && selectedId !== undefined) {
        await graph.fitView({ when: 'always', direction: 'both' }, { duration: 220, easing: 'ease-out' })
        if (!disposed) setZoom(graph.getZoom())
      }
    }).catch(() => { if (!disposed) setRendererFailed(true) })
    return () => { disposed = true }
  }, [data, selectedId])

  const zoomTo = async (next: number): Promise<void> => {
    const graph = graphRef.current
    if (graph === undefined) return
    await graph.zoomTo(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)), { duration: 160, easing: 'ease-out' })
    setZoom(graph.getZoom())
  }
  const fitView = async (): Promise<void> => {
    const graph = graphRef.current
    if (graph === undefined) return
    await graph.fitView({ when: 'always', direction: 'both' }, { duration: 220, easing: 'ease-out' })
    setZoom(graph.getZoom())
  }
  const reset = (): void => {
    onResetPositions()
  }

  return (
    <div className={css.graphCanvasShell}>
      <div ref={containerRef} className={css.graphCanvas} role="img" aria-label={graphLabel} />
      {rendererFailed && <div className={css.graphRendererError}>{t('graphRendererFailed')}</div>}
      <div className={css.nodeTypeLegend} aria-label={t('pluginTypes')}>
        {NODE_CATEGORY_KEYS.map(([category, key]) => (
          <button
            key={category}
            type="button"
            aria-pressed={categoryFilter === category}
            style={{ '--runtime-node-color': NODE_CATEGORY_COLORS[category].stroke } as CSSProperties}
            onClick={() => { onCategoryFilterChange(categoryFilter === category ? 'all' : category) }}
          >
            <i aria-hidden />
            {t(key)}
          </button>
        ))}
      </div>
      <div className={css.edgeTypeLegend} aria-label={t('edgeTypes')}>
        {EDGE_LEGEND_ITEMS.map(([kind, key]) => (
          <span key={kind} data-edge-kind={kind}><i aria-hidden />{t(key)}</span>
        ))}
      </div>
      <ul className={css.graphA11yList} aria-label={graphLabel}>
        {nodes.map(node => (
          <li key={node.id}>
            <button type="button" onClick={() => { onSelect(node.id) }}>
              {node.label}, {phaseLabel(node.phase)}
            </button>
          </li>
        ))}
      </ul>
      <div className={css.zoomControls} role="group" aria-label={t('zoomControls')}>
        <Tooltip label={t('zoomOut')} side="top" delayMs={400}>
          <button
            type="button" aria-label={t('zoomOut')} disabled={zoom <= MIN_ZOOM + 0.01}
            onClick={() => { void zoomTo(zoom / ZOOM_STEP) }}
          >
            <MagnifyingGlassMinusIcon aria-hidden="true" width={18} height={18} />
          </button>
        </Tooltip>
        <output aria-label={t('zoomLevel')} aria-live="polite">{Math.round(zoom * 100)}%</output>
        <Tooltip label={t('zoomIn')} side="top" delayMs={400}>
          <button
            type="button" aria-label={t('zoomIn')} disabled={zoom >= MAX_ZOOM - 0.01}
            onClick={() => { void zoomTo(zoom * ZOOM_STEP) }}
          >
            <MagnifyingGlassPlusIcon aria-hidden="true" width={18} height={18} />
          </button>
        </Tooltip>
        <Tooltip label={t('fitView')} side="top" delayMs={400}>
          <button type="button" aria-label={t('fitView')} onClick={() => { void fitView() }}>
            <ArrowsPointingInIcon aria-hidden="true" width={18} height={18} />
          </button>
        </Tooltip>
        <button type="button" onClick={reset}>{t('resetZoom')}</button>
      </div>
    </div>
  )
}

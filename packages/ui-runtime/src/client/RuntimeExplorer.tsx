/** Runtime graph, request trace, filters, and metadata inspector. */

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import clsx from 'clsx'
import {
  ArrowLeftIcon, ArrowsPointingInIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline'
import type {
  RuntimeFiberPhase, RuntimeGraphEdge, RuntimeGraphNode, RuntimeTraceEvent, RuntimeTraceLane,
} from '@deepseek-ai/dsh-api-remotes/client'
import {
  IconBranchOutline16, IconCloseOutline16, IconCordisPluginOutline14, IconDataOutline16, IconRefreshOutline16,
  IconSearchOutline16, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { RuntimeExplorerFace } from './faces.ts'
import {
  focusRuntimeGraph, layoutRuntimeGraph, RUNTIME_NODE_HEIGHT, RUNTIME_NODE_WIDTH, runtimeGraphRelations,
  runtimeLifecycleStatus, summarizeRuntimeGraph,
} from './graph.ts'
import type { RuntimeGraphSummary, RuntimeNodePosition } from './graph.ts'
import type { RuntimeLocaleKey } from './locales.ts'
import type { createRuntimeStore, RuntimePhaseFilter } from './store.ts'
import { filterRuntimeTrace, groupRuntimeTrace, type RuntimeTraceSession, type RuntimeTraceTurn } from './trace.ts'
import css from './RuntimeExplorer.module.css'

export type RuntimeExplorerProps =
  & PropsRuntime<'shell.overlay'>
  & PropsStore<ReturnType<typeof createRuntimeStore>>
  & InjectFace<RuntimeExplorerFace>
  & PropsLocale<'runtime'>

const STATUS_LABELS = {
  pending: 'pending',
  active: 'active',
  disposed: 'disposed',
  failed: 'failed',
} as const satisfies Record<Exclude<RuntimePhaseFilter, 'all'>, RuntimeLocaleKey>

const LANE_LABELS = {
  user: 'laneUser',
  agent: 'laneAgent',
  llm: 'laneLlm',
  tool: 'laneTool',
  session: 'laneSession',
} as const satisfies Record<RuntimeTraceLane, RuntimeLocaleKey>

const TURN_STATUS_LABELS = {
  running: 'turnRunning',
  completed: 'turnCompleted',
  failed: 'turnFailed',
  stopped: 'turnStopped',
  incomplete: 'turnIncomplete',
} as const satisfies Record<RuntimeTraceTurn['status'], RuntimeLocaleKey>

const GRAPH_ZOOM_LEVELS = [0.8, 1, 1.2, 1.4] as const
const DEFAULT_GRAPH_ZOOM_INDEX = 1
const GRAPH_PAN_THRESHOLD = 3

function statusKey(phase: RuntimeFiberPhase): Exclude<RuntimePhaseFilter, 'all'> {
  return runtimeLifecycleStatus(phase)
}

function includesNode(node: RuntimeGraphNode, query: string): boolean {
  if (query === '') return true
  const text = [node.label, node.moduleName, node.entryId, ...node.provides, ...node.injects].join('\n').toLowerCase()
  return text.includes(query)
}

function includesEvent(event: RuntimeTraceEvent, query: string): boolean {
  if (query === '') return true
  return [event.type, event.sessionId, event.name, event.callId, event.outcome]
    .filter(value => value !== undefined)
    .join('\n').toLowerCase().includes(query)
}

function shortSessionId(sessionId: string): string {
  if (sessionId.length <= 18) return sessionId
  return `${sessionId.slice(0, 10)}…${sessionId.slice(-4)}`
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs} ms`
  if (durationMs < 10_000) return `${(durationMs / 1000).toFixed(1)} s`
  return `${Math.round(durationMs / 1000)} s`
}

function graphEdgesFor(nodes: readonly RuntimeGraphNode[], edges: readonly RuntimeGraphEdge[]): RuntimeGraphEdge[] {
  const ids = new Set(nodes.map(node => node.id))
  return edges.filter(edge => ids.has(edge.source) && ids.has(edge.target))
}

function MetadataList({ values, empty }: { values: readonly string[]; empty: string }) {
  if (values.length === 0) return <span className={css.emptyValue}>{empty}</span>
  return <div className={css.chips}>{values.map(value => <code key={value}>{value}</code>)}</div>
}

function GraphView({
  nodes, edges, summary, totalNodes, selectedId, selectedLabel, onSelect, onClearSelection,
  empty, graphLabel, phaseLabel, t,
}: {
  nodes: readonly RuntimeGraphNode[]
  edges: readonly RuntimeGraphEdge[]
  summary: RuntimeGraphSummary
  totalNodes: number
  selectedId: string | undefined
  selectedLabel: string | undefined
  onSelect: (id: string) => void
  onClearSelection: () => void
  empty: string
  graphLabel: string
  phaseLabel: (phase: RuntimeFiberPhase) => string
  t: RuntimeExplorerProps['t']
}) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_GRAPH_ZOOM_INDEX)
  const [panning, setPanning] = useState(false)
  const [fitRequest, setFitRequest] = useState(0)
  const focus = useMemo(() => focusRuntimeGraph(nodes, edges, selectedId), [edges, nodes, selectedId])
  const layout = useMemo(() => layoutRuntimeGraph(focus.nodes, focus.edges), [focus.edges, focus.nodes])
  const relations = useMemo(
    () => runtimeGraphRelations(focus.nodes, focus.edges, selectedId),
    [focus.edges, focus.nodes, selectedId],
  )
  const scroller = useRef<HTMLDivElement>(null)
  const currentLayout = useRef(layout)
  currentLayout.current = layout
  const pan = useRef<{
    pointerId: number
    clientX: number
    clientY: number
    scrollLeft: number
    scrollTop: number
    moved: boolean
  }>()
  useLayoutEffect(() => {
    const viewport = scroller.current
    if (viewport === null) return
    const selected = selectedId === undefined ? undefined : currentLayout.current.byId.get(selectedId)
    if (selected === undefined || viewport.clientWidth === 0 || viewport.clientHeight === 0) {
      viewport.scrollLeft = 0
      viewport.scrollTop = 0
      return
    }
    const scale = GRAPH_ZOOM_LEVELS[zoomIndex] as number
    viewport.scrollLeft = Math.max(0, (selected.x + RUNTIME_NODE_WIDTH / 2) * scale - viewport.clientWidth / 2)
    viewport.scrollTop = Math.max(0, (selected.y + RUNTIME_NODE_HEIGHT / 2) * scale - viewport.clientHeight / 2)
  }, [fitRequest, selectedId, zoomIndex])
  const scale = GRAPH_ZOOM_LEVELS[zoomIndex] as number
  const startPan = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 || !event.isPrimary) return
    if ((event.target as Element).closest('button, a, input, select, textarea') !== null) return
    const viewport = event.currentTarget
    pan.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      moved: false,
    }
    viewport.setPointerCapture(event.pointerId)
    setPanning(true)
  }
  const movePan = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const gesture = pan.current
    if (gesture === undefined || gesture.pointerId !== event.pointerId) return
    const deltaX = event.clientX - gesture.clientX
    const deltaY = event.clientY - gesture.clientY
    if (!gesture.moved && Math.hypot(deltaX, deltaY) < GRAPH_PAN_THRESHOLD) return
    gesture.moved = true
    event.preventDefault()
    event.currentTarget.scrollLeft = gesture.scrollLeft - deltaX
    event.currentTarget.scrollTop = gesture.scrollTop - deltaY
  }
  const endPan = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (pan.current?.pointerId !== event.pointerId) return
    pan.current = undefined
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setPanning(false)
  }
  const resetZoom = (): void => {
    setZoomIndex(DEFAULT_GRAPH_ZOOM_INDEX)
    const viewport = scroller.current as HTMLDivElement
    viewport.scrollLeft = 0
    viewport.scrollTop = 0
  }
  const fitView = (): void => {
    const viewport = scroller.current
    if (viewport === null) return
    const availableWidth = Math.max(1, viewport.clientWidth - 48)
    const availableHeight = Math.max(1, viewport.clientHeight - 48)
    const ideal = Math.min(availableWidth / layout.width, availableHeight / layout.height)
    let next = 0
    for (const [index, level] of GRAPH_ZOOM_LEVELS.entries()) {
      if (level <= ideal) next = index
    }
    setZoomIndex(next)
    setFitRequest(current => current + 1)
  }
  const summaryItems: Array<[RuntimeLocaleKey, number, string]> = [
    ['pending', summary.pending, 'pending'],
    ['active', summary.active, 'active'],
    ['disposed', summary.disposed, 'disposed'],
    ['failed', summary.failed, 'failed'],
  ]
  return (
    <div className={css.graphView}>
      <dl className={css.graphSummary} aria-label={t('pluginSummary')}>
        {summaryItems.map(([label, value, state]) => (
          <div key={label} data-state={state}>
            <dt>{t(label)}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {selectedId !== undefined && selectedLabel !== undefined && (
        <div className={css.focusBar} role="status" aria-live="polite">
          <span className={css.focusIdentity}><span>{t('focusedNode')}</span><strong>{selectedLabel}</strong></span>
          <span className={css.focusCount}>{t('relatedPlugins')} <strong>{focus.nodes.length}</strong> / {totalNodes}</span>
          <span className={css.relationLegend} aria-label={t('dependencyDirection')}>
            <span data-relation="dependency"><i aria-hidden />{t('dependencies')}</span>
            <span data-relation="dependant"><i aria-hidden />{t('dependants')}</span>
          </span>
          <button type="button" className={css.showAll} onClick={onClearSelection}>{t('showAll')}</button>
        </div>
      )}
      {nodes.length === 0 ? <div className={css.emptyState}>{empty}</div> : (
        <div
          ref={scroller}
          className={css.graphScroller}
          data-panning={panning || undefined}
          tabIndex={0}
          aria-label={t('panCanvas')}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onLostPointerCapture={endPan}
        >
          <div
            className={css.graphStage}
            style={{ width: layout.width * scale, height: layout.height * scale }}
          >
            <svg
              className={css.graph}
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              style={{ transform: `scale(${scale})` }}
              role="img"
              aria-label={graphLabel}
            >
              <g className={css.edges}>
                {focus.edges.map((edge) => {
                  const consumer = layout.byId.get(edge.source) as RuntimeNodePosition
                  const provider = layout.byId.get(edge.target) as RuntimeNodePosition
                  const x1 = provider.x + RUNTIME_NODE_WIDTH
                  const y1 = provider.y + RUNTIME_NODE_HEIGHT / 2
                  const x2 = consumer.x
                  const y2 = consumer.y + RUNTIME_NODE_HEIGHT / 2
                  const bend = Math.max(32, (x2 - x1) / 2)
                  return (
                    <path
                      key={`${edge.source}:${edge.target}`}
                      d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`}
                      data-relation={relations.edges.get(`${edge.source}:${edge.target}`)}
                    >
                      <title>{edge.services.join(', ')}</title>
                    </path>
                  )
                })}
              </g>
              {layout.positions.map(({ node, x, y }) => (
                <foreignObject key={node.id} x={x} y={y} width={RUNTIME_NODE_WIDTH} height={RUNTIME_NODE_HEIGHT}>
                  <button
                    type="button"
                    className={css.graphNode}
                    data-phase={statusKey(node.phase)}
                    data-selected={selectedId === node.id || undefined}
                    data-relation={relations.nodes.get(node.id)}
                    onClick={() => { onSelect(node.id) }}
                  >
                    <span className={css.nodeIcon}><IconCordisPluginOutline14 size={16} /></span>
                    <span className={css.nodeCopy}>
                      <strong>{node.label}</strong>
                      <small><i aria-hidden />{phaseLabel(node.phase)}</small>
                    </span>
                  </button>
                </foreignObject>
              ))}
            </svg>
          </div>
        </div>
      )}
      {nodes.length > 0 && <div className={css.zoomControls} role="group" aria-label={t('zoomControls')}>
        <Tooltip label={t('zoomOut')} side="top" delayMs={400}>
          <button
            type="button"
            aria-label={t('zoomOut')}
            disabled={zoomIndex === 0}
            onClick={() => { setZoomIndex(current => Math.max(0, current - 1)) }}
          >
            <MagnifyingGlassMinusIcon aria-hidden="true" width={18} height={18} />
          </button>
        </Tooltip>
        <output aria-label={t('zoomLevel')} aria-live="polite">{Math.round(scale * 100)}%</output>
        <Tooltip label={t('zoomIn')} side="top" delayMs={400}>
          <button
            type="button"
            aria-label={t('zoomIn')}
            disabled={zoomIndex === GRAPH_ZOOM_LEVELS.length - 1}
            onClick={() => { setZoomIndex(current => Math.min(GRAPH_ZOOM_LEVELS.length - 1, current + 1)) }}
          >
            <MagnifyingGlassPlusIcon aria-hidden="true" width={18} height={18} />
          </button>
        </Tooltip>
        <Tooltip label={t('fitView')} side="top" delayMs={400}>
          <button type="button" aria-label={t('fitView')} onClick={fitView}>
            <ArrowsPointingInIcon aria-hidden="true" width={18} height={18} />
          </button>
        </Tooltip>
        <button type="button" onClick={resetZoom}>{t('resetZoom')}</button>
      </div>}
    </div>
  )
}

function TraceTimeline({
  turn, events, selectedId, onSelect, onBack, empty, laneLabel, timeLabel, t,
}: {
  turn: RuntimeTraceTurn
  events: readonly RuntimeTraceEvent[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  onBack: () => void
  empty: string
  laneLabel: (lane: RuntimeTraceLane) => string
  timeLabel: string
  t: RuntimeExplorerProps['t']
}) {
  return (
    <div className={css.traceDetail}>
      <header className={css.traceDetailHeader}>
        <button type="button" className={css.traceBack} onClick={onBack}>
          <ArrowLeftIcon aria-hidden="true" width={16} height={16} />
          {t('backToTurns')}
        </button>
        <div className={css.traceDetailIdentity}>
          <code title={turn.sessionId}>{shortSessionId(turn.sessionId)}</code>
          <span aria-hidden="true">/</span>
          <strong>{t('turn')} #{turn.turn}</strong>
          <span className={css.turnStatus} data-status={turn.status}>{t(TURN_STATUS_LABELS[turn.status])}</span>
        </div>
        <dl className={css.turnMetrics}>
          <div><dt>{t('duration')}</dt><dd>{formatDuration(turn.durationMs)}</dd></div>
          <div><dt>{t('events')}</dt><dd>{turn.eventCount}</dd></div>
          <div><dt>{t('steps')}</dt><dd>{turn.stepCount}</dd></div>
          <div><dt>{t('toolCalls')}</dt><dd>{turn.toolCallCount}</dd></div>
        </dl>
      </header>
      {events.length === 0
        ? <div className={css.emptyState}>{empty}</div>
        : <div className={css.traceScroller}>
          <div className={css.traceGrid}>
            <div className={css.traceCorner}>{timeLabel}</div>
            {(Object.keys(LANE_LABELS) as RuntimeTraceLane[]).map(lane => (
              <div key={lane} className={css.traceLane}>{laneLabel(lane)}</div>
            ))}
            {events.map(event => (
              <div key={event.id} className={css.traceRow}>
                <time dateTime={new Date(event.time).toISOString()}>
                  {new Date(event.time).toLocaleTimeString([], { hour12: false })}
                </time>
                <button
                  type="button"
                  className={css.traceEvent}
                  data-lane={event.lane}
                  data-selected={selectedId === event.id || undefined}
                  onClick={() => { onSelect(event.id) }}
                >
                  <span>{event.type}</span>
                  <small>{event.name ?? `#${event.seq}`}</small>
                </button>
              </div>
            ))}
          </div>
        </div>}
    </div>
  )
}

function TraceDirectory({
  sessions, onSelect, empty, t,
}: {
  sessions: readonly RuntimeTraceSession[]
  onSelect: (key: string) => void
  empty: string
  t: RuntimeExplorerProps['t']
}) {
  const turnCount = sessions.reduce((count, session) => count + session.turns.length, 0)
  if (turnCount === 0) return <div className={css.emptyState}>{empty}</div>
  const runningCount = sessions.reduce(
    (count, session) => count + session.turns.filter(turn => turn.status === 'running').length,
    0,
  )
  return (
    <div className={css.traceDirectory}>
      <dl className={css.traceSummary} aria-label={t('traceSummary')}>
        <div><dt>{t('sessions')}</dt><dd>{sessions.length}</dd></div>
        <div><dt>{t('agentTurns')}</dt><dd>{turnCount}</dd></div>
        <div><dt>{t('runningTurns')}</dt><dd>{runningCount}</dd></div>
      </dl>
      <div className={css.traceSessions}>
        {sessions.map(session => (
          <section key={session.sessionId} className={css.traceSession}>
            <header>
              <div><span>{t('session')}</span><code title={session.sessionId}>{shortSessionId(session.sessionId)}</code></div>
              <small>{session.turns.length} {t('turns')} · {session.eventCount} {t('events')}</small>
            </header>
            <div className={css.turnList}>
              {session.turns.map(turn => (
                <button
                  key={turn.key}
                  type="button"
                  className={css.turnRow}
                  aria-label={`${t('turn')} ${turn.turn}, ${t(TURN_STATUS_LABELS[turn.status])}`}
                  onClick={() => { onSelect(turn.key) }}
                >
                  <div className={css.turnIdentity}>
                    <strong>{t('turn')} #{turn.turn}</strong>
                    <time dateTime={new Date(turn.startedAt).toISOString()}>
                      {new Date(turn.startedAt).toLocaleTimeString([], { hour12: false })}
                    </time>
                  </div>
                  <span className={css.turnStatus} data-status={turn.status}>{t(TURN_STATUS_LABELS[turn.status])}</span>
                  <dl className={css.turnMetrics}>
                    <div><dt>{t('duration')}</dt><dd>{formatDuration(turn.durationMs)}</dd></div>
                    <div><dt>{t('events')}</dt><dd>{turn.eventCount}</dd></div>
                    <div><dt>{t('steps')}</dt><dd>{turn.stepCount}</dd></div>
                    <div><dt>{t('toolCalls')}</dt><dd>{turn.toolCallCount}</dd></div>
                  </dl>
                  <ChevronRightIcon aria-hidden="true" width={17} height={17} />
                </button>
              ))}
              {session.sessionEvents.length > 0 && (
                <p className={css.sessionEvents}>{t('sessionEvents')}: {session.sessionEvents.length}</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function PluginInspector({ node, t }: { node: RuntimeGraphNode; t: RuntimeExplorerProps['t'] }) {
  const rows: Array<[RuntimeLocaleKey, string]> = [
    ['module', node.moduleName],
    ['entry', node.entryId],
    ['status', t(STATUS_LABELS[statusKey(node.phase)])],
  ]
  return (
    <>
      <div className={css.inspectorTitle}>
        <span className={css.inspectorIcon}><IconCordisPluginOutline14 size={18} /></span>
        <div><strong>{node.label}</strong><small>{t('selectedPlugin')}</small></div>
      </div>
      <dl className={css.metadata}>
        {rows.map(([label, value]) => <div key={label}><dt>{t(label)}</dt><dd>{value}</dd></div>)}
      </dl>
      <section className={css.inspectorSection}><h3>{t('provides')}</h3><MetadataList values={node.provides} empty={t('noItems')} /></section>
      <section className={css.inspectorSection}><h3>{t('injects')}</h3><MetadataList values={node.injects} empty={t('noItems')} /></section>
      {node.missing.length > 0 && <section className={css.inspectorSection} data-warning><h3>{t('missing')}</h3><MetadataList values={node.missing} empty={t('noItems')} /></section>}
      <section className={css.inspectorSection}>
        <h3>{t('effects')} <span>{node.effectCount}</span></h3>
        <MetadataList values={node.effects} empty={t('noItems')} />
      </section>
    </>
  )
}

function EventInspector({ event, t }: { event: RuntimeTraceEvent; t: RuntimeExplorerProps['t'] }) {
  const rows: Array<[RuntimeLocaleKey, string | number | undefined]> = [
    ['session', event.sessionId],
    ['event', event.type],
    ['sequence', event.seq],
    ['payload', event.payloadChars],
    ['turn', event.turn],
    ['step', event.step],
    ['callId', event.callId],
    ['tool', event.name],
    ['outcome', event.outcome],
  ]
  return (
    <>
      <div className={css.inspectorTitle}>
        <span className={css.inspectorIcon}><IconDataOutline16 size={18} /></span>
        <div><strong>{event.type}</strong><small>{t('selectedEvent')}</small></div>
      </div>
      <dl className={css.metadata}>
        {rows.filter(([, value]) => value !== undefined).map(([label, value]) => (
          <div key={label}><dt>{t(label)}</dt><dd>{String(value)}</dd></div>
        ))}
      </dl>
      <p className={css.privacy}>{t('privacy')}</p>
    </>
  )
}

/** Render the frame overlay and keep Remote polling bound to its visible lifetime. */
export function RuntimeExplorer({
  useStore, useRuntime, actions, onVisibilityChange, onRefresh, t,
}: RuntimeExplorerProps) {
  const state = useStore(current => current)
  const remote = useRuntime(current => current)
  useEffect(() => {
    if (!state.open) return
    onVisibilityChange(true)
    return () => { onVisibilityChange(false) }
  }, [onVisibilityChange, state.open])
  const query = state.query.trim().toLowerCase()
  const data = remote.data
  const traceSessions = useMemo(() => groupRuntimeTrace(data?.trace ?? []), [data?.trace])
  const visibleTraceSessions = useMemo(
    () => filterRuntimeTrace(traceSessions, query),
    [query, traceSessions],
  )
  if (!state.open) return null

  const graphNodes = data?.graph.nodes.filter(node => (
    includesNode(node, query)
    && (state.phase === 'all' || statusKey(node.phase) === state.phase)
  )) ?? []
  const graphEdges = data === undefined ? [] : graphEdgesFor(graphNodes, data.graph.edges)
  const selectedTurn = traceSessions.flatMap(session => session.turns)
    .find(turn => turn.key === state.traceTurnKey)
  const traceEvents = selectedTurn?.events.filter(event => includesEvent(event, query)) ?? []
  const selectedNode = state.selection?.kind === 'node'
    ? data?.graph.nodes.find(node => node.id === state.selection?.id)
    : undefined
  const selectedEvent = state.selection?.kind === 'event'
    ? data?.trace.find(event => event.id === state.selection?.id)
    : undefined

  const close = (): void => {
    actions.setOpen(false)
    onVisibilityChange(false)
  }
  return (
    <section className={css.surface} style={{ left: state.sidebarOffset }} aria-label={t('title')}>
      <header className={css.header}>
        <div className={css.brandIcon}><IconBranchOutline16 size={20} /></div>
        <div className={css.heading}><h1>{t('title')}</h1><p>{t('subtitle')}</p></div>
        <span className={css.liveBadge}><i aria-hidden />{t('live')}</span>
        <span
          className={css.profileBadge}
          aria-label={`${t('currentProfile')}: ${data?.profile ?? t('unavailable')}`}
        >
          <span>{t('profile')}</span>
          <code>{data?.profile ?? '—'}</code>
        </span>
        <span className={css.updated}>{t('updated')}</span>
        <Tooltip label={t('refresh')} side="bottom" delayMs={400}>
          <button type="button" className={css.iconButton} aria-label={t('refresh')} onClick={onRefresh}>
            <IconRefreshOutline16 size={16} />
          </button>
        </Tooltip>
        <Tooltip label={t('close')} side="bottom" delayMs={400}>
          <button type="button" className={css.iconButton} aria-label={t('close')} onClick={close}>
            <IconCloseOutline16 size={16} />
          </button>
        </Tooltip>
      </header>
      <div className={css.toolbar}>
        <div className={css.tabs}>
          <button type="button" data-active={state.tab === 'graph' || undefined} onClick={() => { actions.setTab('graph') }}>
            <IconBranchOutline16 size={15} />{t('graphTab')}
          </button>
          <button type="button" data-active={state.tab === 'trace' || undefined} onClick={() => { actions.setTab('trace') }}>
            <IconDataOutline16 size={15} />{t('traceTab')}
          </button>
        </div>
        <label className={css.search}>
          <IconSearchOutline16 size={16} />
          <input
            value={state.query}
            placeholder={t(state.tab === 'graph'
              ? 'searchGraph'
              : selectedTurn === undefined ? 'searchTrace' : 'searchTurnTrace')}
            onChange={(event) => { actions.setQuery(event.target.value) }}
          />
        </label>
        {state.tab === 'graph' && (
          <select
            className={css.phaseFilter}
            aria-label={t('allStates')}
            value={state.phase}
            onChange={(event) => { actions.setPhase(event.target.value as RuntimePhaseFilter) }}
          >
            <option value="all">{t('allStates')}</option>
            {(Object.keys(STATUS_LABELS) as Array<Exclude<RuntimePhaseFilter, 'all'>>).map(status => (
              <option key={status} value={status}>{t(STATUS_LABELS[status])}</option>
            ))}
          </select>
        )}
      </div>
      <div className={clsx(css.body, (selectedNode !== undefined || selectedEvent !== undefined) && css.withInspector)}>
        <main className={css.canvas}>
          {remote.loading && data === undefined && <div className={css.emptyState}>{t('loadingSnapshot')}</div>}
          {remote.error !== undefined && data === undefined && (
            <div className={css.emptyState}><p>{t('loadFailed')}</p><button type="button" onClick={onRefresh}>{t('retry')}</button></div>
          )}
          {data !== undefined && state.tab === 'graph' && (
            <GraphView
              nodes={graphNodes}
              edges={graphEdges}
              summary={summarizeRuntimeGraph(data.graph.nodes)}
              totalNodes={data.graph.nodes.length}
              selectedId={selectedNode?.id}
              selectedLabel={selectedNode?.label}
              empty={t('emptyGraph')}
              graphLabel={t('graphLabel')}
              phaseLabel={phase => t(STATUS_LABELS[statusKey(phase)])}
              t={t}
              onSelect={(id) => { actions.select({ kind: 'node', id }) }}
              onClearSelection={() => { actions.select(undefined) }}
            />
          )}
          {data !== undefined && state.tab === 'trace' && (
            selectedTurn === undefined
              ? <TraceDirectory
                sessions={visibleTraceSessions}
                empty={t(query === '' ? 'emptyTurns' : 'emptyTrace')}
                t={t}
                onSelect={(key) => { actions.selectTraceTurn(key) }}
              />
              : <TraceTimeline
                turn={selectedTurn}
                events={traceEvents}
                selectedId={selectedEvent?.id}
                empty={t('emptyTurnTrace')}
                laneLabel={lane => t(LANE_LABELS[lane])}
                timeLabel={t('time')}
                t={t}
                onBack={() => { actions.selectTraceTurn(undefined) }}
                onSelect={(id) => { actions.select({ kind: 'event', id }) }}
              />
          )}
        </main>
        {(selectedNode !== undefined || selectedEvent !== undefined) && (
          <aside className={css.inspector}>
            <button type="button" className={css.inspectorClose} aria-label={t('closeInspector')} onClick={() => { actions.select(undefined) }}>
              <IconCloseOutline16 size={16} />
            </button>
            {selectedNode !== undefined && <PluginInspector node={selectedNode} t={t} />}
            {selectedEvent !== undefined && <EventInspector event={selectedEvent} t={t} />}
          </aside>
        )}
      </div>
    </section>
  )
}

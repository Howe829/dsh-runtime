import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Runtime graph, request trace, filters, and metadata inspector. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { ArrowLeftIcon, ArrowsPointingInIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, } from '@heroicons/react/24/outline';
import { IconBranchOutline16, IconCloseOutline16, IconCordisPluginOutline14, IconDataOutline16, IconRefreshOutline16, IconSearchOutline16, Tooltip, } from '@deepseek-ai/dsh-client-ui-primitives';
import { focusRuntimeGraph, layoutRuntimeGraph, RUNTIME_NODE_HEIGHT, RUNTIME_NODE_WIDTH, runtimeGraphRelations, runtimeLifecycleStatus, summarizeRuntimeGraph, } from "./graph.js";
import { filterRuntimeTrace, groupRuntimeTrace } from "./trace.js";
import css from './RuntimeExplorer.module.css';
const STATUS_LABELS = {
    pending: 'pending',
    active: 'active',
    disposed: 'disposed',
    failed: 'failed',
};
const LANE_LABELS = {
    user: 'laneUser',
    agent: 'laneAgent',
    llm: 'laneLlm',
    tool: 'laneTool',
    session: 'laneSession',
};
const TURN_STATUS_LABELS = {
    running: 'turnRunning',
    completed: 'turnCompleted',
    failed: 'turnFailed',
    stopped: 'turnStopped',
    incomplete: 'turnIncomplete',
};
const GRAPH_ZOOM_LEVELS = [0.8, 1, 1.2, 1.4];
const DEFAULT_GRAPH_ZOOM_INDEX = 1;
const GRAPH_PAN_THRESHOLD = 3;
function statusKey(phase) {
    return runtimeLifecycleStatus(phase);
}
function includesNode(node, query) {
    if (query === '')
        return true;
    const text = [node.label, node.moduleName, node.entryId, ...node.provides, ...node.injects].join('\n').toLowerCase();
    return text.includes(query);
}
function includesEvent(event, query) {
    if (query === '')
        return true;
    return [event.type, event.sessionId, event.name, event.callId, event.outcome]
        .filter(value => value !== undefined)
        .join('\n').toLowerCase().includes(query);
}
function shortSessionId(sessionId) {
    if (sessionId.length <= 18)
        return sessionId;
    return `${sessionId.slice(0, 10)}…${sessionId.slice(-4)}`;
}
function formatDuration(durationMs) {
    if (durationMs < 1000)
        return `${durationMs} ms`;
    if (durationMs < 10_000)
        return `${(durationMs / 1000).toFixed(1)} s`;
    return `${Math.round(durationMs / 1000)} s`;
}
function graphEdgesFor(nodes, edges) {
    const ids = new Set(nodes.map(node => node.id));
    return edges.filter(edge => ids.has(edge.source) && ids.has(edge.target));
}
function MetadataList({ values, empty }) {
    if (values.length === 0)
        return _jsx("span", { className: css.emptyValue, children: empty });
    return _jsx("div", { className: css.chips, children: values.map(value => _jsx("code", { children: value }, value)) });
}
function GraphView({ nodes, edges, summary, totalNodes, selectedId, selectedLabel, onSelect, onClearSelection, empty, graphLabel, phaseLabel, t, }) {
    const [zoomIndex, setZoomIndex] = useState(DEFAULT_GRAPH_ZOOM_INDEX);
    const [panning, setPanning] = useState(false);
    const [fitRequest, setFitRequest] = useState(0);
    const focus = useMemo(() => focusRuntimeGraph(nodes, edges, selectedId), [edges, nodes, selectedId]);
    const layout = useMemo(() => layoutRuntimeGraph(focus.nodes, focus.edges), [focus.edges, focus.nodes]);
    const relations = useMemo(() => runtimeGraphRelations(focus.nodes, focus.edges, selectedId), [focus.edges, focus.nodes, selectedId]);
    const scroller = useRef(null);
    const currentLayout = useRef(layout);
    currentLayout.current = layout;
    const pan = useRef();
    useLayoutEffect(() => {
        const viewport = scroller.current;
        if (viewport === null)
            return;
        const selected = selectedId === undefined ? undefined : currentLayout.current.byId.get(selectedId);
        if (selected === undefined || viewport.clientWidth === 0 || viewport.clientHeight === 0) {
            viewport.scrollLeft = 0;
            viewport.scrollTop = 0;
            return;
        }
        const scale = GRAPH_ZOOM_LEVELS[zoomIndex];
        viewport.scrollLeft = Math.max(0, (selected.x + RUNTIME_NODE_WIDTH / 2) * scale - viewport.clientWidth / 2);
        viewport.scrollTop = Math.max(0, (selected.y + RUNTIME_NODE_HEIGHT / 2) * scale - viewport.clientHeight / 2);
    }, [fitRequest, selectedId, zoomIndex]);
    const scale = GRAPH_ZOOM_LEVELS[zoomIndex];
    const startPan = (event) => {
        if (event.button !== 0 || !event.isPrimary)
            return;
        if (event.target.closest('button, a, input, select, textarea') !== null)
            return;
        const viewport = event.currentTarget;
        pan.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            scrollLeft: viewport.scrollLeft,
            scrollTop: viewport.scrollTop,
            moved: false,
        };
        viewport.setPointerCapture(event.pointerId);
        setPanning(true);
    };
    const movePan = (event) => {
        const gesture = pan.current;
        if (gesture === undefined || gesture.pointerId !== event.pointerId)
            return;
        const deltaX = event.clientX - gesture.clientX;
        const deltaY = event.clientY - gesture.clientY;
        if (!gesture.moved && Math.hypot(deltaX, deltaY) < GRAPH_PAN_THRESHOLD)
            return;
        gesture.moved = true;
        event.preventDefault();
        event.currentTarget.scrollLeft = gesture.scrollLeft - deltaX;
        event.currentTarget.scrollTop = gesture.scrollTop - deltaY;
    };
    const endPan = (event) => {
        if (pan.current?.pointerId !== event.pointerId)
            return;
        pan.current = undefined;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setPanning(false);
    };
    const resetZoom = () => {
        setZoomIndex(DEFAULT_GRAPH_ZOOM_INDEX);
        const viewport = scroller.current;
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
    };
    const fitView = () => {
        const viewport = scroller.current;
        if (viewport === null)
            return;
        const availableWidth = Math.max(1, viewport.clientWidth - 48);
        const availableHeight = Math.max(1, viewport.clientHeight - 48);
        const ideal = Math.min(availableWidth / layout.width, availableHeight / layout.height);
        let next = 0;
        for (const [index, level] of GRAPH_ZOOM_LEVELS.entries()) {
            if (level <= ideal)
                next = index;
        }
        setZoomIndex(next);
        setFitRequest(current => current + 1);
    };
    const summaryItems = [
        ['pending', summary.pending, 'pending'],
        ['active', summary.active, 'active'],
        ['disposed', summary.disposed, 'disposed'],
        ['failed', summary.failed, 'failed'],
    ];
    return (_jsxs("div", { className: css.graphView, children: [_jsx("dl", { className: css.graphSummary, "aria-label": t('pluginSummary'), children: summaryItems.map(([label, value, state]) => (_jsxs("div", { "data-state": state, children: [_jsx("dt", { children: t(label) }), _jsx("dd", { children: value })] }, label))) }), selectedId !== undefined && selectedLabel !== undefined && (_jsxs("div", { className: css.focusBar, role: "status", "aria-live": "polite", children: [_jsxs("span", { className: css.focusIdentity, children: [_jsx("span", { children: t('focusedNode') }), _jsx("strong", { children: selectedLabel })] }), _jsxs("span", { className: css.focusCount, children: [t('relatedPlugins'), " ", _jsx("strong", { children: focus.nodes.length }), " / ", totalNodes] }), _jsxs("span", { className: css.relationLegend, "aria-label": t('dependencyDirection'), children: [_jsxs("span", { "data-relation": "dependency", children: [_jsx("i", { "aria-hidden": true }), t('dependencies')] }), _jsxs("span", { "data-relation": "dependant", children: [_jsx("i", { "aria-hidden": true }), t('dependants')] })] }), _jsx("button", { type: "button", className: css.showAll, onClick: onClearSelection, children: t('showAll') })] })), nodes.length === 0 ? _jsx("div", { className: css.emptyState, children: empty }) : (_jsx("div", { ref: scroller, className: css.graphScroller, "data-panning": panning || undefined, tabIndex: 0, "aria-label": t('panCanvas'), onPointerDown: startPan, onPointerMove: movePan, onPointerUp: endPan, onPointerCancel: endPan, onLostPointerCapture: endPan, children: _jsx("div", { className: css.graphStage, style: { width: layout.width * scale, height: layout.height * scale }, children: _jsxs("svg", { className: css.graph, width: layout.width, height: layout.height, viewBox: `0 0 ${layout.width} ${layout.height}`, style: { transform: `scale(${scale})` }, role: "img", "aria-label": graphLabel, children: [_jsx("g", { className: css.edges, children: focus.edges.map((edge) => {
                                    const consumer = layout.byId.get(edge.source);
                                    const provider = layout.byId.get(edge.target);
                                    const x1 = provider.x + RUNTIME_NODE_WIDTH;
                                    const y1 = provider.y + RUNTIME_NODE_HEIGHT / 2;
                                    const x2 = consumer.x;
                                    const y2 = consumer.y + RUNTIME_NODE_HEIGHT / 2;
                                    const bend = Math.max(32, (x2 - x1) / 2);
                                    return (_jsx("path", { d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`, "data-relation": relations.edges.get(`${edge.source}:${edge.target}`), children: _jsx("title", { children: edge.services.join(', ') }) }, `${edge.source}:${edge.target}`));
                                }) }), layout.positions.map(({ node, x, y }) => (_jsx("foreignObject", { x: x, y: y, width: RUNTIME_NODE_WIDTH, height: RUNTIME_NODE_HEIGHT, children: _jsxs("button", { type: "button", className: css.graphNode, "data-phase": statusKey(node.phase), "data-selected": selectedId === node.id || undefined, "data-relation": relations.nodes.get(node.id), onClick: () => { onSelect(node.id); }, children: [_jsx("span", { className: css.nodeIcon, children: _jsx(IconCordisPluginOutline14, { size: 16 }) }), _jsxs("span", { className: css.nodeCopy, children: [_jsx("strong", { children: node.label }), _jsxs("small", { children: [_jsx("i", { "aria-hidden": true }), phaseLabel(node.phase)] })] })] }) }, node.id)))] }) }) })), nodes.length > 0 && _jsxs("div", { className: css.zoomControls, role: "group", "aria-label": t('zoomControls'), children: [_jsx(Tooltip, { label: t('zoomOut'), side: "top", delayMs: 400, children: _jsx("button", { type: "button", "aria-label": t('zoomOut'), disabled: zoomIndex === 0, onClick: () => { setZoomIndex(current => Math.max(0, current - 1)); }, children: _jsx(MagnifyingGlassMinusIcon, { "aria-hidden": "true", width: 18, height: 18 }) }) }), _jsxs("output", { "aria-label": t('zoomLevel'), "aria-live": "polite", children: [Math.round(scale * 100), "%"] }), _jsx(Tooltip, { label: t('zoomIn'), side: "top", delayMs: 400, children: _jsx("button", { type: "button", "aria-label": t('zoomIn'), disabled: zoomIndex === GRAPH_ZOOM_LEVELS.length - 1, onClick: () => { setZoomIndex(current => Math.min(GRAPH_ZOOM_LEVELS.length - 1, current + 1)); }, children: _jsx(MagnifyingGlassPlusIcon, { "aria-hidden": "true", width: 18, height: 18 }) }) }), _jsx(Tooltip, { label: t('fitView'), side: "top", delayMs: 400, children: _jsx("button", { type: "button", "aria-label": t('fitView'), onClick: fitView, children: _jsx(ArrowsPointingInIcon, { "aria-hidden": "true", width: 18, height: 18 }) }) }), _jsx("button", { type: "button", onClick: resetZoom, children: t('resetZoom') })] })] }));
}
function TraceTimeline({ turn, events, selectedId, onSelect, onBack, empty, laneLabel, timeLabel, t, }) {
    return (_jsxs("div", { className: css.traceDetail, children: [_jsxs("header", { className: css.traceDetailHeader, children: [_jsxs("button", { type: "button", className: css.traceBack, onClick: onBack, children: [_jsx(ArrowLeftIcon, { "aria-hidden": "true", width: 16, height: 16 }), t('backToTurns')] }), _jsxs("div", { className: css.traceDetailIdentity, children: [_jsx("code", { title: turn.sessionId, children: shortSessionId(turn.sessionId) }), _jsx("span", { "aria-hidden": "true", children: "/" }), _jsxs("strong", { children: [t('turn'), " #", turn.turn] }), _jsx("span", { className: css.turnStatus, "data-status": turn.status, children: t(TURN_STATUS_LABELS[turn.status]) })] }), _jsxs("dl", { className: css.turnMetrics, children: [_jsxs("div", { children: [_jsx("dt", { children: t('duration') }), _jsx("dd", { children: formatDuration(turn.durationMs) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('events') }), _jsx("dd", { children: turn.eventCount })] }), _jsxs("div", { children: [_jsx("dt", { children: t('steps') }), _jsx("dd", { children: turn.stepCount })] }), _jsxs("div", { children: [_jsx("dt", { children: t('toolCalls') }), _jsx("dd", { children: turn.toolCallCount })] })] })] }), events.length === 0
                ? _jsx("div", { className: css.emptyState, children: empty })
                : _jsx("div", { className: css.traceScroller, children: _jsxs("div", { className: css.traceGrid, children: [_jsx("div", { className: css.traceCorner, children: timeLabel }), Object.keys(LANE_LABELS).map(lane => (_jsx("div", { className: css.traceLane, children: laneLabel(lane) }, lane))), events.map(event => (_jsxs("div", { className: css.traceRow, children: [_jsx("time", { dateTime: new Date(event.time).toISOString(), children: new Date(event.time).toLocaleTimeString([], { hour12: false }) }), _jsxs("button", { type: "button", className: css.traceEvent, "data-lane": event.lane, "data-selected": selectedId === event.id || undefined, onClick: () => { onSelect(event.id); }, children: [_jsx("span", { children: event.type }), _jsx("small", { children: event.name ?? `#${event.seq}` })] })] }, event.id)))] }) })] }));
}
function TraceDirectory({ sessions, onSelect, empty, t, }) {
    const turnCount = sessions.reduce((count, session) => count + session.turns.length, 0);
    if (turnCount === 0)
        return _jsx("div", { className: css.emptyState, children: empty });
    const runningCount = sessions.reduce((count, session) => count + session.turns.filter(turn => turn.status === 'running').length, 0);
    return (_jsxs("div", { className: css.traceDirectory, children: [_jsxs("dl", { className: css.traceSummary, "aria-label": t('traceSummary'), children: [_jsxs("div", { children: [_jsx("dt", { children: t('sessions') }), _jsx("dd", { children: sessions.length })] }), _jsxs("div", { children: [_jsx("dt", { children: t('agentTurns') }), _jsx("dd", { children: turnCount })] }), _jsxs("div", { children: [_jsx("dt", { children: t('runningTurns') }), _jsx("dd", { children: runningCount })] })] }), _jsx("div", { className: css.traceSessions, children: sessions.map(session => (_jsxs("section", { className: css.traceSession, children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("span", { children: t('session') }), _jsx("code", { title: session.sessionId, children: shortSessionId(session.sessionId) })] }), _jsxs("small", { children: [session.turns.length, " ", t('turns'), " \u00B7 ", session.eventCount, " ", t('events')] })] }), _jsxs("div", { className: css.turnList, children: [session.turns.map(turn => (_jsxs("button", { type: "button", className: css.turnRow, "aria-label": `${t('turn')} ${turn.turn}, ${t(TURN_STATUS_LABELS[turn.status])}`, onClick: () => { onSelect(turn.key); }, children: [_jsxs("div", { className: css.turnIdentity, children: [_jsxs("strong", { children: [t('turn'), " #", turn.turn] }), _jsx("time", { dateTime: new Date(turn.startedAt).toISOString(), children: new Date(turn.startedAt).toLocaleTimeString([], { hour12: false }) })] }), _jsx("span", { className: css.turnStatus, "data-status": turn.status, children: t(TURN_STATUS_LABELS[turn.status]) }), _jsxs("dl", { className: css.turnMetrics, children: [_jsxs("div", { children: [_jsx("dt", { children: t('duration') }), _jsx("dd", { children: formatDuration(turn.durationMs) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('events') }), _jsx("dd", { children: turn.eventCount })] }), _jsxs("div", { children: [_jsx("dt", { children: t('steps') }), _jsx("dd", { children: turn.stepCount })] }), _jsxs("div", { children: [_jsx("dt", { children: t('toolCalls') }), _jsx("dd", { children: turn.toolCallCount })] })] }), _jsx(ChevronRightIcon, { "aria-hidden": "true", width: 17, height: 17 })] }, turn.key))), session.sessionEvents.length > 0 && (_jsxs("p", { className: css.sessionEvents, children: [t('sessionEvents'), ": ", session.sessionEvents.length] }))] })] }, session.sessionId))) })] }));
}
function PluginInspector({ node, t }) {
    const rows = [
        ['module', node.moduleName],
        ['entry', node.entryId],
        ['status', t(STATUS_LABELS[statusKey(node.phase)])],
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.inspectorTitle, children: [_jsx("span", { className: css.inspectorIcon, children: _jsx(IconCordisPluginOutline14, { size: 18 }) }), _jsxs("div", { children: [_jsx("strong", { children: node.label }), _jsx("small", { children: t('selectedPlugin') })] })] }), _jsx("dl", { className: css.metadata, children: rows.map(([label, value]) => _jsxs("div", { children: [_jsx("dt", { children: t(label) }), _jsx("dd", { children: value })] }, label)) }), _jsxs("section", { className: css.inspectorSection, children: [_jsx("h3", { children: t('provides') }), _jsx(MetadataList, { values: node.provides, empty: t('noItems') })] }), _jsxs("section", { className: css.inspectorSection, children: [_jsx("h3", { children: t('injects') }), _jsx(MetadataList, { values: node.injects, empty: t('noItems') })] }), node.missing.length > 0 && _jsxs("section", { className: css.inspectorSection, "data-warning": true, children: [_jsx("h3", { children: t('missing') }), _jsx(MetadataList, { values: node.missing, empty: t('noItems') })] }), _jsxs("section", { className: css.inspectorSection, children: [_jsxs("h3", { children: [t('effects'), " ", _jsx("span", { children: node.effectCount })] }), _jsx(MetadataList, { values: node.effects, empty: t('noItems') })] })] }));
}
function EventInspector({ event, t }) {
    const rows = [
        ['session', event.sessionId],
        ['event', event.type],
        ['sequence', event.seq],
        ['payload', event.payloadChars],
        ['turn', event.turn],
        ['step', event.step],
        ['callId', event.callId],
        ['tool', event.name],
        ['outcome', event.outcome],
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.inspectorTitle, children: [_jsx("span", { className: css.inspectorIcon, children: _jsx(IconDataOutline16, { size: 18 }) }), _jsxs("div", { children: [_jsx("strong", { children: event.type }), _jsx("small", { children: t('selectedEvent') })] })] }), _jsx("dl", { className: css.metadata, children: rows.filter(([, value]) => value !== undefined).map(([label, value]) => (_jsxs("div", { children: [_jsx("dt", { children: t(label) }), _jsx("dd", { children: String(value) })] }, label))) }), _jsx("p", { className: css.privacy, children: t('privacy') })] }));
}
/** Render the frame overlay and keep Remote polling bound to its visible lifetime. */
export function RuntimeExplorer({ useStore, useRuntime, actions, onVisibilityChange, onRefresh, t, }) {
    const state = useStore(current => current);
    const remote = useRuntime(current => current);
    useEffect(() => {
        if (!state.open)
            return;
        onVisibilityChange(true);
        return () => { onVisibilityChange(false); };
    }, [onVisibilityChange, state.open]);
    const query = state.query.trim().toLowerCase();
    const data = remote.data;
    const traceSessions = useMemo(() => groupRuntimeTrace(data?.trace ?? []), [data?.trace]);
    const visibleTraceSessions = useMemo(() => filterRuntimeTrace(traceSessions, query), [query, traceSessions]);
    if (!state.open)
        return null;
    const graphNodes = data?.graph.nodes.filter(node => (includesNode(node, query)
        && (state.phase === 'all' || statusKey(node.phase) === state.phase))) ?? [];
    const graphEdges = data === undefined ? [] : graphEdgesFor(graphNodes, data.graph.edges);
    const selectedTurn = traceSessions.flatMap(session => session.turns)
        .find(turn => turn.key === state.traceTurnKey);
    const traceEvents = selectedTurn?.events.filter(event => includesEvent(event, query)) ?? [];
    const selectedNode = state.selection?.kind === 'node'
        ? data?.graph.nodes.find(node => node.id === state.selection?.id)
        : undefined;
    const selectedEvent = state.selection?.kind === 'event'
        ? data?.trace.find(event => event.id === state.selection?.id)
        : undefined;
    const close = () => {
        actions.setOpen(false);
        onVisibilityChange(false);
    };
    return (_jsxs("section", { className: css.surface, style: { left: state.sidebarOffset }, "aria-label": t('title'), children: [_jsxs("header", { className: css.header, children: [_jsx("div", { className: css.brandIcon, children: _jsx(IconBranchOutline16, { size: 20 }) }), _jsxs("div", { className: css.heading, children: [_jsx("h1", { children: t('title') }), _jsx("p", { children: t('subtitle') })] }), _jsxs("span", { className: css.liveBadge, children: [_jsx("i", { "aria-hidden": true }), t('live')] }), _jsxs("span", { className: css.profileBadge, "aria-label": `${t('currentProfile')}: ${data?.profile ?? t('unavailable')}`, children: [_jsx("span", { children: t('profile') }), _jsx("code", { children: data?.profile ?? '—' })] }), _jsx("span", { className: css.updated, children: t('updated') }), _jsx(Tooltip, { label: t('refresh'), side: "bottom", delayMs: 400, children: _jsx("button", { type: "button", className: css.iconButton, "aria-label": t('refresh'), onClick: onRefresh, children: _jsx(IconRefreshOutline16, { size: 16 }) }) }), _jsx(Tooltip, { label: t('close'), side: "bottom", delayMs: 400, children: _jsx("button", { type: "button", className: css.iconButton, "aria-label": t('close'), onClick: close, children: _jsx(IconCloseOutline16, { size: 16 }) }) })] }), _jsxs("div", { className: css.toolbar, children: [_jsxs("div", { className: css.tabs, children: [_jsxs("button", { type: "button", "data-active": state.tab === 'graph' || undefined, onClick: () => { actions.setTab('graph'); }, children: [_jsx(IconBranchOutline16, { size: 15 }), t('graphTab')] }), _jsxs("button", { type: "button", "data-active": state.tab === 'trace' || undefined, onClick: () => { actions.setTab('trace'); }, children: [_jsx(IconDataOutline16, { size: 15 }), t('traceTab')] })] }), _jsxs("label", { className: css.search, children: [_jsx(IconSearchOutline16, { size: 16 }), _jsx("input", { value: state.query, placeholder: t(state.tab === 'graph'
                                    ? 'searchGraph'
                                    : selectedTurn === undefined ? 'searchTrace' : 'searchTurnTrace'), onChange: (event) => { actions.setQuery(event.target.value); } })] }), state.tab === 'graph' && (_jsxs("select", { className: css.phaseFilter, "aria-label": t('allStates'), value: state.phase, onChange: (event) => { actions.setPhase(event.target.value); }, children: [_jsx("option", { value: "all", children: t('allStates') }), Object.keys(STATUS_LABELS).map(status => (_jsx("option", { value: status, children: t(STATUS_LABELS[status]) }, status)))] }))] }), _jsxs("div", { className: clsx(css.body, (selectedNode !== undefined || selectedEvent !== undefined) && css.withInspector), children: [_jsxs("main", { className: css.canvas, children: [remote.loading && data === undefined && _jsx("div", { className: css.emptyState, children: t('loadingSnapshot') }), remote.error !== undefined && data === undefined && (_jsxs("div", { className: css.emptyState, children: [_jsx("p", { children: t('loadFailed') }), _jsx("button", { type: "button", onClick: onRefresh, children: t('retry') })] })), data !== undefined && state.tab === 'graph' && (_jsx(GraphView, { nodes: graphNodes, edges: graphEdges, summary: summarizeRuntimeGraph(data.graph.nodes), totalNodes: data.graph.nodes.length, selectedId: selectedNode?.id, selectedLabel: selectedNode?.label, empty: t('emptyGraph'), graphLabel: t('graphLabel'), phaseLabel: phase => t(STATUS_LABELS[statusKey(phase)]), t: t, onSelect: (id) => { actions.select({ kind: 'node', id }); }, onClearSelection: () => { actions.select(undefined); } })), data !== undefined && state.tab === 'trace' && (selectedTurn === undefined
                                ? _jsx(TraceDirectory, { sessions: visibleTraceSessions, empty: t(query === '' ? 'emptyTurns' : 'emptyTrace'), t: t, onSelect: (key) => { actions.selectTraceTurn(key); } })
                                : _jsx(TraceTimeline, { turn: selectedTurn, events: traceEvents, selectedId: selectedEvent?.id, empty: t('emptyTurnTrace'), laneLabel: lane => t(LANE_LABELS[lane]), timeLabel: t('time'), t: t, onBack: () => { actions.selectTraceTurn(undefined); }, onSelect: (id) => { actions.select({ kind: 'event', id }); } }))] }), (selectedNode !== undefined || selectedEvent !== undefined) && (_jsxs("aside", { className: css.inspector, children: [_jsx("button", { type: "button", className: css.inspectorClose, "aria-label": t('closeInspector'), onClick: () => { actions.select(undefined); }, children: _jsx(IconCloseOutline16, { size: 16 }) }), selectedNode !== undefined && _jsx(PluginInspector, { node: selectedNode, t: t }), selectedEvent !== undefined && _jsx(EventInspector, { event: selectedEvent, t: t })] }))] })] }));
}
//# sourceMappingURL=RuntimeExplorer.js.map
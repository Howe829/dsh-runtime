import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Runtime graph, request trace, filters, and metadata inspector. */
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { ArrowLeftIcon, ChevronRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { IconBranchOutline16, IconCloseOutline16, IconCordisPluginOutline14, IconDataOutline16, IconRefreshOutline16, IconSearchOutline16, Tooltip, } from '@deepseek-ai/dsh-client-ui-primitives';
import { focusRuntimeGraph, runtimeGraphRelations, runtimeLifecycleStatus, summarizeRuntimeGraph, } from "./graph.js";
import { RuntimeGraphCanvas } from "./RuntimeGraphCanvas.js";
import { RuntimeOverview } from "./RuntimeOverview.js";
import { runtimeG6NodeCategory } from "./g6-graph.js";
import { pruneGraphLayout, readGraphPresentation, writeGraphLayout } from "./graph-persistence.js";
import { filterRuntimeTrace, groupRuntimeTrace } from "./trace.js";
import css from './RuntimeExplorer.module.css';
const STATUS_LABELS = {
    pending: 'pending',
    active: 'active',
    disposed: 'disposed',
    failed: 'failed',
};
const CATEGORY_LABELS = {
    core: 'categoryCore',
    agent: 'categoryAgent',
    model: 'categoryModel',
    tool: 'categoryTool',
    session: 'categorySession',
    interface: 'categoryInterface',
    extension: 'categoryExtension',
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
function GraphView({ nodes, allNodes, edges, summary, totalNodes, selectedId, selectedLabel, onSelect, onClearSelection, categoryFilter, onCategoryFilterChange, empty, graphLabel, phaseLabel, profile, t, }) {
    const initialPresentation = useRef(readGraphPresentation(profile));
    const [savedPositions, setSavedPositions] = useState(initialPresentation.current.positions);
    const [neighbourDepth, setNeighbourDepth] = useState(initialPresentation.current.neighbourDepth);
    const [canvasRevision, setCanvasRevision] = useState(0);
    const layoutScopeKey = allNodes.map(node => node.logicalKey).sort().join('|');
    const focus = useMemo(() => focusRuntimeGraph(nodes, edges, selectedId, neighbourDepth), [edges, neighbourDepth, nodes, selectedId]);
    const relations = useMemo(() => runtimeGraphRelations(focus.nodes, focus.edges, selectedId), [focus.edges, focus.nodes, selectedId]);
    useEffect(() => {
        const presentation = readGraphPresentation(profile);
        const pruned = pruneGraphLayout(presentation.positions, allNodes);
        setSavedPositions(pruned);
        setNeighbourDepth(presentation.neighbourDepth);
        writeGraphLayout(profile, pruned, presentation.neighbourDepth);
        setCanvasRevision(current => current + 1);
    }, [profile, layoutScopeKey]);
    const persistPositions = (positions) => {
        setSavedPositions(positions);
        writeGraphLayout(profile, positions, neighbourDepth);
    };
    const changeNeighbourDepth = (next) => {
        setNeighbourDepth(next);
        writeGraphLayout(profile, savedPositions, next);
    };
    const resetGraph = () => {
        setSavedPositions({});
        setNeighbourDepth(1);
        writeGraphLayout(profile, {}, 1);
        setCanvasRevision(current => current + 1);
    };
    const summaryItems = [
        ['pending', summary.pending, 'pending'],
        ['active', summary.active, 'active'],
        ['disposed', summary.disposed, 'disposed'],
        ['failed', summary.failed, 'failed'],
    ];
    return (_jsxs("div", { className: css.graphView, children: [_jsx("dl", { className: css.graphSummary, "aria-label": t('pluginSummary'), children: summaryItems.map(([label, value, state]) => (_jsxs("div", { "data-state": state, children: [_jsx("dt", { children: t(label) }), _jsx("dd", { children: value })] }, label))) }), selectedId !== undefined && selectedLabel !== undefined && (_jsxs("div", { className: css.focusBar, role: "status", "aria-live": "polite", children: [_jsxs("span", { className: css.focusIdentity, children: [_jsx("span", { children: t('focusedNode') }), _jsx("strong", { children: selectedLabel })] }), _jsxs("span", { className: css.focusCount, children: [t('relatedPlugins'), " ", _jsx("strong", { children: focus.nodes.length }), " / ", totalNodes] }), _jsxs("label", { className: css.depthFilter, children: [_jsx("span", { children: t('relationDepth') }), _jsxs("select", { "aria-label": t('relationDepth'), value: String(neighbourDepth), onChange: (event) => {
                                    const value = event.target.value;
                                    changeNeighbourDepth(value === 'all' ? 'all' : value === '2' ? 2 : 1);
                                }, children: [_jsx("option", { value: "1", children: t('oneHop') }), _jsx("option", { value: "2", children: t('twoHops') }), _jsx("option", { value: "all", children: t('connectedGraph') })] })] }), _jsxs("span", { className: css.relationLegend, "aria-label": t('dependencyDirection'), children: [_jsxs("span", { "data-relation": "dependency", children: [_jsx("i", { "aria-hidden": true }), t('dependencies')] }), _jsxs("span", { "data-relation": "dependant", children: [_jsx("i", { "aria-hidden": true }), t('dependants')] })] }), _jsx("button", { type: "button", className: css.showAll, onClick: onClearSelection, children: t('showAll') })] })), selectedId === undefined && categoryFilter !== 'all' && (_jsxs("div", { className: css.focusBar, role: "status", "aria-live": "polite", children: [_jsxs("span", { className: css.focusIdentity, children: [_jsx("span", { children: t('filteredType') }), _jsx("strong", { children: t(CATEGORY_LABELS[categoryFilter]) })] }), _jsxs("span", { className: css.focusCount, children: [t('visiblePlugins'), " ", _jsx("strong", { children: nodes.length }), " / ", totalNodes] }), _jsx("button", { type: "button", className: css.showAll, onClick: () => { onCategoryFilterChange('all'); }, children: t('clearTypeFilter') })] })), nodes.length === 0 ? _jsx("div", { className: css.emptyState, children: empty }) : (_jsx(RuntimeGraphCanvas, { nodes: focus.nodes, edges: focus.edges, relations: relations, selectedId: selectedId, savedPositions: savedPositions, graphLabel: graphLabel, phaseLabel: phaseLabel, onSelect: onSelect, onPositionsChange: persistPositions, onResetPositions: resetGraph, categoryFilter: categoryFilter, onCategoryFilterChange: onCategoryFilterChange, t: t }, `${profile ?? 'unknown'}:${canvasRevision}:${categoryFilter}`))] }));
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
        ['fiber', node.fiberId],
        ['runtimeIdentity', node.runtimeId],
        ['status', t(STATUS_LABELS[statusKey(node.phase)])],
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.inspectorTitle, children: [_jsx("span", { className: css.inspectorIcon, children: _jsx(IconCordisPluginOutline14, { size: 18 }) }), _jsxs("div", { children: [_jsx("strong", { children: node.label }), _jsx("small", { children: t('selectedPlugin') })] })] }), _jsx("dl", { className: css.metadata, children: rows.map(([label, value]) => (_jsxs("div", { children: [_jsx("dt", { children: t(label) }), _jsx("dd", { children: value ?? _jsx("span", { className: css.emptyValue, children: t('unavailable') }) })] }, label))) }), statusKey(node.phase) === 'pending' && (_jsxs("section", { className: css.pendingDiagnosis, "data-missing": node.missing.length > 0 || undefined, children: [_jsx("h3", { children: t('pendingDiagnosis') }), _jsx("p", { children: t(node.missing.length > 0 ? 'waitingForServices' : 'waitingForRuntime') }), node.missing.length > 0 && _jsx(MetadataList, { values: node.missing, empty: t('noItems') })] })), _jsxs("section", { className: css.inspectorSection, children: [_jsx("h3", { children: t('provides') }), _jsx(MetadataList, { values: node.provides, empty: t('noItems') })] }), _jsxs("section", { className: css.inspectorSection, children: [_jsx("h3", { children: t('injects') }), _jsx(MetadataList, { values: node.injects, empty: t('noItems') })] }), node.missing.length > 0 && _jsxs("section", { className: css.inspectorSection, "data-warning": true, children: [_jsx("h3", { children: t('missing') }), _jsx(MetadataList, { values: node.missing, empty: t('noItems') })] }), _jsxs("section", { className: css.inspectorSection, children: [_jsxs("h3", { children: [t('effects'), " ", _jsx("span", { children: node.effectCount })] }), _jsx(MetadataList, { values: node.effects, empty: t('noItems') })] })] }));
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
    const observedBootId = useRef();
    useEffect(() => {
        if (!state.open || data === undefined)
            return;
        const processRestarted = observedBootId.current !== undefined && observedBootId.current !== data.bootId;
        observedBootId.current = data.bootId;
        if (processRestarted) {
            actions.select(undefined);
            actions.selectTraceTurn(undefined);
            return;
        }
        if (state.selection?.kind === 'node' && !data.graph.nodes.some(node => node.id === state.selection?.id)) {
            actions.select(undefined);
        }
        else if (state.selection?.kind === 'event' && !data.trace.some(event => event.id === state.selection?.id)) {
            actions.select(undefined);
        }
        if (state.traceTurnKey !== undefined && !traceSessions.some(session => (session.turns.some(turn => turn.key === state.traceTurnKey)))) {
            actions.selectTraceTurn(undefined);
        }
    }, [actions, data, state.open, state.selection, state.traceTurnKey, traceSessions]);
    if (!state.open)
        return null;
    const graphNodes = data?.graph.nodes.filter(node => (includesNode(node, query)
        && (state.phase === 'all' || statusKey(node.phase) === state.phase)
        && (state.category === 'all' || runtimeG6NodeCategory(node.moduleName, node.label) === state.category))) ?? [];
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
    return (_jsxs("section", { className: css.surface, style: { left: state.sidebarOffset }, "aria-label": t('title'), children: [_jsxs("header", { className: css.header, children: [_jsx("div", { className: css.brandIcon, children: _jsx(IconBranchOutline16, { size: 20 }) }), _jsx("div", { className: css.heading, children: _jsx("h1", { children: t('title') }) }), _jsxs("span", { className: css.liveBadge, children: [_jsx("i", { "aria-hidden": true }), t('live')] }), _jsxs("span", { className: css.profileBadge, "aria-label": `${t('currentProfile')}: ${data?.profile ?? t('unavailable')}`, children: [_jsx("span", { children: t('profile') }), _jsx("code", { children: data?.profile ?? '—' })] }), _jsx("span", { className: css.updated, children: t('updated') }), _jsx(Tooltip, { label: t('refresh'), side: "bottom", delayMs: 400, children: _jsx("button", { type: "button", className: css.iconButton, "aria-label": t('refresh'), onClick: onRefresh, children: _jsx(IconRefreshOutline16, { size: 16 }) }) }), _jsx(Tooltip, { label: t('close'), side: "bottom", delayMs: 400, children: _jsx("button", { type: "button", className: css.iconButton, "aria-label": t('close'), onClick: close, children: _jsx(IconCloseOutline16, { size: 16 }) }) })] }), _jsxs("div", { className: css.toolbar, children: [_jsxs("div", { className: css.tabs, children: [_jsxs("button", { type: "button", "data-active": state.tab === 'overview' || undefined, onClick: () => { actions.setTab('overview'); }, children: [_jsx(Squares2X2Icon, { width: 15 }), t('overviewTab')] }), _jsxs("button", { type: "button", "data-active": state.tab === 'graph' || undefined, onClick: () => { actions.setTab('graph'); }, children: [_jsx(IconBranchOutline16, { size: 15 }), t('graphTab')] }), _jsxs("button", { type: "button", "data-active": state.tab === 'trace' || undefined, onClick: () => { actions.setTab('trace'); }, children: [_jsx(IconDataOutline16, { size: 15 }), t('traceTab')] })] }), state.tab !== 'overview' && _jsxs("label", { className: css.search, children: [_jsx(IconSearchOutline16, { size: 16 }), _jsx("input", { value: state.query, placeholder: t(state.tab === 'graph'
                                    ? 'searchGraph'
                                    : selectedTurn === undefined ? 'searchTrace' : 'searchTurnTrace'), onChange: (event) => { actions.setQuery(event.target.value); } })] }), state.tab === 'graph' && (_jsxs("select", { className: css.phaseFilter, "aria-label": t('allStates'), value: state.phase, onChange: (event) => { actions.setPhase(event.target.value); }, children: [_jsx("option", { value: "all", children: t('allStates') }), Object.keys(STATUS_LABELS).map(status => (_jsx("option", { value: status, children: t(STATUS_LABELS[status]) }, status)))] }))] }), _jsxs("div", { className: clsx(css.body, (selectedNode !== undefined || selectedEvent !== undefined) && css.withInspector), children: [_jsxs("main", { className: css.canvas, children: [remote.loading && data === undefined && _jsx("div", { className: css.emptyState, children: t('loadingSnapshot') }), remote.error !== undefined && data === undefined && (_jsxs("div", { className: css.emptyState, children: [_jsx("p", { children: t('loadFailed') }), _jsx("button", { type: "button", onClick: onRefresh, children: t('retry') })] })), data !== undefined && state.tab === 'overview' && (_jsx(RuntimeOverview, { overview: data.overview, t: t, onInspect: (category, status) => {
                                    actions.setTab('graph');
                                    actions.setPhase(status);
                                    actions.setCategory(category ?? 'all');
                                } })), data !== undefined && state.tab === 'graph' && (_jsx(GraphView, { nodes: graphNodes, allNodes: data.graph.nodes, edges: graphEdges, summary: summarizeRuntimeGraph(data.graph.nodes), totalNodes: data.graph.nodes.length, selectedId: selectedNode?.id, selectedLabel: selectedNode?.label, profile: data.profile, empty: t('emptyGraph'), graphLabel: t('graphLabel'), phaseLabel: phase => t(STATUS_LABELS[statusKey(phase)]), categoryFilter: state.category, t: t, onSelect: (id) => { actions.select({ kind: 'node', id }); }, onClearSelection: () => { actions.select(undefined); }, onCategoryFilterChange: (category) => { actions.setCategory(category); } })), data !== undefined && state.tab === 'trace' && (selectedTurn === undefined
                                ? _jsx(TraceDirectory, { sessions: visibleTraceSessions, empty: t(query === '' ? 'emptyTurns' : 'emptyTrace'), t: t, onSelect: (key) => { actions.selectTraceTurn(key); } })
                                : _jsx(TraceTimeline, { turn: selectedTurn, events: traceEvents, selectedId: selectedEvent?.id, empty: t('emptyTurnTrace'), laneLabel: lane => t(LANE_LABELS[lane]), timeLabel: t('time'), t: t, onBack: () => { actions.selectTraceTurn(undefined); }, onSelect: (id) => { actions.select({ kind: 'event', id }); } }))] }), (selectedNode !== undefined || selectedEvent !== undefined) && (_jsxs("aside", { className: css.inspector, children: [_jsx("button", { type: "button", className: css.inspectorClose, "aria-label": t('closeInspector'), onClick: () => { actions.select(undefined); }, children: _jsx(IconCloseOutline16, { size: 16 }) }), selectedNode !== undefined && _jsx(PluginInspector, { node: selectedNode, t: t }), selectedEvent !== undefined && _jsx(EventInspector, { event: selectedEvent, t: t })] }))] })] }));
}
//# sourceMappingURL=RuntimeExplorer.js.map
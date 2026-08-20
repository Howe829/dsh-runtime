/** Read-only Cordis runtime graph and privacy-safe session event trace. */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { randomUUID } from 'node:crypto';
import z from '@deepseek-ai/schemastery';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { RUNTIME_EXPLORER_SCHEMA_VERSION } from "./types.js";
const DEFAULT_TRACE_LIMIT = 256;
const DEFAULT_EFFECT_LIMIT = 12;
const DEFAULT_REFRESH_INTERVAL_MS = 1500;
const RUNTIME_PROCESS_STATE = Symbol.for('@deepseek-ai/dsh-runtime/process-state');
const CAPABILITIES = {
    fiberInstances: false,
    ownershipEdges: false,
    scopes: false,
    lifecycleTransitions: false,
    turnPluginAttribution: false,
    eventDispatch: 'none',
    payloadCapture: false,
};
function runtimeProcessState(ctx) {
    const root = ctx.root;
    const current = root[RUNTIME_PROCESS_STATE];
    if (current !== undefined)
        return current;
    const created = {
        bootId: randomUUID(),
        snapshotSeq: 0,
        nextRuntimeId: 0,
        eventCount: 0,
        turnCount: 0,
        errorCount: 0,
        runtimeIds: new WeakMap(),
    };
    Object.defineProperty(root, RUNTIME_PROCESS_STATE, { value: created });
    return created;
}
function pluginRuntimeId(state, runtime) {
    if (runtime === null)
        return undefined;
    const current = state.runtimeIds.get(runtime);
    if (current !== undefined)
        return current;
    const created = `${state.bootId}:runtime:${++state.nextRuntimeId}`;
    state.runtimeIds.set(runtime, created);
    return created;
}
/** Runtime mirror: FiberState is a cross-package const enum. */
const FIBER_STATE = {
    PENDING: 0,
    LOADING: 1,
    ACTIVE: 2,
    FAILED: 3,
    DISPOSED: 4,
    UNLOADING: 5,
};
/** Complete public projection of Cordis Fiber states. */
const FIBER_PHASE = {
    [FIBER_STATE.PENDING]: 'pending',
    [FIBER_STATE.LOADING]: 'loading',
    [FIBER_STATE.ACTIVE]: 'active',
    [FIBER_STATE.FAILED]: 'failed',
    [FIBER_STATE.DISPOSED]: null,
    [FIBER_STATE.UNLOADING]: 'unloading',
};
const RUNTIME_CATEGORIES = [
    'core', 'agent', 'model', 'tool', 'session', 'interface', 'extension',
];
const STATUS_PRIORITY = {
    disposed: 0,
    failed: 1,
    pending: 2,
    active: 3,
};
function shortLabel(moduleName) {
    const slash = moduleName.lastIndexOf('/');
    const tail = slash < 0 ? moduleName : moduleName.slice(slash + 1);
    return tail.replace(/^dsh-(?:client-ui-|client-|host-)?/, '');
}
function entryNodeId(entryId) {
    return `entry:${entryId}`;
}
function lifecycleStatus(state) {
    if (state === FIBER_STATE.ACTIVE)
        return 'active';
    if (state === FIBER_STATE.FAILED)
        return 'failed';
    if (state === FIBER_STATE.DISPOSED)
        return 'disposed';
    return 'pending';
}
function phaseStatus(phase) {
    if (phase === 'active')
        return 'active';
    if (phase === 'failed')
        return 'failed';
    if (phase === null)
        return 'disposed';
    return 'pending';
}
/** Infer the same stable product domain used by the browser dependency graph. */
function runtimePluginCategory(moduleName, label) {
    const name = `${moduleName} ${label}`.toLowerCase();
    const short = label.toLowerCase();
    if (name.includes('cordis') || ['runtime', 'loader', 'app-boot', 'boot', 'root'].includes(short))
        return 'core';
    if (/^(session|memory|persistence|projection|spill|title)(-|$)/.test(short))
        return 'session';
    if (/^(agent|persona|goal|plan|permission|repeat-tool)(-|$)/.test(short))
        return 'agent';
    if (/^(llm|model|token)(-|$)/.test(short))
        return 'model';
    if (/^(tool|tools|sandbox|attachment|code-runtime|deliverables|modules)(-|$)/.test(short))
        return 'tool';
    if (/^(ui|client|web|cmdline|settings|terminal|api-remotes|apiproxy)(-|$)/.test(short))
        return 'interface';
    return 'extension';
}
function emptyStatusCounts() {
    return { pending: 0, active: 0, disposed: 0, failed: 0 };
}
function summarizeRuntimeCollection(items) {
    const statuses = emptyStatusCounts();
    const categories = new Map();
    for (const item of items) {
        statuses[item.status] += 1;
        const counts = categories.get(item.category) ?? emptyStatusCounts();
        counts[item.status] += 1;
        categories.set(item.category, counts);
    }
    return {
        total: items.length,
        statuses: statuses,
        byType: RUNTIME_CATEGORIES.flatMap((category) => {
            const counts = categories.get(category);
            if (counts === undefined)
                return [];
            const total = counts.pending + counts.active + counts.disposed + counts.failed;
            return [{ category, total, ...counts }];
        }),
    };
}
export function projectServiceOverview(implementations) {
    const registered = implementations.filter(implementation => implementation.fiber.state !== FIBER_STATE.DISPOSED);
    const services = new Map();
    for (const implementation of registered) {
        const status = lifecycleStatus(implementation.fiber.state);
        const moduleName = implementation.fiber.entry?.options.name ?? implementation.fiber.name;
        const item = { category: runtimePluginCategory(moduleName, shortLabel(moduleName)), status };
        const current = services.get(implementation.name);
        if (current === undefined || STATUS_PRIORITY[item.status] > STATUS_PRIORITY[current.status]) {
            services.set(implementation.name, item);
        }
    }
    return {
        ...summarizeRuntimeCollection([...services.values()]),
        implementations: registered.length,
    };
}
function owningEntryId(fiber) {
    let current = fiber;
    while (true) {
        if (current.entry !== undefined)
            return current.entry.id;
        const parent = current.parent.fiber;
        if (parent === current)
            return undefined;
        current = parent;
    }
}
function liveImplementations(ctx) {
    const store = ctx.reflect.store;
    return Object.getOwnPropertySymbols(store)
        .map(key => store[key])
        .filter((impl) => impl !== undefined);
}
function effectLabels(effects) {
    return effects.flatMap(effect => [effect.label, ...effectLabels(effect.children)]);
}
/** Project process-lifetime Cordis and Agent counters without exposing payload data. */
function projectRuntimeOverview(ctx, state, graph) {
    const fibers = [...ctx.registry.values()].flatMap(runtime => [...runtime.fibers]);
    const implementations = liveImplementations(ctx);
    const loaderBreakdown = summarizeRuntimeCollection(graph.nodes.map(node => ({
        category: runtimePluginCategory(node.moduleName, node.label),
        status: phaseStatus(node.phase),
    })));
    const fiberBreakdown = summarizeRuntimeCollection(fibers.map((fiber) => {
        const moduleName = fiber.entry?.options.name ?? fiber.runtime?.name ?? fiber.name;
        return {
            category: runtimePluginCategory(moduleName, shortLabel(moduleName)),
            status: lifecycleStatus(fiber.state),
        };
    }));
    return {
        status: 'running',
        uptimeMs: Math.max(0, Math.floor(process.uptime() * 1000)),
        contexts: fibers.length + 1,
        plugins: ctx.registry.size,
        fibers: fibers.length,
        turns: state.turnCount,
        active: fibers.filter(fiber => fiber.state === FIBER_STATE.ACTIVE).length,
        effects: graph.nodes.reduce((count, node) => count + node.effectCount, 0),
        events: state.eventCount,
        errors: state.errorCount,
        loaderBreakdown,
        fiberBreakdown,
        serviceBreakdown: projectServiceOverview(implementations),
    };
}
function isErrorEvent(event) {
    if (event.type === 'tool/result')
        return event.data.message.content[0].isError === true;
    return event.type === 'turn/end' && event.data.reason.kind === 'error';
}
/**
 * Build one dependency graph from the current Loader and service stores.
 * @param ctx - Cordis context that owns Loader, Fiber, and service state.
 * @param effectLimit - Maximum effect labels retained on each projected node.
 * @returns A point-in-time graph containing non-group Loader entries and service-derived edges.
 */
export function projectRuntimeGraph(ctx, effectLimit) {
    const processState = runtimeProcessState(ctx);
    const implementations = liveImplementations(ctx);
    const providerByService = new Map(implementations.map(impl => [impl.name, owningEntryId(impl.fiber)]));
    const providedByEntry = new Map();
    for (const impl of implementations) {
        const entryId = owningEntryId(impl.fiber);
        if (entryId === undefined)
            continue;
        const services = providedByEntry.get(entryId) ?? [];
        services.push(impl.name);
        providedByEntry.set(entryId, services);
    }
    const nodes = [];
    const edgeServices = new Map();
    for (const entry of ctx.loader.entries()) {
        if (entry.options.group)
            continue;
        const fiber = entry.fiber;
        const injects = fiber === undefined ? [] : Object.keys(fiber.inject);
        const source = entryNodeId(entry.id);
        const missing = [];
        for (const service of injects) {
            const providerEntry = providerByService.get(service);
            if (providerEntry === undefined) {
                missing.push(service);
                continue;
            }
            const target = entryNodeId(providerEntry);
            if (target === source)
                continue;
            const key = `${source}\u0000${target}`;
            const edge = edgeServices.get(key) ?? { source, target, services: [] };
            edge.services.push(service);
            edgeServices.set(key, edge);
        }
        const effects = fiber === undefined ? [] : effectLabels(fiber.getEffects());
        const runtimeId = fiber === undefined ? undefined : pluginRuntimeId(processState, fiber.runtime);
        nodes.push({
            id: source,
            logicalKey: source,
            entryId: entry.id,
            ...(fiber === undefined || fiber.uid === null ? {} : { fiberId: `${processState.bootId}:${fiber.uid}` }),
            ...(runtimeId === undefined ? {} : { runtimeId }),
            moduleName: entry.options.name,
            label: shortLabel(entry.options.name),
            enabled: !entry.disabled,
            phase: fiber === undefined ? null : FIBER_PHASE[fiber.state],
            provides: [...(providedByEntry.get(entry.id) ?? [])].sort(),
            injects,
            missing,
            effects: effects.slice(0, effectLimit),
            effectCount: effects.length,
        });
    }
    const edges = [...edgeServices.values()].map(edge => ({
        id: `injects:${edge.source}->${edge.target}`,
        type: 'injects',
        source: edge.source,
        target: edge.target,
        services: edge.services.sort(),
    }));
    return { nodes, edges };
}
function traceLane(type) {
    if (type === 'user/message')
        return 'user';
    if (type.startsWith('assistant/') || type.startsWith('request/'))
        return 'llm';
    if (type.startsWith('tool/'))
        return 'tool';
    if (type.startsWith('turn/') || type.startsWith('step/'))
        return 'agent';
    return 'session';
}
/**
 * Project one event without retaining model-visible or tool payload content.
 * @param session - Session that owns the event sequence.
 * @param event - Session event whose safe correlation metadata is projected.
 * @returns A trace row that contains no prompt, model output, tool arguments, or tool result content.
 */
export function projectTraceEvent(session, event) {
    const common = {
        id: `${session.id}:${event.seq}`,
        sessionId: String(session.id),
        type: event.type,
        seq: event.seq,
        time: event.time,
        lane: traceLane(event.type),
        payloadChars: JSON.stringify(event.data).length,
    };
    switch (event.type) {
        case 'turn/start':
            return { ...common, turn: event.data.turn };
        case 'turn/end':
            return { ...common, turn: event.data.turn, outcome: event.data.reason.kind };
        case 'step/start':
        case 'step/end':
        case 'assistant/chunk':
        case 'assistant/message':
            return { ...common, turn: event.data.turn, step: event.data.step };
        case 'tool/call':
            return {
                ...common,
                turn: event.data.turn,
                step: event.data.step,
                callId: String(event.data.callId),
                name: event.data.name,
            };
        case 'tool/result':
            return {
                ...common,
                turn: event.data.turn,
                step: event.data.step,
                callId: String(event.data.message.source.callId),
                outcome: event.data.message.content[0].isError ? 'error' : 'success',
            };
        default:
            return common;
    }
}
/** Remote gateway backing the dsh-runtime browser plugin. */
let RuntimeExplorerGateway = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _snapshot_decorators;
    return class RuntimeExplorerGateway extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _snapshot_decorators = [Remote('snapshot')];
            __esDecorate(this, null, _snapshot_decorators, { kind: "method", name: "snapshot", static: false, private: false, access: { has: obj => "snapshot" in obj, get: obj => obj.snapshot }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['loader'];
        static Config = z.object({
            traceLimit: z.natural().min(1).default(DEFAULT_TRACE_LIMIT),
            effectLimit: z.natural().default(DEFAULT_EFFECT_LIMIT),
            refreshIntervalMs: z.natural().min(250).default(DEFAULT_REFRESH_INTERVAL_MS),
        });
        resolved = __runInitializers(this, _instanceExtraInitializers);
        trace = [];
        constructor(ctx, config) {
            super(ctx, 'runtimeExplorer');
            this.resolved = config;
            ctx.on('session/event', (session, event) => {
                const processState = runtimeProcessState(ctx);
                processState.eventCount += 1;
                if (event.type === 'turn/start')
                    processState.turnCount += 1;
                if (isErrorEvent(event))
                    processState.errorCount += 1;
                this.trace.push(projectTraceEvent(session, event));
                const overflow = this.trace.length - this.resolved.traceLimit;
                if (overflow > 0)
                    this.trace.splice(0, overflow);
            });
        }
        /**
         * Read live Loader state and the bounded event-metadata window.
         * @returns A point-in-time graph and trace containing no message, model-output, tool-argument, or tool-result content.
         */
        snapshot() {
            const processState = runtimeProcessState(this.ctx);
            const graph = projectRuntimeGraph(this.ctx, this.resolved.effectLimit);
            return {
                schemaVersion: RUNTIME_EXPLORER_SCHEMA_VERSION,
                bootId: processState.bootId,
                snapshotSeq: ++processState.snapshotSeq,
                profile: this.ctx.get('launchProfile')?.get() ?? null,
                observedAt: Date.now(),
                refreshIntervalMs: this.resolved.refreshIntervalMs,
                overview: projectRuntimeOverview(this.ctx, processState, graph),
                graph,
                trace: [...this.trace],
                capabilities: CAPABILITIES,
                limits: {
                    transitionLimit: 0,
                    traceEventLimit: this.resolved.traceLimit,
                },
            };
        }
    };
})();
export { RuntimeExplorerGateway };
export default RuntimeExplorerGateway;
//# sourceMappingURL=index.js.map
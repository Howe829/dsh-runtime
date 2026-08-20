/** Client-safe snapshot vocabulary for dsh-runtime. @module @deepseek-ai/dsh-runtime/types */
/** Current normalized snapshot contract emitted by dsh-runtime. */
export declare const RUNTIME_EXPLORER_SCHEMA_VERSION = 3;
/** Four product-facing lifecycle states shared by overview summaries and filters. */
export type RuntimeOverviewStatus = 'pending' | 'active' | 'disposed' | 'failed';
/** Stable plugin domains used across the overview cards and dependency graph. */
export type RuntimePluginCategory = 'core' | 'agent' | 'model' | 'tool' | 'session' | 'interface' | 'extension';
/** Counts for one complete four-state lifecycle partition. */
export interface RuntimeStatusCounts {
    readonly pending: number;
    readonly active: number;
    readonly disposed: number;
    readonly failed: number;
}
/** One plugin-domain row in a Type by Status stacked chart. */
export interface RuntimeTypeStatusBreakdown extends RuntimeStatusCounts {
    readonly category: RuntimePluginCategory;
    readonly total: number;
}
/** One overview collection whose status and category totals both equal `total`. */
export interface RuntimeCollectionOverview {
    readonly total: number;
    readonly statuses: RuntimeStatusCounts;
    readonly byType: readonly RuntimeTypeStatusBreakdown[];
}
/** Registered service names, concrete scoped implementations, and provider-Fiber health. */
export interface RuntimeServiceOverview extends RuntimeCollectionOverview {
    readonly implementations: number;
}
/** Lifecycle phase of one configured Loader entry's root Fiber. */
export type RuntimeFiberPhase = 'pending' | 'loading' | 'active' | 'failed' | 'unloading' | null;
/** One configured plugin in the current Loader tree. */
export interface RuntimeGraphNode {
    /** Stable snapshot identity derived from the Loader entry id. */
    readonly id: string;
    /** Stable logical placement key used only for presentation layout reuse. */
    readonly logicalKey: string;
    /** Loader-tree entry id, including parent include/group prefixes. */
    readonly entryId: string;
    /** Identity of the current root Fiber inside one Harness boot, when live. */
    readonly fiberId?: string;
    /** Identity shared by Fibers created from the same Cordis plugin runtime. */
    readonly runtimeId?: string;
    /** Exact module specifier imported for this entry. */
    readonly moduleName: string;
    /** Short display label derived from the module specifier. */
    readonly label: string;
    /** Effective Loader enablement, including disabled ancestor groups. */
    readonly enabled: boolean;
    /** Current root Fiber phase, or null when the entry has no live root Fiber. */
    readonly phase: RuntimeFiberPhase;
    /** Services provided by this entry's Fiber subtree. */
    readonly provides: readonly string[];
    /** Services declared by this entry's root Fiber. */
    readonly injects: readonly string[];
    /** Declared services with no live provider in the current context. */
    readonly missing: readonly string[];
    /** First configured number of live effect labels, depth-first. */
    readonly effects: readonly string[];
    /** Total number of live effect labels before the configured projection cap. */
    readonly effectCount: number;
}
/** Service dependency from one Loader entry to another. */
export interface RuntimeGraphEdge {
    /** Stable identity for this aggregated relationship. */
    readonly id: string;
    /** Cordis relation represented by the directed edge. */
    readonly type: 'injects';
    /** Consumer node id. */
    readonly source: string;
    /** Provider node id. */
    readonly target: string;
    /** Injected services resolving through this provider. */
    readonly services: readonly string[];
}
/** Read-only dependency graph projected from Loader, Fiber, and service state. */
export interface RuntimeGraphSnapshot {
    readonly nodes: readonly RuntimeGraphNode[];
    readonly edges: readonly RuntimeGraphEdge[];
}
/** Process-lifetime Cordis and Agent counters for the Runtime Overview tab. */
export interface RuntimeOverviewSnapshot {
    readonly status: 'running';
    readonly uptimeMs: number;
    /** Root Context plus one tracked Context for each live plugin Fiber. */
    readonly contexts: number;
    /** Distinct plugin runtimes currently registered with Cordis. */
    readonly plugins: number;
    readonly fibers: number;
    readonly turns: number;
    readonly active: number;
    readonly effects: number;
    readonly events: number;
    readonly errors: number;
    /** Configured Loader entries, including entries without a mounted Fiber. */
    readonly loaderBreakdown: RuntimeCollectionOverview;
    /** Currently registered live Fiber instances. */
    readonly fiberBreakdown: RuntimeCollectionOverview;
    /** Distinct registered service names, classified by their best provider Fiber. */
    readonly serviceBreakdown: RuntimeServiceOverview;
}
/** Instrumentation that the current Host can prove and safely expose. */
export interface RuntimeExplorerCapabilities {
    readonly fiberInstances: boolean;
    readonly ownershipEdges: boolean;
    readonly scopes: boolean;
    readonly lifecycleTransitions: boolean;
    readonly turnPluginAttribution: boolean;
    readonly eventDispatch: 'none' | 'summary' | 'listener';
    readonly payloadCapture: false;
}
/** Explicit upper bounds applied to in-process diagnostic history. */
export interface RuntimeExplorerLimits {
    readonly transitionLimit: number;
    readonly traceEventLimit: number;
}
/** Stable presentation lane for one captured session event. */
export type RuntimeTraceLane = 'user' | 'agent' | 'llm' | 'tool' | 'session';
/** Privacy-safe metadata for one committed session event. */
export interface RuntimeTraceEvent {
    /** Session id plus event sequence, unique within this process window. */
    readonly id: string;
    readonly sessionId: string;
    readonly type: string;
    readonly seq: number;
    readonly time: number;
    readonly lane: RuntimeTraceLane;
    /** Serialized payload size; the payload itself is never exposed. */
    readonly payloadChars: number;
    readonly turn?: number;
    readonly step?: number;
    readonly callId?: string;
    /** Tool name for tool/call; no arguments or result content is retained. */
    readonly name?: string;
    /** Terminal turn reason kind; no failure message is retained. */
    readonly outcome?: string;
}
/** Point-in-time graph plus the bounded in-process event trace. */
export interface RuntimeExplorerSnapshot {
    /** Version of this client-safe snapshot schema. */
    readonly schemaVersion: typeof RUNTIME_EXPLORER_SCHEMA_VERSION;
    /** Opaque identity shared by snapshots from one Harness process lifetime. */
    readonly bootId: string;
    /** Monotonic sequence allocated on the root Context for every snapshot read. */
    readonly snapshotSeq: number;
    /** Exact profile selected by the DSH launcher, or null in a non-DSH embedding host. */
    readonly profile: string | null;
    readonly observedAt: number;
    readonly refreshIntervalMs: number;
    readonly overview: RuntimeOverviewSnapshot;
    readonly graph: RuntimeGraphSnapshot;
    readonly trace: readonly RuntimeTraceEvent[];
    readonly capabilities: RuntimeExplorerCapabilities;
    readonly limits: RuntimeExplorerLimits;
}
//# sourceMappingURL=types.d.ts.map
/** Read-only Cordis runtime graph and privacy-safe session event trace. */
import type { Context, Fiber } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { RuntimeExplorerSnapshot, RuntimeGraphSnapshot, RuntimeServiceOverview, RuntimeTraceEvent } from './types.ts';
export type * from './types.ts';
/** Deployment controls for browser refresh and bounded diagnostic projections. */
export interface Config {
    /** Maximum recent event metadata rows retained in process memory. @default 256 */
    traceLimit?: number;
    /** Maximum effect labels returned per Loader entry. @default 12 */
    effectLimit?: number;
    /** Browser snapshot refresh cadence while the explorer is open. @default 1500 */
    refreshIntervalMs?: number;
    /** Rolling Effect activity window in milliseconds. @default 300000 */
    activityWindowMs?: number;
    /** Effect trend bucket width in milliseconds. @default 10000 */
    activityBucketMs?: number;
    /** Maximum Effect lifecycle transitions retained in memory. @default 4096 */
    activityTransitionLimit?: number;
}
export declare function projectServiceOverview(implementations: readonly {
    name: string;
    fiber: Fiber;
}[]): RuntimeServiceOverview;
/**
 * Build one dependency graph from the current Loader and service stores.
 * @param ctx - Cordis context that owns Loader, Fiber, and service state.
 * @param effectLimit - Maximum effect labels retained on each projected node.
 * @returns A point-in-time graph containing non-group Loader entries and service-derived edges.
 */
export declare function projectRuntimeGraph(ctx: Context, effectLimit: number): RuntimeGraphSnapshot;
/**
 * Project one event without retaining model-visible or tool payload content.
 * @param session - Session that owns the event sequence.
 * @param event - Session event whose safe correlation metadata is projected.
 * @returns A trace row that contains no prompt, model output, tool arguments, or tool result content.
 */
export declare function projectTraceEvent(session: Session, event: SessionEvent): RuntimeTraceEvent;
/** Remote gateway backing the DSH Insider browser plugin. */
export declare class RuntimeExplorerGateway extends TypertRemoteService {
    static inject: string[];
    static Config: z<Config>;
    private readonly resolved;
    private readonly trace;
    private readonly activityStartedAt;
    private readonly effectOwners;
    private readonly effectTransitions;
    private nextEffectId;
    private nextTransitionId;
    private droppedTransitions;
    private lastDroppedAt;
    constructor(ctx: Context, config: Config);
    private captureEffectTransition;
    /**
     * Read live Loader state and the bounded event-metadata window.
     * @returns A point-in-time graph and trace containing no message, model-output, tool-argument, or tool-result content.
     */
    snapshot(): RuntimeExplorerSnapshot;
}
export default RuntimeExplorerGateway;
//# sourceMappingURL=index.d.ts.map
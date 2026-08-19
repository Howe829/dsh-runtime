/** Session and Agent Turn projections over the bounded runtime event window. */
import type { RuntimeTraceEvent } from '@deepseek-ai/dsh-api-remotes/client';
/** Product-facing state derived from one Turn's retained metadata events. */
export type RuntimeTraceTurnStatus = 'running' | 'completed' | 'failed' | 'stopped' | 'incomplete';
/** One Agent Turn assembled from events sharing a Session id and Turn number. */
export interface RuntimeTraceTurn {
    readonly key: string;
    readonly sessionId: string;
    readonly turn: number;
    readonly events: readonly RuntimeTraceEvent[];
    readonly startedAt: number;
    readonly updatedAt: number;
    readonly durationMs: number;
    readonly eventCount: number;
    readonly stepCount: number;
    readonly toolCallCount: number;
    readonly status: RuntimeTraceTurnStatus;
    readonly outcome?: string;
}
/** Recent Agent Turns and unassigned events retained for one Session. */
export interface RuntimeTraceSession {
    readonly sessionId: string;
    readonly turns: readonly RuntimeTraceTurn[];
    readonly sessionEvents: readonly RuntimeTraceEvent[];
    readonly eventCount: number;
    readonly updatedAt: number;
}
/**
 * Build the stable selection key for one Session-owned Agent Turn.
 * @param sessionId - Opaque Session id from the trace event.
 * @param turn - Session-local Turn number.
 * @returns A key that remains unique across concurrent Sessions.
 */
export declare function runtimeTraceTurnKey(sessionId: string, turn: number): string;
/**
 * Group the bounded event window into recent Sessions and their Agent Turns.
 * @param events - Privacy-safe events from the latest runtime snapshot.
 * @returns Sessions and Turns sorted by most recent activity.
 */
export declare function groupRuntimeTrace(events: readonly RuntimeTraceEvent[]): RuntimeTraceSession[];
/**
 * Filter the Turn directory without flattening its Session grouping.
 * @param sessions - Grouped runtime trace Sessions.
 * @param query - Normalized user query.
 * @returns Matching Session groups in their existing activity order.
 */
export declare function filterRuntimeTrace(sessions: readonly RuntimeTraceSession[], query: string): RuntimeTraceSession[];
//# sourceMappingURL=trace.d.ts.map
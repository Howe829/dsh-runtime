/** Browser-only persistence for user-arranged runtime graph positions. */
import type { RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client';
import type { RuntimeGraphNeighbourDepth, RuntimeGraphSavedPositions } from './graph.ts';
/** Presentation preferences restored alongside pinned positions. */
export interface RuntimeGraphPresentation {
    readonly positions: RuntimeGraphSavedPositions;
    readonly neighbourDepth: RuntimeGraphNeighbourDepth;
}
/** Stable localStorage key scoped to the active Harness profile. */
export declare function graphLayoutStorageKey(profile: string | null | undefined): string;
/** Read valid finite positions without allowing corrupt browser data to break the graph. */
export declare function readGraphPresentation(profile: string | null | undefined): RuntimeGraphPresentation;
/** Compatibility helper for callers that only need saved node positions. */
export declare function readGraphLayout(profile: string | null | undefined): RuntimeGraphSavedPositions;
/** Persist presentation state only; runtime state never enters browser storage. */
export declare function writeGraphLayout(profile: string | null | undefined, positions: RuntimeGraphSavedPositions, neighbourDepth?: RuntimeGraphNeighbourDepth): void;
/** Drop placements that no longer correspond to the current logical graph. */
export declare function pruneGraphLayout(positions: RuntimeGraphSavedPositions, nodes: readonly RuntimeGraphNode[]): RuntimeGraphSavedPositions;
//# sourceMappingURL=graph-persistence.d.ts.map
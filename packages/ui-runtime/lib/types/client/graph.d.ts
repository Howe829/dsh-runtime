/** Deterministic provider-left graph layout for the runtime SVG. */
import type { RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client';
/** Pixel position of one projected runtime node. */
export interface RuntimeNodePosition {
    readonly node: RuntimeGraphNode;
    readonly x: number;
    readonly y: number;
}
/** Deterministic SVG dimensions and indexed node positions. */
export interface RuntimeGraphLayout {
    readonly width: number;
    readonly height: number;
    readonly positions: readonly RuntimeNodePosition[];
    readonly byId: ReadonlyMap<string, RuntimeNodePosition>;
}
/** Browser-owned placement for one logical plugin node. */
export interface RuntimeGraphSavedPosition {
    readonly x: number;
    readonly y: number;
    readonly pinned: boolean;
}
/** Persisted placements keyed by the Host-provided logical identity. */
export type RuntimeGraphSavedPositions = Readonly<Record<string, RuntimeGraphSavedPosition>>;
/** Aggregate plugin lifecycle counts shown above the runtime graph. */
export interface RuntimeGraphSummary {
    readonly pending: number;
    readonly active: number;
    readonly disposed: number;
    readonly failed: number;
}
/** Nodes and edges visible while the graph is focused on one dependency chain. */
export interface RuntimeGraphFocus {
    readonly nodes: readonly RuntimeGraphNode[];
    readonly edges: readonly RuntimeGraphEdge[];
}
/** Maximum undirected relation distance retained around a selected plugin. */
export type RuntimeGraphNeighbourDepth = 1 | 2 | 'all';
/** How one visible node or edge relates to the current focus node. */
export type RuntimeGraphRelation = 'selected' | 'dependency' | 'dependant' | 'both' | 'related';
/** Directional relationship index for a focused runtime graph. */
export interface RuntimeGraphRelations {
    readonly nodes: ReadonlyMap<string, RuntimeGraphRelation>;
    readonly edges: ReadonlyMap<string, RuntimeGraphRelation>;
}
/** Product-facing lifecycle states collapsed from the Loader Fiber phases. */
export type RuntimeLifecycleStatus = 'pending' | 'active' | 'disposed' | 'failed';
/**
 * Keep the requested upstream and downstream neighbourhood around one selected node.
 * @param nodes - Graph nodes after search and lifecycle filtering.
 * @param edges - Dependency edges joining the filtered nodes.
 * @param selectedId - Selected node id, or undefined for the complete graph.
 * @param depth - Maximum relationship distance; one hop matches the default graph interaction.
 * @returns The selected node's bounded weakly connected neighbourhood in stable input order.
 */
export declare function focusRuntimeGraph(nodes: readonly RuntimeGraphNode[], edges: readonly RuntimeGraphEdge[], selectedId: string | undefined, depth?: RuntimeGraphNeighbourDepth): RuntimeGraphFocus;
/**
 * Classify the selected plugin's transitive dependencies and dependants.
 * Runtime edges point from a consumer (`source`) to its provider (`target`).
 * @param nodes - Visible nodes in the focused component.
 * @param edges - Visible dependency edges.
 * @param selectedId - Current focus node, or undefined outside focus mode.
 * @returns Stable node and edge relation maps used by graph styling and the legend.
 */
export declare function runtimeGraphRelations(nodes: readonly RuntimeGraphNode[], edges: readonly RuntimeGraphEdge[], selectedId: string | undefined): RuntimeGraphRelations;
/** Stable topology identity that deliberately excludes lifecycle state. */
export declare function runtimeGraphTopologyKey(nodes: readonly RuntimeGraphNode[], edges: readonly RuntimeGraphEdge[]): string;
/**
 * Settle a deterministic, bounded force-directed graph.
 * Saved positions seed the simulation; pinned positions remain fixed.
 * @param nodes - Visible runtime nodes after Client filtering.
 * @param edges - Visible dependency edges joining those nodes.
 * @param saved - Browser-owned placements keyed by logical identity.
 * @returns Stable SVG dimensions and positions for every input node.
 */
export declare function layoutRuntimeGraph(nodes: readonly RuntimeGraphNode[], edges: readonly RuntimeGraphEdge[], saved?: RuntimeGraphSavedPositions): RuntimeGraphLayout;
/**
 * Collapse detailed Loader Fiber phases into the four product-facing states.
 * @param phase - Detailed phase projected by the Host, or null without a live Fiber.
 * @returns Stable lifecycle status used by graph cards, nodes, and filters.
 */
export declare function runtimeLifecycleStatus(phase: RuntimeGraphNode['phase']): RuntimeLifecycleStatus;
/**
 * Count the complete Loader projection by product-facing lifecycle state.
 * @param nodes - Unfiltered runtime nodes from the latest Host snapshot.
 * @returns Stable totals for the graph overview cards.
 */
export declare function summarizeRuntimeGraph(nodes: readonly RuntimeGraphNode[]): RuntimeGraphSummary;
/** Width reserved for every circular runtime graph node. */
export declare const RUNTIME_NODE_WIDTH = 116;
/** Height reserved for every circular runtime graph node. */
export declare const RUNTIME_NODE_HEIGHT = 116;
/** Radius of the circular runtime graph node. */
export declare const RUNTIME_NODE_RADIUS: number;
//# sourceMappingURL=graph.d.ts.map
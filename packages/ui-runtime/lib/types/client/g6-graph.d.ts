/** Pure G6 projection and update policy for the Runtime Explorer graph canvas. */
import type { EdgeData, GraphData, NodeData } from '@antv/g6';
import type { RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client';
import type { RuntimeGraphRelations, RuntimeGraphSavedPositions } from './graph.ts';
import { runtimeLifecycleStatus } from './graph.ts';
export type RuntimeG6NodeKind = 'plugin' | 'missing-service';
/** Visual role inferred from the plugin package name and its runtime label. */
export type RuntimeG6NodeCategory = 'core' | 'agent' | 'model' | 'tool' | 'session' | 'interface' | 'extension' | 'missing';
export interface RuntimeG6NodeMetadata {
    readonly kind: RuntimeG6NodeKind;
    readonly label: string;
    readonly logicalKey?: string;
    readonly moduleName?: string;
    readonly phase: ReturnType<typeof runtimeLifecycleStatus> | 'missing';
    readonly category: RuntimeG6NodeCategory;
    readonly relation?: string;
    readonly size: number;
    readonly pinned: boolean;
    readonly provides: readonly string[];
    readonly injects: readonly string[];
    readonly missing: readonly string[];
    readonly effectCount: number;
    readonly service?: string;
    readonly order?: number;
}
export interface RuntimeG6EdgeMetadata {
    readonly kind: 'injects' | 'missing';
    readonly relation?: string;
    readonly services: readonly string[];
}
export interface RuntimeG6GraphData extends GraphData {
    readonly nodes: NodeData[];
    readonly edges: EdgeData[];
}
export declare const RUNTIME_G6_COLLISION_GAP = 24;
/**
 * Infer a stable, explainable visual category from DSH package conventions.
 * The fallback deliberately stays neutral for third-party plugins.
 */
export declare function runtimeG6NodeCategory(moduleName: string, label: string): RuntimeG6NodeCategory;
/** Keep the exact plugin name while preferring semantic line breaks inside circles. */
export declare function runtimeG6DisplayLabel(label: string): string;
/** Scale hubs without allowing high-degree plugins to dominate the canvas. */
export declare function runtimeG6NodeSize(degree: number, selected?: boolean, label?: string): number;
/** Collision radius passed to G6, including label-safe whitespace around each circle. */
export declare function runtimeG6CollisionRadius(size: number): number;
/** Safely read the metadata placed on a G6 node datum by this adapter. */
export declare function runtimeG6NodeMetadata(node: NodeData): RuntimeG6NodeMetadata;
/** Safely read the metadata placed on a G6 edge datum by this adapter. */
export declare function runtimeG6EdgeMetadata(edge: EdgeData): RuntimeG6EdgeMetadata;
/**
 * Project the Host graph into G6 data while keeping product state out of the renderer.
 * Missing Cordis providers become explicit satellite nodes only around the selected plugin.
 */
export declare function buildRuntimeG6Data(nodes: readonly RuntimeGraphNode[], edges: readonly RuntimeGraphEdge[], relations: RuntimeGraphRelations, selectedId: string | undefined, savedPositions: RuntimeGraphSavedPositions): RuntimeG6GraphData;
/** Topology identity used to distinguish live status refreshes from structural changes. */
export declare function runtimeG6TopologyKey(data: RuntimeG6GraphData): string;
export interface RuntimeG6GraphPort {
    setData: (data: GraphData) => void;
    render: () => unknown | Promise<unknown>;
    draw: () => unknown | Promise<unknown>;
    getElementPosition?: (id: string) => ArrayLike<number>;
}
/**
 * Structural changes run layout; lifecycle-only refreshes draw in place so the viewport never jumps.
 */
export declare function syncRuntimeG6Data(graph: RuntimeG6GraphPort, data: RuntimeG6GraphData, previousTopology: string | undefined): Promise<'render' | 'draw'>;
//# sourceMappingURL=g6-graph.d.ts.map
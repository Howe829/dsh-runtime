/** G6-backed force graph canvas for plugin-to-plugin Cordis relationships. */
import type { RuntimeFiberPhase, RuntimeGraphEdge, RuntimeGraphNode } from '@deepseek-ai/dsh-api-remotes/client';
import type { RuntimeGraphRelations, RuntimeGraphSavedPositions } from './graph.ts';
import type { RuntimeLocaleKey } from './locales.ts';
import type { RuntimeCategoryFilter } from './store.ts';
export interface RuntimeGraphCanvasProps {
    readonly nodes: readonly RuntimeGraphNode[];
    readonly edges: readonly RuntimeGraphEdge[];
    readonly relations: RuntimeGraphRelations;
    readonly selectedId: string | undefined;
    readonly savedPositions: RuntimeGraphSavedPositions;
    readonly graphLabel: string;
    readonly phaseLabel: (phase: RuntimeFiberPhase) => string;
    readonly onSelect: (id: string) => void;
    readonly onPositionsChange: (positions: RuntimeGraphSavedPositions) => void;
    readonly onResetPositions: () => void;
    readonly categoryFilter: RuntimeCategoryFilter;
    readonly onCategoryFilterChange: (category: RuntimeCategoryFilter) => void;
    readonly t: (key: RuntimeLocaleKey) => string;
}
export declare function RuntimeGraphCanvas({ nodes, edges, relations, selectedId, savedPositions, graphLabel, phaseLabel, onSelect, onPositionsChange, onResetPositions, categoryFilter, onCategoryFilterChange, t, }: RuntimeGraphCanvasProps): import("react").JSX.Element;
//# sourceMappingURL=RuntimeGraphCanvas.d.ts.map
/** Shared viewing state for the sidebar action and frame overlay. */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
import type { RuntimeLifecycleStatus } from './graph.ts';
/** Explorer tab selected by the user. */
export type RuntimeTab = 'graph' | 'trace';
/** Client-side filter over the four product-facing lifecycle states. */
export type RuntimePhaseFilter = RuntimeLifecycleStatus | 'all';
/** Current graph-node or trace-event inspector selection. */
export type RuntimeSelection = {
    kind: 'node' | 'event';
    id: string;
};
/** Root-scoped view state shared by the sidebar action and overlay. */
export interface RuntimeStoreState {
    open: boolean;
    tab: RuntimeTab;
    query: string;
    phase: RuntimePhaseFilter;
    selection: RuntimeSelection | undefined;
    traceTurnKey: string | undefined;
    sidebarOffset: number;
}
type RuntimeStoreActions = {
    setOpen: (draft: RuntimeStoreState, open: boolean) => void;
    setTab: (draft: RuntimeStoreState, tab: RuntimeTab) => void;
    setQuery: (draft: RuntimeStoreState, query: string) => void;
    setPhase: (draft: RuntimeStoreState, phase: RuntimePhaseFilter) => void;
    select: (draft: RuntimeStoreState, selection?: RuntimeSelection) => void;
    selectTraceTurn: (draft: RuntimeStoreState, key?: string) => void;
    setSidebarOffset: (draft: RuntimeStoreState, px: number) => void;
};
/**
 * Create the root-scoped store shared by both dsh-runtime slot entries.
 * @returns A store handle whose action and overlay adapters share one state instance.
 */
export declare function createRuntimeStore(): EngineStoreHandle<RuntimeStoreState, RuntimeStoreActions>;
export {};
//# sourceMappingURL=store.d.ts.map
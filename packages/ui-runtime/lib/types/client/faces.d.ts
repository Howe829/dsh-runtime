/** Injected Remote faces for the two dsh-runtime slot entries. */
import type { RuntimeSource } from './source.ts';
/** Behavior injected into the sidebar action slot. */
export interface RuntimeActionFace {
    onVisibilityChange: (open: boolean) => void;
}
/** Runtime source and commands injected into the overlay slot. */
export interface RuntimeExplorerFace extends RuntimeActionFace {
    hooks: {
        runtime: RuntimeSource;
    };
    onRefresh: () => void;
}
//# sourceMappingURL=faces.d.ts.map
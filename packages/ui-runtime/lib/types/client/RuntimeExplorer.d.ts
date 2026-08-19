/** Runtime graph, request trace, filters, and metadata inspector. */
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { RuntimeExplorerFace } from './faces.ts';
import type { createRuntimeStore } from './store.ts';
export type RuntimeExplorerProps = PropsRuntime<'shell.overlay'> & PropsStore<ReturnType<typeof createRuntimeStore>> & InjectFace<RuntimeExplorerFace> & PropsLocale<'runtime'>;
/** Render the frame overlay and keep Remote polling bound to its visible lifetime. */
export declare function RuntimeExplorer({ useStore, useRuntime, actions, onVisibilityChange, onRefresh, t, }: RuntimeExplorerProps): import("react").JSX.Element | null;
//# sourceMappingURL=RuntimeExplorer.d.ts.map
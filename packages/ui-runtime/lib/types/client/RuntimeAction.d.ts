/** Sidebar footer action that opens dsh-runtime without adding a floating button. */
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createRuntimeStore } from './store.ts';
import type { RuntimeActionFace } from './faces.ts';
export type RuntimeActionProps = PropsRuntime<'sidebar.footer.action'> & PropsStore<ReturnType<typeof createRuntimeStore>> & InjectFace<RuntimeActionFace> & PropsLocale<'runtime'>;
/** Render the sidebar row/rail entry and publish the measured sidebar edge. */
export declare function RuntimeAction({ wide, useStore, actions, onVisibilityChange, t }: RuntimeActionProps): import("react").JSX.Element;
//# sourceMappingURL=RuntimeAction.d.ts.map
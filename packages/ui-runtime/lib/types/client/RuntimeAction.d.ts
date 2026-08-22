/** Sidebar footer action that opens DSH Insider without adding a floating button. */
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createRuntimeStore } from './store.ts';
import type { RuntimeActionFace } from './faces.ts';
export interface FooterActionStack {
    /** Stable sidebar boundary used to size the fixed overlay. */
    readonly boundary: HTMLElement;
    restore(): void;
}
/** Promote the renderer's display-contents anchor to the footer action stack. */
export declare function stackFooterActions(action: HTMLElement): FooterActionStack;
export type RuntimeActionProps = PropsRuntime<'sidebar.footer.action'> & PropsStore<ReturnType<typeof createRuntimeStore>> & InjectFace<RuntimeActionFace> & PropsLocale<'runtime'>;
/** Render the sidebar row/rail entry and publish the measured sidebar edge. */
export declare function RuntimeAction({ wide, useStore, actions, onVisibilityChange, t }: RuntimeActionProps): import("react").JSX.Element;
//# sourceMappingURL=RuntimeAction.d.ts.map
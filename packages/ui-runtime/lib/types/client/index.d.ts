/** dsh-runtime sidebar entry and frame overlay assembly. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type RuntimeLocaleKey } from './locales.ts';
export type { RuntimeLocaleKey } from './locales.ts';
export type { RuntimeLifecycleStatus } from './graph.ts';
export type { RuntimePhaseFilter, RuntimeSelection, RuntimeStoreState, RuntimeTab } from './store.ts';
export { createRuntimeStore } from './store.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** dsh-runtime graph and request trace copy. */
        runtime: RuntimeLocaleKey;
    }
}
/** Services required by the Remote source and both slot contributions. */
export declare const inject: string[];
/** Mount dsh-runtime as one sidebar action and one frame overlay. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map
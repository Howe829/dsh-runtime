/** DSH Insider sidebar entry and frame overlay assembly. */
import runtimeExplorerRemote from '@deepseek-ai/dsh-runtime/remote';
import { en, zh } from "./locales.js";
import { RuntimeAction } from "./RuntimeAction.js";
import { RuntimeExplorer } from "./RuntimeExplorer.js";
import { createRuntimeSource } from "./source.js";
import { createRuntimeStore } from "./store.js";
export { createRuntimeStore } from "./store.js";
const NS = 'runtime';
/** Services required by the Remote source and both slot contributions. */
export const inject = ['slots', 'locale', 'remote'];
/** Mount DSH Insider as one sidebar action and one frame overlay. */
export async function apply(ctx) {
    if (ctx.get('remote.runtimeExplorer') === undefined) {
        await ctx.effect(() => ctx.remote.$mount(runtimeExplorerRemote), 'ui-runtime: runtimeExplorer Remote contribution');
    }
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-runtime: dictionaries');
    await ctx.inject(['remote.runtimeExplorer'], (runtimeCtx) => {
        const store = createRuntimeStore();
        const source = createRuntimeSource(async () => {
            const result = await runtimeCtx.remote.runtimeExplorer.snapshot();
            if (!result.ok) {
                throw new Error(`runtimeExplorer.snapshot failed: ${result.error.code}: ${result.error.message}`);
            }
            return result.value;
        }, (error) => { console.error('[dsh-insider] reading the runtime snapshot failed:', error); });
        const onVisibilityChange = (open) => { source.setActive(open); };
        const onRefresh = () => { source.refresh(); };
        runtimeCtx.effect(() => () => { source.dispose(); }, 'ui-runtime: source lifecycle');
        runtimeCtx.slots.inject('sidebar.footer.action', () => runtimeCtx.slots.register({
            name: 'sidebar.footer.action',
            id: 'dsh-insider',
            order: 80,
            locale: NS,
            store,
            inject: () => ({ onVisibilityChange }),
        }, RuntimeAction));
        runtimeCtx.slots.inject('shell.overlay', () => runtimeCtx.slots.register({
            name: 'shell.overlay',
            id: 'dsh-insider',
            order: 80,
            locale: NS,
            store,
            inject: () => ({
                hooks: { runtime: source },
                onVisibilityChange,
                onRefresh,
            }),
        }, RuntimeExplorer));
    });
}
//# sourceMappingURL=index.js.map
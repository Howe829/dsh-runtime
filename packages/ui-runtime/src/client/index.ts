/** dsh-runtime sidebar entry and frame overlay assembly. */

import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { RuntimeActionFace, RuntimeExplorerFace } from './faces.ts'
import { en, zh, type RuntimeLocaleKey } from './locales.ts'
import { RuntimeAction } from './RuntimeAction.tsx'
import { RuntimeExplorer } from './RuntimeExplorer.tsx'
import { createRuntimeSource } from './source.ts'
import { createRuntimeStore } from './store.ts'

export type { RuntimeLocaleKey } from './locales.ts'
export type { RuntimeLifecycleStatus } from './graph.ts'
export type { RuntimePhaseFilter, RuntimeSelection, RuntimeStoreState, RuntimeTab } from './store.ts'
export { createRuntimeStore } from './store.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** dsh-runtime graph and request trace copy. */
    runtime: RuntimeLocaleKey
  }
}

const NS = 'runtime'

/** Services required by the Remote source and both slot contributions. */
export const inject = ['slots', 'locale', 'remote', 'remote.runtimeExplorer']

/** Mount dsh-runtime as one sidebar action and one frame overlay. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-runtime: dictionaries')
  const store = createRuntimeStore()
  const source = createRuntimeSource(async () => {
    const result = await ctx.remote.runtimeExplorer.snapshot()
    if (!result.ok) {
      throw new Error(`runtimeExplorer.snapshot failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }, (error) => { console.error('[dsh-runtime] reading the runtime snapshot failed:', error) })
  const onVisibilityChange = (open: boolean): void => { source.setActive(open) }
  const onRefresh = (): void => { source.refresh() }
  ctx.effect(() => () => { source.dispose() }, 'ui-runtime: source lifecycle')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dsh-runtime',
    order: 80,
    locale: NS,
    store,
    inject: (): RuntimeActionFace => ({ onVisibilityChange }),
  }, RuntimeAction))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-runtime',
    order: 80,
    locale: NS,
    store,
    inject: (): RuntimeExplorerFace => ({
      hooks: { runtime: source },
      onVisibilityChange,
      onRefresh,
    }),
  }, RuntimeExplorer))
}

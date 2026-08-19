/** Sidebar footer action that opens dsh-runtime without adding a floating button. */

import { useLayoutEffect, useRef } from 'react'
import clsx from 'clsx'
import { IconBranchOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { createRuntimeStore } from './store.ts'
import type { RuntimeActionFace } from './faces.ts'
import css from './RuntimeExplorer.module.css'

export type RuntimeActionProps =
  & PropsRuntime<'sidebar.footer.action'>
  & PropsStore<ReturnType<typeof createRuntimeStore>>
  & InjectFace<RuntimeActionFace>
  & PropsLocale<'runtime'>

/** Render the sidebar row/rail entry and publish the measured sidebar edge. */
export function RuntimeAction({ wide, useStore, actions, onVisibilityChange, t }: RuntimeActionProps) {
  const open = useStore(state => state.open)
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const measure = (): void => {
      const element = root.current as HTMLDivElement
      const rect = element.getBoundingClientRect()
      actions.setSidebarOffset(Math.round(rect.right + (wide ? 12 : 10)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => { window.removeEventListener('resize', measure) }
  }, [actions, open, wide])

  const toggle = (): void => {
    const next = !open
    actions.setOpen(next)
    onVisibilityChange(next)
  }
  return (
    <div ref={root} className={clsx(css.sidebarAction, !wide && css.sidebarRail)}>
      <Tooltip label={t('open')} delayMs={500} disabled={wide}>
        <button
          type="button"
          className={css.sidebarButton}
          data-active={open || undefined}
          aria-label={t('open')}
          aria-expanded={open}
          onClick={toggle}
        >
          <IconBranchOutline16 size={wide ? 16 : 18} />
          {wide && <span>{t('open')}</span>}
          {wide && <i className={css.liveDot} aria-hidden />}
        </button>
      </Tooltip>
    </div>
  )
}

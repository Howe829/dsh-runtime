/** Sidebar footer action that opens DSH Insider without adding a floating button. */

import { useLayoutEffect, useRef } from 'react'
import clsx from 'clsx'
import { IconBranchOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { createRuntimeStore } from './store.ts'
import type { RuntimeActionFace } from './faces.ts'
import css from './RuntimeExplorer.module.css'

const FOOTER_SLOT = '[data-slot="sidebar.footer.action"]'

export interface FooterActionStack {
  /** Stable sidebar boundary used to size the fixed overlay. */
  readonly boundary: HTMLElement
  restore(): void
}

/** Promote the renderer's display-contents anchor to the footer action stack. */
export function stackFooterActions(action: HTMLElement): FooterActionStack {
  const anchor = action.closest<HTMLElement>(FOOTER_SLOT)
  if (anchor === null) return { boundary: action, restore: () => undefined }
  const previous = ['display', 'flex-direction', 'width', 'min-width'].map(property => ({
    property,
    value: anchor.style.getPropertyValue(property),
    priority: anchor.style.getPropertyPriority(property),
  }))
  anchor.style.setProperty('display', 'flex')
  anchor.style.setProperty('flex-direction', 'column')
  anchor.style.setProperty('width', '100%')
  anchor.style.setProperty('min-width', '0')
  return {
    boundary: anchor,
    restore: () => {
      for (const { property, value, priority } of previous) {
        if (value === '') anchor.style.removeProperty(property)
        else anchor.style.setProperty(property, value, priority)
      }
    },
  }
}

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
    const footer = stackFooterActions(root.current as HTMLDivElement)
    const measure = (): void => {
      const rect = footer.boundary.getBoundingClientRect()
      actions.setSidebarOffset(Math.round(rect.right + (wide ? 12 : 10)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      footer.restore()
    }
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

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Sidebar footer action that opens DSH Insider without adding a floating button. */
import { useLayoutEffect, useRef } from 'react';
import clsx from 'clsx';
import { IconBranchOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './RuntimeExplorer.module.css';
const FOOTER_SLOT = '[data-slot="sidebar.footer.action"]';
/** Promote the renderer's display-contents anchor to the footer action stack. */
export function stackFooterActions(action) {
    const anchor = action.closest(FOOTER_SLOT);
    if (anchor === null)
        return { boundary: action, restore: () => undefined };
    const previous = ['display', 'flex-direction', 'width', 'min-width'].map(property => ({
        property,
        value: anchor.style.getPropertyValue(property),
        priority: anchor.style.getPropertyPriority(property),
    }));
    anchor.style.setProperty('display', 'flex');
    anchor.style.setProperty('flex-direction', 'column');
    anchor.style.setProperty('width', '100%');
    anchor.style.setProperty('min-width', '0');
    return {
        boundary: anchor,
        restore: () => {
            for (const { property, value, priority } of previous) {
                if (value === '')
                    anchor.style.removeProperty(property);
                else
                    anchor.style.setProperty(property, value, priority);
            }
        },
    };
}
/** Render the sidebar row/rail entry and publish the measured sidebar edge. */
export function RuntimeAction({ wide, useStore, actions, onVisibilityChange, t }) {
    const open = useStore(state => state.open);
    const root = useRef(null);
    useLayoutEffect(() => {
        const footer = stackFooterActions(root.current);
        const measure = () => {
            const rect = footer.boundary.getBoundingClientRect();
            actions.setSidebarOffset(Math.round(rect.right + (wide ? 12 : 10)));
        };
        measure();
        window.addEventListener('resize', measure);
        return () => {
            window.removeEventListener('resize', measure);
            footer.restore();
        };
    }, [actions, open, wide]);
    const toggle = () => {
        const next = !open;
        actions.setOpen(next);
        onVisibilityChange(next);
    };
    return (_jsx("div", { ref: root, className: clsx(css.sidebarAction, !wide && css.sidebarRail), children: _jsx(Tooltip, { label: t('open'), delayMs: 500, disabled: wide, children: _jsxs("button", { type: "button", className: css.sidebarButton, "data-active": open || undefined, "aria-label": t('open'), "aria-expanded": open, onClick: toggle, children: [_jsx(IconBranchOutline16, { size: wide ? 16 : 18 }), wide && _jsx("span", { children: t('open') }), wide && _jsx("i", { className: css.liveDot, "aria-hidden": true })] }) }) }));
}
//# sourceMappingURL=RuntimeAction.js.map
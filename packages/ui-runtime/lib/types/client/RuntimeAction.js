import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Sidebar footer action that opens dsh-runtime without adding a floating button. */
import { useLayoutEffect, useRef } from 'react';
import clsx from 'clsx';
import { IconBranchOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './RuntimeExplorer.module.css';
/** Render the sidebar row/rail entry and publish the measured sidebar edge. */
export function RuntimeAction({ wide, useStore, actions, onVisibilityChange, t }) {
    const open = useStore(state => state.open);
    const root = useRef(null);
    useLayoutEffect(() => {
        const measure = () => {
            const element = root.current;
            const rect = element.getBoundingClientRect();
            actions.setSidebarOffset(Math.round(rect.right + (wide ? 12 : 10)));
        };
        measure();
        window.addEventListener('resize', measure);
        return () => { window.removeEventListener('resize', measure); };
    }, [actions, open, wide]);
    const toggle = () => {
        const next = !open;
        actions.setOpen(next);
        onVisibilityChange(next);
    };
    return (_jsx("div", { ref: root, className: clsx(css.sidebarAction, !wide && css.sidebarRail), children: _jsx(Tooltip, { label: t('open'), delayMs: 500, disabled: wide, children: _jsxs("button", { type: "button", className: css.sidebarButton, "data-active": open || undefined, "aria-label": t('open'), "aria-expanded": open, onClick: toggle, children: [_jsx(IconBranchOutline16, { size: wide ? 16 : 18 }), wide && _jsx("span", { children: t('open') }), wide && _jsx("i", { className: css.liveDot, "aria-hidden": true })] }) }) }));
}
//# sourceMappingURL=RuntimeAction.js.map
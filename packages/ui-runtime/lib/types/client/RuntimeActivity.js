import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/** Bounded Effect lifecycle activity table and per-plugin drill-down. */
import { useId, useMemo, useState } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, } from 'recharts';
import css from './RuntimeExplorer.module.css';
function activityState(plugin) {
    const first = plugin.trend[0]?.current ?? plugin.current;
    const last = plugin.trend.at(-1)?.current ?? plugin.current;
    if (plugin.delta > 0 && last > first)
        return 'growing';
    if (plugin.churn > 0 && Math.abs(plugin.delta) * 4 <= plugin.churn)
        return 'dynamic';
    if (plugin.churn === 0)
        return 'stable';
}
const ACTIVITY_STATE_LABEL = {
    growing: 'activityGrowing',
    dynamic: 'activityDynamic',
    stable: 'activityStable',
};
function Delta({ value }) {
    return _jsxs("span", { className: css.activityDelta, "data-direction": value > 0 ? 'up' : value < 0 ? 'down' : 'flat', children: [value > 0 ? '+' : '', value.toLocaleString()] });
}
function Sparkline({ plugin }) {
    return _jsx("div", { className: css.activitySparkline, "aria-hidden": true, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsx(LineChart, { data: plugin.trend, children: _jsx(Line, { type: "monotone", dataKey: "current", stroke: "currentColor", strokeWidth: 1.8, dot: false, isAnimationActive: false }) }) }) });
}
function formatActivityTime(value, withSeconds = false) {
    return new Date(Number(value)).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        ...(withSeconds ? { second: '2-digit' } : {}),
    });
}
function activityCurrentDomain([dataMin, dataMax]) {
    const padding = Math.max(1, Math.ceil(Math.max(1, dataMax - dataMin) * 0.18));
    return [Math.max(0, Math.floor(dataMin - padding)), Math.ceil(dataMax + padding)];
}
function ActivityChartTooltip({ active, label, payload, t }) {
    if (!active || payload === undefined || payload.length === 0)
        return null;
    const values = new Map(payload.map(item => [String(item.dataKey), Number(item.value ?? 0)]));
    return _jsxs("div", { className: css.activityChartTooltip, children: [_jsx("time", { children: formatActivityTime(label, true) }), _jsxs("dl", { children: [_jsxs("div", { "data-series": "current", children: [_jsxs("dt", { children: [_jsx("i", {}), t('currentEffects')] }), _jsx("dd", { children: values.get('current') ?? 0 })] }), _jsxs("div", { "data-series": "created", children: [_jsxs("dt", { children: [_jsx("i", {}), t('createdEffects')] }), _jsxs("dd", { children: ["+", values.get('created') ?? 0] })] }), _jsxs("div", { "data-series": "disposed", children: [_jsxs("dt", { children: [_jsx("i", {}), t('disposedEffects')] }), _jsxs("dd", { children: ["\u2212", values.get('disposed') ?? 0] })] })] })] });
}
export function RuntimeActivity({ activity, t }) {
    const [selectedId, setSelectedId] = useState();
    const activityGradientId = `activity-current-${useId().replaceAll(':', '')}`;
    const selected = useMemo(() => activity.plugins.find(plugin => plugin.pluginId === selectedId), [activity.plugins, selectedId]);
    const windowMinutes = Math.max(1, Math.round(activity.windowMs / 60_000));
    if (selected !== undefined) {
        const recent = activity.recent.filter(transition => transition.pluginId === selected.pluginId).slice(0, 12);
        const initialCurrent = Math.max(0, selected.current - selected.delta);
        const hasCurrentMovement = selected.trend.some(point => point.current !== initialCurrent);
        return _jsxs("article", { className: `${css.activityCard} ${css.activityDetail}`, children: [_jsxs("header", { className: css.activityHeader, children: [_jsxs("div", { children: [_jsxs("button", { type: "button", className: css.activityBack, onClick: () => { setSelectedId(undefined); }, children: ["\u2190 ", t('backToActivity')] }), _jsx("h3", { children: selected.label }), _jsx("p", { children: selected.moduleName })] }), !activity.complete && _jsx("span", { className: css.activityIncomplete, children: t('activityIncomplete') })] }), _jsxs("dl", { className: css.activityDetailMetrics, children: [_jsxs("div", { children: [_jsx("dt", { children: t('currentEffects') }), _jsx("dd", { children: selected.current })] }), _jsxs("div", { children: [_jsx("dt", { children: t('createdEffects') }), _jsx("dd", { children: selected.created })] }), _jsxs("div", { children: [_jsx("dt", { children: t('disposedEffects') }), _jsx("dd", { children: selected.disposed })] }), _jsxs("div", { children: [_jsx("dt", { children: t('netDelta') }), _jsx("dd", { children: _jsx(Delta, { value: selected.delta }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('churn') }), _jsx("dd", { children: selected.churn })] })] }), _jsxs("div", { className: css.activityDetailGrid, children: [_jsxs("section", { children: [_jsxs("h4", { children: [t('activityTrend'), " \u00B7 ", windowMinutes, " ", t('minutes')] }), selected.churn === 0
                                    ? _jsxs("div", { className: css.activityChartEmpty, role: "status", children: [_jsx("strong", { children: selected.current }), _jsx("span", { children: t('currentEffects') }), _jsx("p", { children: t('activityNoChanges').replace('{minutes}', String(windowMinutes)) })] })
                                    : _jsxs("div", { className: css.activityChartShell, children: [_jsxs("ul", { className: css.activityChartLegend, "aria-label": t('activityTrend'), children: [_jsxs("li", { "data-series": "current", children: [_jsx("i", {}), t('currentEffects')] }), _jsxs("li", { "data-series": "created", children: [_jsx("i", {}), t('createdEffects')] }), _jsxs("li", { "data-series": "disposed", children: [_jsx("i", {}), t('disposedEffects')] })] }), _jsx("div", { className: css.activityChart, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ComposedChart, { data: selected.trend, margin: { top: 10, right: 10, bottom: 0, left: 4 }, barCategoryGap: "46%", barGap: 2, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: activityGradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: 0.2 }), _jsx("stop", { offset: "100%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: 0.02 })] }) }), _jsx(CartesianGrid, { vertical: false, stroke: "var(--dsw-alias-border-subtle)", strokeDasharray: "3 5" }), _jsx(XAxis, { dataKey: "time", axisLine: false, tickLine: false, tickMargin: 8, minTickGap: 42, interval: "preserveStartEnd", tickFormatter: value => formatActivityTime(value), height: 24 }), _jsx(YAxis, { yAxisId: "current", allowDecimals: false, axisLine: false, tickLine: false, tickCount: 4, width: 38, tickMargin: 7, domain: activityCurrentDomain }), _jsx(YAxis, { yAxisId: "activity", orientation: "right", hide: true, allowDecimals: false, domain: [0, 'dataMax + 1'] }), _jsx(RechartsTooltip, { isAnimationActive: false, cursor: { stroke: 'var(--dsw-alias-state-business-secondary)', strokeDasharray: '3 4' }, content: ({ active, label, payload }) => _jsx(ActivityChartTooltip, { active: active, label: label, payload: payload, t: t }) }), hasCurrentMovement && _jsx(ReferenceLine, { yAxisId: "current", y: initialCurrent, stroke: "var(--dsw-alias-label-quaternary)", strokeDasharray: "4 4" }), _jsx(Area, { yAxisId: "current", type: "monotone", dataKey: "current", name: t('currentEffects'), stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: 2, fill: `url(#${activityGradientId})`, dot: false, activeDot: { r: 3.5, strokeWidth: 2 }, isAnimationActive: false }), _jsx(Bar, { yAxisId: "activity", dataKey: "created", name: t('createdEffects'), fill: "var(--dsw-alias-state-success-primary)", barSize: 5, radius: [3, 3, 0, 0], isAnimationActive: false }), _jsx(Bar, { yAxisId: "activity", dataKey: "disposed", name: t('disposedEffects'), fill: "var(--dsw-alias-state-warn-primary)", barSize: 5, radius: [3, 3, 0, 0], isAnimationActive: false })] }) }) })] })] }), _jsxs("section", { children: [_jsx("h4", { children: t('recentEffects') }), recent.length === 0
                                    ? _jsx("p", { className: css.activityEmpty, children: t('noRecentEffects') })
                                    : _jsx("ol", { className: css.activityRecent, children: recent.map(transition => _jsxs("li", { children: [_jsx("time", { children: new Date(transition.time).toLocaleTimeString() }), _jsx("b", { "data-action": transition.action, children: transition.action === 'created' ? '+' : '−' }), _jsx("span", { title: transition.effectLabel, children: transition.effectLabel }), transition.fiberId !== undefined && _jsx("small", { children: transition.fiberId.split(':').at(-1) })] }, transition.id)) })] })] })] });
    }
    const plugins = activity.plugins.slice(0, 8);
    return _jsxs("article", { className: css.activityCard, children: [_jsxs("header", { className: css.activityHeader, children: [_jsxs("div", { children: [_jsx("h3", { children: t('pluginActivity') }), _jsx("p", { children: t('effectLifecycleWindow').replace('{minutes}', String(windowMinutes)) })] }), _jsxs("dl", { className: css.activityTotals, children: [_jsxs("div", { children: [_jsx("dt", { children: t('currentEffects') }), _jsx("dd", { children: activity.current })] }), _jsxs("div", { children: [_jsx("dt", { children: t('netDelta') }), _jsx("dd", { children: _jsx(Delta, { value: activity.delta }) })] }), _jsxs("div", { children: [_jsx("dt", { children: t('churn') }), _jsx("dd", { children: activity.churn })] })] })] }), !activity.complete && _jsx("p", { className: css.activityIncomplete, children: t('activityIncomplete') }), plugins.length === 0
                ? _jsx("p", { className: css.activityEmpty, children: t('noEffectActivity') })
                : _jsxs("div", { className: css.activityTable, "aria-label": t('pluginActivity'), children: [_jsxs("div", { className: css.activityTableHead, "aria-hidden": true, children: [_jsx("span", { children: t('plugin') }), _jsx("span", { children: t('currentEffects') }), _jsx("span", { children: "\u0394" }), _jsx("span", { children: t('churn') }), _jsx("span", { children: t('activityTrend') })] }), plugins.map((plugin) => {
                            const state = activityState(plugin);
                            return _jsxs("button", { type: "button", className: css.activityRow, onClick: () => { setSelectedId(plugin.pluginId); }, children: [_jsxs("span", { className: css.activityPlugin, children: [_jsx("strong", { children: plugin.label }), state !== undefined && _jsx("small", { "data-state": state, children: t(ACTIVITY_STATE_LABEL[state]) })] }), _jsx("span", { children: plugin.current }), _jsx("span", { children: _jsx(Delta, { value: plugin.delta }) }), _jsx("span", { children: plugin.churn }), _jsx("span", { children: _jsx(Sparkline, { plugin: plugin }) })] }, plugin.pluginId);
                        })] })] });
}
//# sourceMappingURL=RuntimeActivity.js.map
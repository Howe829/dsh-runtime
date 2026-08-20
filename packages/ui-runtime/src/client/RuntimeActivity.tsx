/** Bounded Effect lifecycle activity table and per-plugin drill-down. */

import { useId, useMemo, useState } from 'react'
import type {
  RuntimeEffectActivitySnapshot, RuntimePluginEffectActivity,
} from '@deepseek-ai/dsh-api-remotes/client'
import {
  Area, Bar, CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis,
} from 'recharts'
import type { RuntimeLocaleKey } from './locales.ts'
import css from './RuntimeExplorer.module.css'

function activityState(plugin: RuntimePluginEffectActivity): 'growing' | 'dynamic' | 'stable' | undefined {
  const first = plugin.trend[0]?.current ?? plugin.current
  const last = plugin.trend.at(-1)?.current ?? plugin.current
  if (plugin.delta > 0 && last > first) return 'growing'
  if (plugin.churn > 0 && Math.abs(plugin.delta) * 4 <= plugin.churn) return 'dynamic'
  if (plugin.churn === 0) return 'stable'
}

const ACTIVITY_STATE_LABEL = {
  growing: 'activityGrowing',
  dynamic: 'activityDynamic',
  stable: 'activityStable',
} as const satisfies Record<NonNullable<ReturnType<typeof activityState>>, RuntimeLocaleKey>

function Delta({ value }: { value: number }) {
  return <span className={css.activityDelta} data-direction={value > 0 ? 'up' : value < 0 ? 'down' : 'flat'}>
    {value > 0 ? '+' : ''}{value.toLocaleString()}
  </span>
}

function Sparkline({ plugin }: { plugin: RuntimePluginEffectActivity }) {
  return <div className={css.activitySparkline} aria-hidden>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={plugin.trend}>
        <Line type="monotone" dataKey="current" stroke="currentColor" strokeWidth={1.8} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
}

interface ActivityTooltipEntry {
  readonly dataKey?: unknown
  readonly value?: unknown
}

function formatActivityTime(value: unknown, withSeconds = false): string {
  return new Date(Number(value)).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
  })
}

function activityCurrentDomain([dataMin, dataMax]: readonly [number, number]): readonly [number, number] {
  const padding = Math.max(1, Math.ceil(Math.max(1, dataMax - dataMin) * 0.18))
  return [Math.max(0, Math.floor(dataMin - padding)), Math.ceil(dataMax + padding)]
}

function ActivityChartTooltip({ active, label, payload, t }: {
  active?: boolean
  label?: unknown
  payload?: readonly ActivityTooltipEntry[]
  t: (key: RuntimeLocaleKey) => string
}) {
  if (!active || payload === undefined || payload.length === 0) return null
  const values = new Map(payload.map(item => [String(item.dataKey), Number(item.value ?? 0)]))
  return <div className={css.activityChartTooltip}>
    <time>{formatActivityTime(label, true)}</time>
    <dl>
      <div data-series="current"><dt><i />{t('currentEffects')}</dt><dd>{values.get('current') ?? 0}</dd></div>
      <div data-series="created"><dt><i />{t('createdEffects')}</dt><dd>+{values.get('created') ?? 0}</dd></div>
      <div data-series="disposed"><dt><i />{t('disposedEffects')}</dt><dd>−{values.get('disposed') ?? 0}</dd></div>
    </dl>
  </div>
}

export function RuntimeActivity({ activity, t }: {
  activity: RuntimeEffectActivitySnapshot
  t: (key: RuntimeLocaleKey) => string
}) {
  const [selectedId, setSelectedId] = useState<string>()
  const activityGradientId = `activity-current-${useId().replaceAll(':', '')}`
  const selected = useMemo(
    () => activity.plugins.find(plugin => plugin.pluginId === selectedId),
    [activity.plugins, selectedId],
  )
  const windowMinutes = Math.max(1, Math.round(activity.windowMs / 60_000))

  if (selected !== undefined) {
    const recent = activity.recent.filter(transition => transition.pluginId === selected.pluginId).slice(0, 12)
    const initialCurrent = Math.max(0, selected.current - selected.delta)
    const hasCurrentMovement = selected.trend.some(point => point.current !== initialCurrent)
    return <article className={`${css.activityCard} ${css.activityDetail}`}>
      <header className={css.activityHeader}>
        <div>
          <button type="button" className={css.activityBack} onClick={() => { setSelectedId(undefined) }}>
            ← {t('backToActivity')}
          </button>
          <h3>{selected.label}</h3>
          <p>{selected.moduleName}</p>
        </div>
        {!activity.complete && <span className={css.activityIncomplete}>{t('activityIncomplete')}</span>}
      </header>
      <dl className={css.activityDetailMetrics}>
        <div><dt>{t('currentEffects')}</dt><dd>{selected.current}</dd></div>
        <div><dt>{t('createdEffects')}</dt><dd>{selected.created}</dd></div>
        <div><dt>{t('disposedEffects')}</dt><dd>{selected.disposed}</dd></div>
        <div><dt>{t('netDelta')}</dt><dd><Delta value={selected.delta} /></dd></div>
        <div><dt>{t('churn')}</dt><dd>{selected.churn}</dd></div>
      </dl>
      <div className={css.activityDetailGrid}>
        <section>
          <h4>{t('activityTrend')} · {windowMinutes} {t('minutes')}</h4>
          {selected.churn === 0
            ? <div className={css.activityChartEmpty} role="status">
              <strong>{selected.current}</strong>
              <span>{t('currentEffects')}</span>
              <p>{t('activityNoChanges').replace('{minutes}', String(windowMinutes))}</p>
            </div>
            : <div className={css.activityChartShell}>
              <ul className={css.activityChartLegend} aria-label={t('activityTrend')}>
                <li data-series="current"><i />{t('currentEffects')}</li>
                <li data-series="created"><i />{t('createdEffects')}</li>
                <li data-series="disposed"><i />{t('disposedEffects')}</li>
              </ul>
              <div className={css.activityChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={selected.trend}
                    margin={{ top: 10, right: 10, bottom: 0, left: 4 }}
                    barCategoryGap="46%"
                    barGap={2}
                  >
                    <defs>
                      <linearGradient id={activityGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--dsw-alias-state-business-primary)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--dsw-alias-state-business-primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--dsw-alias-border-subtle)" strokeDasharray="3 5" />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      minTickGap={42}
                      interval="preserveStartEnd"
                      tickFormatter={value => formatActivityTime(value)}
                      height={24}
                    />
                    <YAxis
                      yAxisId="current"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tickCount={4}
                      width={38}
                      tickMargin={7}
                      domain={activityCurrentDomain}
                    />
                    <YAxis yAxisId="activity" orientation="right" hide allowDecimals={false} domain={[0, 'dataMax + 1']} />
                    <RechartsTooltip
                      isAnimationActive={false}
                      cursor={{ stroke: 'var(--dsw-alias-state-business-secondary)', strokeDasharray: '3 4' }}
                      content={({ active, label, payload }) => <ActivityChartTooltip
                        active={active}
                        label={label}
                        payload={payload}
                        t={t}
                      />}
                    />
                    {hasCurrentMovement && <ReferenceLine
                      yAxisId="current"
                      y={initialCurrent}
                      stroke="var(--dsw-alias-label-quaternary)"
                      strokeDasharray="4 4"
                    />}
                    <Area
                      yAxisId="current"
                      type="monotone"
                      dataKey="current"
                      name={t('currentEffects')}
                      stroke="var(--dsw-alias-state-business-primary)"
                      strokeWidth={2}
                      fill={`url(#${activityGradientId})`}
                      dot={false}
                      activeDot={{ r: 3.5, strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                    <Bar
                      yAxisId="activity"
                      dataKey="created"
                      name={t('createdEffects')}
                      fill="var(--dsw-alias-state-success-primary)"
                      barSize={5}
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />
                    <Bar
                      yAxisId="activity"
                      dataKey="disposed"
                      name={t('disposedEffects')}
                      fill="var(--dsw-alias-state-warn-primary)"
                      barSize={5}
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>}
        </section>
        <section>
          <h4>{t('recentEffects')}</h4>
          {recent.length === 0
            ? <p className={css.activityEmpty}>{t('noRecentEffects')}</p>
            : <ol className={css.activityRecent}>
              {recent.map(transition => <li key={transition.id}>
                <time>{new Date(transition.time).toLocaleTimeString()}</time>
                <b data-action={transition.action}>{transition.action === 'created' ? '+' : '−'}</b>
                <span title={transition.effectLabel}>{transition.effectLabel}</span>
                {transition.fiberId !== undefined && <small>{transition.fiberId.split(':').at(-1)}</small>}
              </li>)}
            </ol>}
        </section>
      </div>
    </article>
  }

  const plugins = activity.plugins.slice(0, 8)
  return <article className={css.activityCard}>
    <header className={css.activityHeader}>
      <div>
        <h3>{t('pluginActivity')}</h3>
        <p>{t('effectLifecycleWindow').replace('{minutes}', String(windowMinutes))}</p>
      </div>
      <dl className={css.activityTotals}>
        <div><dt>{t('currentEffects')}</dt><dd>{activity.current}</dd></div>
        <div><dt>{t('netDelta')}</dt><dd><Delta value={activity.delta} /></dd></div>
        <div><dt>{t('churn')}</dt><dd>{activity.churn}</dd></div>
      </dl>
    </header>
    {!activity.complete && <p className={css.activityIncomplete}>{t('activityIncomplete')}</p>}
    {plugins.length === 0
      ? <p className={css.activityEmpty}>{t('noEffectActivity')}</p>
      : <div className={css.activityTable} aria-label={t('pluginActivity')}>
        <div className={css.activityTableHead} aria-hidden>
          <span>{t('plugin')}</span>
          <span>{t('currentEffects')}</span>
          <span>Δ</span>
          <span>{t('churn')}</span>
          <span>{t('activityTrend')}</span>
        </div>
        {plugins.map((plugin) => {
          const state = activityState(plugin)
          return <button
            type="button"
            className={css.activityRow}
            key={plugin.pluginId}
            onClick={() => { setSelectedId(plugin.pluginId) }}
          >
            <span className={css.activityPlugin}>
              <strong>{plugin.label}</strong>
              {state !== undefined && <small data-state={state}>{t(ACTIVITY_STATE_LABEL[state])}</small>}
            </span>
            <span>{plugin.current}</span>
            <span><Delta value={plugin.delta} /></span>
            <span>{plugin.churn}</span>
            <span><Sparkline plugin={plugin} /></span>
          </button>
        })}
      </div>}
  </article>
}

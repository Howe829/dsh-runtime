/** Read-only process, Cordis, and Agent health summary. */
import type { RuntimeOverviewSnapshot, RuntimeOverviewStatus, RuntimePluginCategory } from '@deepseek-ai/dsh-api-remotes/client';
import type { RuntimeLocaleKey } from './locales.ts';
/** Format a process duration as an unambiguous hours:minutes:seconds clock. */
export declare function formatRuntimeUptime(uptimeMs: number): string;
export declare function RuntimeOverview({ overview, t, onInspect, }: {
    overview: RuntimeOverviewSnapshot;
    t: (key: RuntimeLocaleKey) => string;
    onInspect?: (category: RuntimePluginCategory | undefined, status: RuntimeOverviewStatus) => void;
}): import("react").JSX.Element;
//# sourceMappingURL=RuntimeOverview.d.ts.map
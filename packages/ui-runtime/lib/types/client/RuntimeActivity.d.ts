/** Bounded Effect lifecycle activity table and per-plugin drill-down. */
import type { RuntimeEffectActivitySnapshot } from '@deepseek-ai/dsh-api-remotes/client';
import type { RuntimeLocaleKey } from './locales.ts';
export declare function RuntimeActivity({ activity, t }: {
    activity: RuntimeEffectActivitySnapshot;
    t: (key: RuntimeLocaleKey) => string;
}): import("react").JSX.Element;
//# sourceMappingURL=RuntimeActivity.d.ts.map
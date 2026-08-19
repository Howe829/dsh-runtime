/** Observable Remote snapshot with single-flight refresh and open-only polling. */
import type { RuntimeExplorerSnapshot } from '@deepseek-ai/dsh-api-remotes/client';
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots';
/** Current browser view of the Host snapshot request lifecycle. */
export interface RuntimeSourceSnapshot {
    readonly data: RuntimeExplorerSnapshot | undefined;
    readonly loading: boolean;
    readonly error: string | undefined;
}
/** Observable runtime snapshot source controlled by overlay visibility. */
export interface RuntimeSource extends HostObservable<RuntimeSourceSnapshot> {
    refresh(): void;
    setActive(active: boolean): void;
    dispose(): void;
}
/**
 * Build the browser source over the generated Remote call.
 * @param read - Invoke the mounted runtimeExplorer snapshot Remote.
 * @param onError - Report a failed read without exposing transport detail in product copy.
 * @returns An observable source with single-flight refresh and visible-only polling.
 */
export declare function createRuntimeSource(read: () => Promise<RuntimeExplorerSnapshot>, onError: (error: unknown) => void): RuntimeSource;
//# sourceMappingURL=source.d.ts.map
/** Observable Remote snapshot with single-flight refresh and open-only polling. */
const SUPPORTED_SCHEMA_VERSION = 3;
/**
 * Build the browser source over the generated Remote call.
 * @param read - Invoke the mounted runtimeExplorer snapshot Remote.
 * @param onError - Report a failed read without exposing transport detail in product copy.
 * @returns An observable source with single-flight refresh and visible-only polling.
 */
export function createRuntimeSource(read, onError) {
    const listeners = new Set();
    let snapshot = { data: undefined, loading: false, error: undefined };
    let inFlight;
    let timer;
    let active = false;
    let disposed = false;
    const publish = (next) => {
        snapshot = next;
        for (const listener of [...listeners])
            listener();
    };
    const clearTimer = () => {
        if (timer !== undefined)
            clearTimeout(timer);
        timer = undefined;
    };
    const schedule = (delay) => {
        clearTimer();
        if (!active || disposed)
            return;
        timer = setTimeout(() => { source.refresh(); }, delay);
    };
    const source = {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        refresh: () => {
            if (disposed || inFlight !== undefined)
                return;
            publish({ ...snapshot, loading: snapshot.data === undefined, error: undefined });
            inFlight = read().then((data) => {
                if (disposed)
                    return;
                if (data.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
                    const error = new Error('unsupported runtime snapshot schema');
                    onError(error);
                    publish({ ...snapshot, loading: false, error: error.message });
                    return;
                }
                publish({ data, loading: false, error: undefined });
                schedule(data.refreshIntervalMs);
            }, (error) => {
                if (disposed)
                    return;
                onError(error);
                publish({ ...snapshot, loading: false, error: error instanceof Error ? error.message : 'runtime snapshot failed' });
            }).then(() => { inFlight = undefined; });
        },
        setActive: (next) => {
            active = next;
            if (active)
                source.refresh();
            else
                clearTimer();
        },
        dispose: () => {
            disposed = true;
            active = false;
            clearTimer();
            listeners.clear();
        },
    };
    return source;
}
//# sourceMappingURL=source.js.map
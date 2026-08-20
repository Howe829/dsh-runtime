/** Browser-only persistence for user-arranged runtime graph positions. */
const STORAGE_PREFIX = 'dsh-runtime:graph-layout:v1:';
/** Stable localStorage key scoped to the active Harness profile. */
export function graphLayoutStorageKey(profile) {
    return `${STORAGE_PREFIX}${encodeURIComponent(profile ?? 'unknown')}`;
}
/** Read valid finite positions without allowing corrupt browser data to break the graph. */
export function readGraphPresentation(profile) {
    const fallback = { positions: {}, neighbourDepth: 1 };
    if (typeof window === 'undefined')
        return fallback;
    try {
        const value = window.localStorage.getItem(graphLayoutStorageKey(profile));
        if (value === null)
            return fallback;
        const parsed = JSON.parse(value);
        if (parsed.schemaVersion !== 1 || parsed.positions === undefined || typeof parsed.positions !== 'object')
            return fallback;
        const positions = Object.fromEntries(Object.entries(parsed.positions).filter(([, position]) => (position !== null
            && typeof position === 'object'
            && Number.isFinite(position.x)
            && Number.isFinite(position.y)
            && typeof position.pinned === 'boolean')));
        const neighbourDepth = parsed.neighbourDepth === 2 || parsed.neighbourDepth === 'all'
            ? parsed.neighbourDepth
            : 1;
        return { positions, neighbourDepth };
    }
    catch {
        return fallback;
    }
}
/** Compatibility helper for callers that only need saved node positions. */
export function readGraphLayout(profile) {
    return readGraphPresentation(profile).positions;
}
/** Persist presentation state only; runtime state never enters browser storage. */
export function writeGraphLayout(profile, positions, neighbourDepth = 1) {
    if (typeof window === 'undefined')
        return;
    try {
        const value = {
            schemaVersion: 1,
            profile: profile ?? null,
            updatedAt: Date.now(),
            positions,
            neighbourDepth,
        };
        window.localStorage.setItem(graphLayoutStorageKey(profile), JSON.stringify(value));
    }
    catch {
        // Storage may be unavailable or full; the in-memory arrangement remains usable.
    }
}
/** Drop placements that no longer correspond to the current logical graph. */
export function pruneGraphLayout(positions, nodes) {
    const logicalKeys = new Set(nodes.map(node => node.logicalKey));
    return Object.fromEntries(Object.entries(positions).filter(([key]) => logicalKeys.has(key)));
}
//# sourceMappingURL=graph-persistence.js.map
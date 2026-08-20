/** Deterministic provider-left graph layout for the runtime SVG. */
const NODE_SIZE = 116;
const NODE_RADIUS = NODE_SIZE / 2;
const NODE_GAP = 28;
const PADDING = 36;
const FORCE_STEPS = 160;
const COLLISION_STEPS = 24;
const IDEAL_EDGE_LENGTH = 205;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
function clampPosition(position, width, height) {
    position.x = Math.min(width - NODE_SIZE - PADDING, Math.max(PADDING, position.x));
    position.y = Math.min(height - NODE_SIZE - PADDING, Math.max(PADDING, position.y));
}
/**
 * Resolve exact circle overlap after the force approximation settles.
 * Pinned placements stay fixed; an unpinned neighbour yields the full distance.
 */
function resolveNodeCollisions(positions, width, height) {
    const minimumDistance = NODE_SIZE + NODE_GAP;
    for (let step = 0; step < COLLISION_STEPS; step += 1) {
        let moved = false;
        for (let left = 0; left < positions.length; left += 1) {
            for (let right = left + 1; right < positions.length; right += 1) {
                const a = positions[left];
                const b = positions[right];
                if (a.pinned && b.pinned)
                    continue;
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                if (dx === 0 && dy === 0) {
                    const angle = (hashText(`${a.node.logicalKey}:${b.node.logicalKey}`) % 360) * Math.PI / 180;
                    dx = Math.cos(angle);
                    dy = Math.sin(angle);
                }
                const distance = Math.max(0.001, Math.hypot(dx, dy));
                const overlap = minimumDistance - distance;
                if (overlap <= 0.01)
                    continue;
                moved = true;
                const unitX = dx / distance;
                const unitY = dy / distance;
                const aShare = a.pinned ? 0 : b.pinned ? 1 : 0.5;
                const bShare = b.pinned ? 0 : a.pinned ? 1 : 0.5;
                a.x -= unitX * overlap * aShare;
                a.y -= unitY * overlap * aShare;
                b.x += unitX * overlap * bShare;
                b.y += unitY * overlap * bShare;
                clampPosition(a, width, height);
                clampPosition(b, width, height);
            }
        }
        if (!moved)
            break;
    }
}
/**
 * Keep the requested upstream and downstream neighbourhood around one selected node.
 * @param nodes - Graph nodes after search and lifecycle filtering.
 * @param edges - Dependency edges joining the filtered nodes.
 * @param selectedId - Selected node id, or undefined for the complete graph.
 * @param depth - Maximum relationship distance; one hop matches the default graph interaction.
 * @returns The selected node's bounded weakly connected neighbourhood in stable input order.
 */
export function focusRuntimeGraph(nodes, edges, selectedId, depth = 1) {
    const nodeIds = new Set(nodes.map(node => node.id));
    const validEdges = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    if (selectedId === undefined || !nodeIds.has(selectedId))
        return { nodes, edges: validEdges };
    const neighbours = new Map();
    for (const edge of validEdges) {
        const sourceNeighbours = neighbours.get(edge.source) ?? [];
        sourceNeighbours.push(edge.target);
        neighbours.set(edge.source, sourceNeighbours);
        const targetNeighbours = neighbours.get(edge.target) ?? [];
        targetNeighbours.push(edge.source);
        neighbours.set(edge.target, targetNeighbours);
    }
    const related = new Set();
    const pending = [{ id: selectedId, distance: 0 }];
    while (pending.length > 0) {
        const { id, distance } = pending.shift();
        if (related.has(id))
            continue;
        related.add(id);
        if (depth !== 'all' && distance >= depth)
            continue;
        for (const neighbour of neighbours.get(id) ?? [])
            pending.push({ id: neighbour, distance: distance + 1 });
    }
    return {
        nodes: nodes.filter(node => related.has(node.id)),
        edges: validEdges.filter(edge => related.has(edge.source) && related.has(edge.target)),
    };
}
function reachable(start, neighbours) {
    const found = new Set();
    const pending = [...(neighbours.get(start) ?? [])];
    while (pending.length > 0) {
        const id = pending.pop();
        if (id === start || found.has(id))
            continue;
        found.add(id);
        for (const neighbour of neighbours.get(id) ?? [])
            pending.push(neighbour);
    }
    return found;
}
/**
 * Classify the selected plugin's transitive dependencies and dependants.
 * Runtime edges point from a consumer (`source`) to its provider (`target`).
 * @param nodes - Visible nodes in the focused component.
 * @param edges - Visible dependency edges.
 * @param selectedId - Current focus node, or undefined outside focus mode.
 * @returns Stable node and edge relation maps used by graph styling and the legend.
 */
export function runtimeGraphRelations(nodes, edges, selectedId) {
    const nodeIds = new Set(nodes.map(node => node.id));
    if (selectedId === undefined || !nodeIds.has(selectedId))
        return { nodes: new Map(), edges: new Map() };
    const dependencies = new Map();
    const dependants = new Map();
    for (const edge of edges) {
        if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target))
            continue;
        dependencies.set(edge.source, [...(dependencies.get(edge.source) ?? []), edge.target]);
        dependants.set(edge.target, [...(dependants.get(edge.target) ?? []), edge.source]);
    }
    const dependencyIds = reachable(selectedId, dependencies);
    const dependantIds = reachable(selectedId, dependants);
    const nodeRelations = new Map();
    for (const node of nodes) {
        if (node.id === selectedId)
            nodeRelations.set(node.id, 'selected');
        else if (dependencyIds.has(node.id) && dependantIds.has(node.id))
            nodeRelations.set(node.id, 'both');
        else if (dependencyIds.has(node.id))
            nodeRelations.set(node.id, 'dependency');
        else if (dependantIds.has(node.id))
            nodeRelations.set(node.id, 'dependant');
        else
            nodeRelations.set(node.id, 'related');
    }
    const edgeRelations = new Map();
    for (const edge of edges) {
        const source = nodeRelations.get(edge.source);
        const target = nodeRelations.get(edge.target);
        const relation = edge.source === selectedId
            ? 'dependency'
            : edge.target === selectedId
                ? 'dependant'
                : source === 'dependency' && target === 'dependency'
                    ? 'dependency'
                    : source === 'dependant' && target === 'dependant'
                        ? 'dependant'
                        : source === 'both' || target === 'both'
                            ? 'both'
                            : 'related';
        edgeRelations.set(`${edge.source}:${edge.target}`, relation);
    }
    return { nodes: nodeRelations, edges: edgeRelations };
}
function hashText(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
/** Stable topology identity that deliberately excludes lifecycle state. */
export function runtimeGraphTopologyKey(nodes, edges) {
    const nodeKeys = nodes.map(node => `${node.id}:${node.logicalKey}`).sort();
    const edgeKeys = edges.map(edge => `${edge.type}:${edge.source}>${edge.target}`).sort();
    return `${nodeKeys.join('|')}::${edgeKeys.join('|')}`;
}
/**
 * Settle a deterministic, bounded force-directed graph.
 * Saved positions seed the simulation; pinned positions remain fixed.
 * @param nodes - Visible runtime nodes after Client filtering.
 * @param edges - Visible dependency edges joining those nodes.
 * @param saved - Browser-owned placements keyed by logical identity.
 * @returns Stable SVG dimensions and positions for every input node.
 */
export function layoutRuntimeGraph(nodes, edges, saved = {}) {
    const ordered = [...nodes].sort((a, b) => (a.logicalKey.localeCompare(b.logicalKey) || a.id.localeCompare(b.id)));
    const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length)));
    const rows = Math.max(1, Math.ceil(ordered.length / columns));
    const width = Math.max(760, PADDING * 2 + columns * 205);
    const height = Math.max(520, PADDING * 2 + rows * 190);
    const centerX = width / 2 - NODE_RADIUS;
    const centerY = height / 2 - NODE_RADIUS;
    const mutable = ordered.map((node, index) => {
        const restored = saved[node.logicalKey];
        if (restored !== undefined && Number.isFinite(restored.x) && Number.isFinite(restored.y)) {
            return { node, x: restored.x, y: restored.y, pinned: restored.pinned };
        }
        const hash = hashText(node.logicalKey);
        const angle = index * GOLDEN_ANGLE + (hash % 997) / 997;
        const radius = 42 * Math.sqrt(index + 1);
        return {
            node,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            pinned: false,
        };
    });
    const byNodeId = new Map(mutable.map((position, index) => [position.node.id, index]));
    const validEdges = edges.flatMap((edge) => {
        const source = byNodeId.get(edge.source);
        const target = byNodeId.get(edge.target);
        return source === undefined || target === undefined ? [] : [{ source, target }];
    });
    for (let step = 0; step < FORCE_STEPS; step += 1) {
        const force = mutable.map(() => ({ x: 0, y: 0 }));
        const alpha = 0.72 * (1 - step / FORCE_STEPS) + 0.03;
        for (let left = 0; left < mutable.length; left += 1) {
            for (let right = left + 1; right < mutable.length; right += 1) {
                const a = mutable[left];
                const b = mutable[right];
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                if (dx === 0 && dy === 0)
                    dx = ((hashText(`${a.node.logicalKey}:${b.node.logicalKey}`) % 17) + 1) / 10;
                const distanceSquared = Math.max(64, dx * dx + dy * dy);
                const distance = Math.sqrt(distanceSquared);
                const repulsion = Math.min(18, 58_000 / distanceSquared);
                const collision = distance < NODE_SIZE + NODE_GAP
                    ? (NODE_SIZE + NODE_GAP - distance) * 0.16
                    : 0;
                const push = repulsion + collision;
                const fx = dx / distance * push;
                const fy = dy / distance * push;
                force[left].x -= fx;
                force[left].y -= fy;
                force[right].x += fx;
                force[right].y += fy;
            }
        }
        for (const edge of validEdges) {
            const source = mutable[edge.source];
            const target = mutable[edge.target];
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.max(1, Math.hypot(dx, dy));
            const pull = (distance - IDEAL_EDGE_LENGTH) * 0.018;
            const fx = dx / distance * pull;
            const fy = dy / distance * pull;
            force[edge.source].x += fx;
            force[edge.source].y += fy;
            force[edge.target].x -= fx;
            force[edge.target].y -= fy;
        }
        for (const [index, position] of mutable.entries()) {
            if (position.pinned)
                continue;
            force[index].x += (centerX - position.x) * 0.0025;
            force[index].y += (centerY - position.y) * 0.0025;
            position.x += force[index].x * alpha;
            position.y += force[index].y * alpha;
            clampPosition(position, width, height);
        }
    }
    resolveNodeCollisions(mutable, width, height);
    const positions = mutable.map(({ node, x, y }) => ({ node, x, y }));
    return { width, height, positions, byId: new Map(positions.map(position => [position.node.id, position])) };
}
/**
 * Collapse detailed Loader Fiber phases into the four product-facing states.
 * @param phase - Detailed phase projected by the Host, or null without a live Fiber.
 * @returns Stable lifecycle status used by graph cards, nodes, and filters.
 */
export function runtimeLifecycleStatus(phase) {
    switch (phase) {
        case 'pending':
        case 'loading': return 'pending';
        case 'active': return 'active';
        case 'failed': return 'failed';
        case 'unloading':
        case null: return 'disposed';
    }
}
/**
 * Count the complete Loader projection by product-facing lifecycle state.
 * @param nodes - Unfiltered runtime nodes from the latest Host snapshot.
 * @returns Stable totals for the graph overview cards.
 */
export function summarizeRuntimeGraph(nodes) {
    let pending = 0;
    let active = 0;
    let disposed = 0;
    let failed = 0;
    for (const node of nodes) {
        switch (runtimeLifecycleStatus(node.phase)) {
            case 'pending':
                pending += 1;
                break;
            case 'active':
                active += 1;
                break;
            case 'disposed':
                disposed += 1;
                break;
            case 'failed':
                failed += 1;
                break;
        }
    }
    return { pending, active, disposed, failed };
}
/** Width reserved for every circular runtime graph node. */
export const RUNTIME_NODE_WIDTH = NODE_SIZE;
/** Height reserved for every circular runtime graph node. */
export const RUNTIME_NODE_HEIGHT = NODE_SIZE;
/** Radius of the circular runtime graph node. */
export const RUNTIME_NODE_RADIUS = NODE_RADIUS;
//# sourceMappingURL=graph.js.map
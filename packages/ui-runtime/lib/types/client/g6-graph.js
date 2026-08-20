/** Pure G6 projection and update policy for the Runtime Explorer graph canvas. */
import { runtimeLifecycleStatus } from "./graph.js";
const MIN_PLUGIN_SIZE = 76;
const MAX_PLUGIN_SIZE = 108;
const MISSING_SERVICE_SIZE = 58;
export const RUNTIME_G6_COLLISION_GAP = 24;
/**
 * Infer a stable, explainable visual category from DSH package conventions.
 * The fallback deliberately stays neutral for third-party plugins.
 */
export function runtimeG6NodeCategory(moduleName, label) {
    const name = `${moduleName} ${label}`.toLowerCase();
    const short = label.toLowerCase();
    if (name.includes('cordis') || ['runtime', 'loader', 'app-boot', 'boot'].includes(short))
        return 'core';
    if (/^(session|memory|persistence|projection|spill|title)(-|$)/.test(short))
        return 'session';
    if (/^(agent|persona|goal|plan|permission|repeat-tool)(-|$)/.test(short))
        return 'agent';
    if (/^(llm|model|token)(-|$)/.test(short))
        return 'model';
    if (/^(tool|tools|sandbox|attachment|code-runtime|deliverables|modules)(-|$)/.test(short))
        return 'tool';
    if (/^(ui|client|web|cmdline|settings|terminal|api-remotes|apiproxy)(-|$)/.test(short))
        return 'interface';
    return 'extension';
}
/** Keep the exact plugin name while preferring semantic line breaks inside circles. */
export function runtimeG6DisplayLabel(label) {
    if (label.length <= 12 || !label.includes('-'))
        return label;
    const parts = label.split('-').filter(Boolean);
    if (parts.length < 2)
        return label;
    const tokens = parts.map((part, index) => index === parts.length - 1 ? part : `${part}-`);
    const lines = [];
    let current = '';
    for (const token of tokens) {
        const candidate = `${current}${token}`;
        if (current !== '' && candidate.length > 13 && lines.length < 2) {
            lines.push(current);
            current = token;
        }
        else {
            current = candidate;
        }
    }
    if (current !== '')
        lines.push(current);
    return lines.join('\n');
}
/** Scale hubs without allowing high-degree plugins to dominate the canvas. */
export function runtimeG6NodeSize(degree, selected = false, label = '') {
    const labelBoost = Math.min(18, Math.max(0, label.length - 8));
    const size = MIN_PLUGIN_SIZE + labelBoost + Math.round(Math.sqrt(Math.max(0, degree)) * 5) + (selected ? 6 : 0);
    return Math.min(MAX_PLUGIN_SIZE, size);
}
/** Collision radius passed to G6, including label-safe whitespace around each circle. */
export function runtimeG6CollisionRadius(size) {
    return Math.max(0, size) / 2 + RUNTIME_G6_COLLISION_GAP;
}
/** Safely read the metadata placed on a G6 node datum by this adapter. */
export function runtimeG6NodeMetadata(node) {
    return node.data;
}
/** Safely read the metadata placed on a G6 edge datum by this adapter. */
export function runtimeG6EdgeMetadata(edge) {
    return edge.data;
}
/**
 * Project the Host graph into G6 data while keeping product state out of the renderer.
 * Missing Cordis providers become explicit satellite nodes only around the selected plugin.
 */
export function buildRuntimeG6Data(nodes, edges, relations, selectedId, savedPositions) {
    const degree = new Map();
    const nodeIds = new Set(nodes.map(node => node.id));
    const validEdges = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
    for (const edge of validEdges) {
        degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
        degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
    }
    const projectedNodes = nodes.map((node) => {
        const saved = savedPositions[node.logicalKey];
        const size = runtimeG6NodeSize(degree.get(node.id) ?? 0, node.id === selectedId, node.label);
        const relation = relations.nodes.get(node.id);
        const metadata = {
            kind: 'plugin',
            label: node.label,
            logicalKey: node.logicalKey,
            moduleName: node.moduleName,
            phase: runtimeLifecycleStatus(node.phase),
            category: runtimeG6NodeCategory(node.moduleName, node.label),
            ...(relation === undefined ? {} : { relation }),
            size,
            pinned: saved?.pinned === true,
            provides: [...node.provides],
            injects: [...node.injects],
            missing: [...node.missing],
            effectCount: node.effectCount,
        };
        return {
            id: node.id,
            size,
            data: metadata,
            ...(saved === undefined ? {} : { style: { x: saved.x, y: saved.y } }),
            states: node.id === selectedId ? ['selected'] : [],
        };
    });
    const projectedEdges = validEdges.map((edge) => {
        const relation = relations.edges.get(`${edge.source}:${edge.target}`);
        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            data: {
                kind: 'injects',
                ...(relation === undefined ? {} : { relation }),
                services: [...edge.services],
            },
        };
    });
    const selected = selectedId === undefined ? undefined : nodes.find(node => node.id === selectedId);
    for (const [index, service] of (selected?.missing ?? []).entries()) {
        const id = `missing:${selectedId}:${service}`;
        projectedNodes.push({
            id,
            size: MISSING_SERVICE_SIZE,
            data: {
                kind: 'missing-service',
                label: service,
                phase: 'missing',
                category: 'missing',
                relation: 'dependency',
                size: MISSING_SERVICE_SIZE,
                pinned: false,
                provides: [],
                injects: [],
                missing: [service],
                effectCount: 0,
                service,
                order: index,
            },
        });
        projectedEdges.push({
            id: `missing-edge:${selectedId}:${service}`,
            source: selectedId,
            target: id,
            data: {
                kind: 'missing',
                relation: 'dependency',
                services: [service],
            },
        });
    }
    return { nodes: projectedNodes, edges: projectedEdges };
}
/** Topology identity used to distinguish live status refreshes from structural changes. */
export function runtimeG6TopologyKey(data) {
    const nodes = data.nodes.map(node => String(node.id)).sort();
    const edges = data.edges.map(edge => `${String(edge.id)}:${edge.source}>${edge.target}`).sort();
    return `${nodes.join('|')}::${edges.join('|')}`;
}
function preserveRuntimeG6Positions(graph, data) {
    if (graph.getElementPosition === undefined)
        return data;
    return {
        ...data,
        nodes: data.nodes.map((node) => {
            const position = graph.getElementPosition?.(String(node.id));
            const x = position?.[0];
            const y = position?.[1];
            if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y))
                return node;
            return { ...node, style: { ...node.style, x, y } };
        }),
    };
}
/**
 * Structural changes run layout; lifecycle-only refreshes draw in place so the viewport never jumps.
 */
export async function syncRuntimeG6Data(graph, data, previousTopology) {
    const topology = runtimeG6TopologyKey(data);
    if (topology !== previousTopology) {
        graph.setData(data);
        await graph.render();
        return 'render';
    }
    graph.setData(preserveRuntimeG6Positions(graph, data));
    await graph.draw();
    return 'draw';
}
//# sourceMappingURL=g6-graph.js.map
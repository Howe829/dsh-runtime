/** Runtime boundary so tests can replace G6 without creating unsupported plugin chunks. */
import { Graph } from '@antv/g6';
export async function loadG6() {
    return { Graph };
}
//# sourceMappingURL=g6-runtime.js.map
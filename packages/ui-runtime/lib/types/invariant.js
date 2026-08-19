/** Package-owned invariant companion. @module @deepseek-ai/dsh-client-ui-runtime/invariant */
const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-runtime';
/** Cordis companion plugin name. */
export const name = 'client-ui-runtime-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/** No runtime invariant: the slot framework owns registration and store lifetimes. */
const install = () => { };
/** Register this package's invariant companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
/* jscpd:ignore-end */
//# sourceMappingURL=invariant.js.map
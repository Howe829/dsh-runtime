//#region lib/types/invariant.js
/** Package-owned invariant companion. @module @deepseek-ai/dsh-runtime/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-runtime";
/** Cordis companion plugin name. */
const name = "runtime-explorer-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** No runtime invariant: snapshots are read-only projections and trace payloads are structurally excluded. */
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };

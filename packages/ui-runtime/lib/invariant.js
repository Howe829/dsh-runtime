//#region lib/types/invariant.js
/** Package-owned invariant companion. @module @deepseek-ai/dsh-client-ui-runtime/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-runtime";
/** Cordis companion plugin name. */
const name = "client-ui-runtime-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** No runtime invariant: the slot framework owns registration and store lifetimes. */
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };

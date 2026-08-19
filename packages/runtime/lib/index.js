import z from "@deepseek-ai/schemastery";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/index.js
/** Read-only Cordis runtime graph and privacy-safe session event trace. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
const DEFAULT_TRACE_LIMIT = 256;
const DEFAULT_EFFECT_LIMIT = 12;
const DEFAULT_REFRESH_INTERVAL_MS = 1500;
/** Runtime mirror: FiberState is a cross-package const enum. */
const FIBER_STATE = {
	PENDING: 0,
	LOADING: 1,
	ACTIVE: 2,
	FAILED: 3,
	DISPOSED: 4,
	UNLOADING: 5
};
/** Complete public projection of Cordis Fiber states. */
const FIBER_PHASE = {
	[FIBER_STATE.PENDING]: "pending",
	[FIBER_STATE.LOADING]: "loading",
	[FIBER_STATE.ACTIVE]: "active",
	[FIBER_STATE.FAILED]: "failed",
	[FIBER_STATE.DISPOSED]: null,
	[FIBER_STATE.UNLOADING]: "unloading"
};
function shortLabel(moduleName) {
	const slash = moduleName.lastIndexOf("/");
	return (slash < 0 ? moduleName : moduleName.slice(slash + 1)).replace(/^dsh-(?:client-ui-|client-|host-)?/, "");
}
function entryNodeId(entryId) {
	return `entry:${entryId}`;
}
function owningEntryId(fiber) {
	let current = fiber;
	while (true) {
		if (current.entry !== void 0) return current.entry.id;
		const parent = current.parent.fiber;
		if (parent === current) return void 0;
		current = parent;
	}
}
function liveImplementations(ctx) {
	const store = ctx.reflect.store;
	return Object.getOwnPropertySymbols(store).map((key) => store[key]).filter((impl) => impl !== void 0);
}
function effectLabels(effects) {
	return effects.flatMap((effect) => [effect.label, ...effectLabels(effect.children)]);
}
/**
* Build one dependency graph from the current Loader and service stores.
* @param ctx - Cordis context that owns Loader, Fiber, and service state.
* @param effectLimit - Maximum effect labels retained on each projected node.
* @returns A point-in-time graph containing non-group Loader entries and service-derived edges.
*/
function projectRuntimeGraph(ctx, effectLimit) {
	const implementations = liveImplementations(ctx);
	const providerByService = new Map(implementations.map((impl) => [impl.name, owningEntryId(impl.fiber)]));
	const providedByEntry = /* @__PURE__ */ new Map();
	for (const impl of implementations) {
		const entryId = owningEntryId(impl.fiber);
		if (entryId === void 0) continue;
		const services = providedByEntry.get(entryId) ?? [];
		services.push(impl.name);
		providedByEntry.set(entryId, services);
	}
	const nodes = [];
	const edgeServices = /* @__PURE__ */ new Map();
	for (const entry of ctx.loader.entries()) {
		if (entry.options.group) continue;
		const fiber = entry.fiber;
		const injects = fiber === void 0 ? [] : Object.keys(fiber.inject);
		const source = entryNodeId(entry.id);
		const missing = [];
		for (const service of injects) {
			const providerEntry = providerByService.get(service);
			if (providerEntry === void 0) {
				missing.push(service);
				continue;
			}
			const target = entryNodeId(providerEntry);
			if (target === source) continue;
			const key = `${source}\u0000${target}`;
			const edge = edgeServices.get(key) ?? {
				source,
				target,
				services: []
			};
			edge.services.push(service);
			edgeServices.set(key, edge);
		}
		const effects = fiber === void 0 ? [] : effectLabels(fiber.getEffects());
		nodes.push({
			id: source,
			entryId: entry.id,
			moduleName: entry.options.name,
			label: shortLabel(entry.options.name),
			enabled: !entry.disabled,
			phase: fiber === void 0 ? null : FIBER_PHASE[fiber.state],
			provides: [...providedByEntry.get(entry.id) ?? []].sort(),
			injects,
			missing,
			effects: effects.slice(0, effectLimit),
			effectCount: effects.length
		});
	}
	return {
		nodes,
		edges: [...edgeServices.values()].map((edge) => ({
			source: edge.source,
			target: edge.target,
			services: edge.services.sort()
		}))
	};
}
function traceLane(type) {
	if (type === "user/message") return "user";
	if (type.startsWith("assistant/") || type.startsWith("request/")) return "llm";
	if (type.startsWith("tool/")) return "tool";
	if (type.startsWith("turn/") || type.startsWith("step/")) return "agent";
	return "session";
}
/**
* Project one event without retaining model-visible or tool payload content.
* @param session - Session that owns the event sequence.
* @param event - Session event whose safe correlation metadata is projected.
* @returns A trace row that contains no prompt, model output, tool arguments, or tool result content.
*/
function projectTraceEvent(session, event) {
	const common = {
		id: `${session.id}:${event.seq}`,
		sessionId: String(session.id),
		type: event.type,
		seq: event.seq,
		time: event.time,
		lane: traceLane(event.type),
		payloadChars: JSON.stringify(event.data).length
	};
	switch (event.type) {
		case "turn/start": return {
			...common,
			turn: event.data.turn
		};
		case "turn/end": return {
			...common,
			turn: event.data.turn,
			outcome: event.data.reason.kind
		};
		case "step/start":
		case "step/end":
		case "assistant/chunk":
		case "assistant/message": return {
			...common,
			turn: event.data.turn,
			step: event.data.step
		};
		case "tool/call": return {
			...common,
			turn: event.data.turn,
			step: event.data.step,
			callId: String(event.data.callId),
			name: event.data.name
		};
		case "tool/result": return {
			...common,
			turn: event.data.turn,
			step: event.data.step,
			callId: String(event.data.message.source.callId),
			outcome: event.data.message.content[0].isError ? "error" : "success"
		};
		default: return common;
	}
}
/** Remote gateway backing the dsh-runtime browser plugin. */
let RuntimeExplorerGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _snapshot_decorators;
	return class RuntimeExplorerGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_snapshot_decorators = [Remote("snapshot")];
			__esDecorate(this, null, _snapshot_decorators, {
				kind: "method",
				name: "snapshot",
				static: false,
				private: false,
				access: {
					has: (obj) => "snapshot" in obj,
					get: (obj) => obj.snapshot
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["loader"];
		static Config = z.object({
			traceLimit: z.natural().min(1).default(DEFAULT_TRACE_LIMIT),
			effectLimit: z.natural().default(DEFAULT_EFFECT_LIMIT),
			refreshIntervalMs: z.natural().min(250).default(DEFAULT_REFRESH_INTERVAL_MS)
		});
		resolved = __runInitializers(this, _instanceExtraInitializers);
		trace = [];
		constructor(ctx, config) {
			super(ctx, "runtimeExplorer");
			this.resolved = config;
			ctx.on("session/event", (session, event) => {
				this.trace.push(projectTraceEvent(session, event));
				const overflow = this.trace.length - this.resolved.traceLimit;
				if (overflow > 0) this.trace.splice(0, overflow);
			});
		}
		/**
		* Read live Loader state and the bounded event-metadata window.
		* @returns A point-in-time graph and trace containing no message, model-output, tool-argument, or tool-result content.
		*/
		snapshot() {
			return {
				profile: this.ctx.get("launchProfile")?.get() ?? null,
				observedAt: Date.now(),
				refreshIntervalMs: this.resolved.refreshIntervalMs,
				graph: projectRuntimeGraph(this.ctx, this.resolved.effectLimit),
				trace: [...this.trace]
			};
		}
	};
})();
//#endregion
export { RuntimeExplorerGateway, RuntimeExplorerGateway as default, projectRuntimeGraph, projectTraceEvent };

window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-runtime",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		react = __toESM(react, 1);
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region lib/types/client/locales.js
		/** Product copy for dsh-runtime. */
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			open: "dsh-runtime",
			title: "dsh-runtime",
			subtitle: "Runtime Explorer",
			live: "实时",
			profile: "Profile",
			currentProfile: "当前 Profile",
			unavailable: "不可用",
			updated: "刚刚更新",
			graphTab: "运行时图",
			traceTab: "请求追踪",
			searchGraph: "搜索插件或服务",
			searchTrace: "搜索会话、Turn 或工具",
			searchTurnTrace: "搜索当前 Turn 的事件或工具",
			allStates: "全部状态",
			pending: "等待中",
			active: "活跃",
			disposed: "已释放",
			failed: "失败",
			refresh: "刷新",
			close: "关闭 dsh-runtime",
			closeInspector: "关闭详情",
			graphLabel: "运行时插件依赖图",
			panCanvas: "拖动运行时图",
			pluginSummary: "插件状态总览",
			focusedNode: "聚焦节点",
			relatedPlugins: "关联插件",
			dependencyDirection: "依赖方向",
			dependencies: "它依赖",
			dependants: "依赖它",
			showAll: "显示全部",
			zoomControls: "运行图缩放",
			zoomOut: "缩小",
			zoomIn: "放大",
			fitView: "适配视图",
			resetZoom: "重置",
			zoomLevel: "当前缩放比例",
			time: "时间",
			loadingSnapshot: "正在读取运行时快照…",
			loadFailed: "暂时无法读取运行时快照。",
			retry: "重试",
			emptyGraph: "没有匹配的插件。",
			emptyTurns: "还没有 Agent Turn。发起一次 Agent 请求后，这里会按会话显示追踪记录。",
			emptyTrace: "没有匹配的 Agent Turn。",
			emptyTurnTrace: "当前 Turn 中没有匹配的事件。",
			selectedPlugin: "所选插件",
			selectedEvent: "所选事件",
			module: "模块",
			entry: "Loader 条目",
			status: "状态",
			provides: "提供服务",
			injects: "注入服务",
			missing: "缺失依赖",
			effects: "Effects",
			noItems: "无",
			session: "会话",
			event: "事件",
			sequence: "序号",
			payload: "Payload 字符数",
			turn: "Turn",
			turns: "个 Turn",
			agentTurns: "Agent Turn",
			runningTurns: "运行中",
			traceSummary: "Agent Turn 总览",
			backToTurns: "返回 Turn 列表",
			turnRunning: "运行中",
			turnCompleted: "已完成",
			turnFailed: "失败",
			turnStopped: "已停止",
			turnIncomplete: "数据不完整",
			duration: "耗时",
			events: "事件",
			steps: "Step",
			toolCalls: "工具调用",
			sessions: "会话",
			sessionEvents: "会话级事件",
			step: "Step",
			callId: "Call ID",
			tool: "工具",
			outcome: "结果",
			privacy: "仅显示元数据，不读取提示词、模型输出、工具参数或结果内容。",
			laneUser: "用户输入",
			laneAgent: "Agent Loop",
			laneLlm: "LLM",
			laneTool: "工具",
			laneSession: "会话日志"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			open: "dsh-runtime",
			title: "dsh-runtime",
			subtitle: "Runtime Explorer",
			live: "Live",
			profile: "Profile",
			currentProfile: "Current profile",
			unavailable: "Unavailable",
			updated: "Updated just now",
			graphTab: "Runtime Graph",
			traceTab: "Request Trace",
			searchGraph: "Search plugins or services",
			searchTrace: "Search sessions, Turns, or tools",
			searchTurnTrace: "Search events or tools in this Turn",
			allStates: "All states",
			pending: "PENDING",
			active: "ACTIVE",
			disposed: "DISPOSED",
			failed: "FAILED",
			refresh: "Refresh",
			close: "Close dsh-runtime",
			closeInspector: "Close details",
			graphLabel: "Runtime dependency graph",
			panCanvas: "Pan runtime graph",
			pluginSummary: "Plugin status overview",
			focusedNode: "Focused node",
			relatedPlugins: "Related plugins",
			dependencyDirection: "Dependency direction",
			dependencies: "Depends on",
			dependants: "Used by",
			showAll: "Show all",
			zoomControls: "Runtime graph zoom",
			zoomOut: "Zoom out",
			zoomIn: "Zoom in",
			fitView: "Fit view",
			resetZoom: "Reset",
			zoomLevel: "Current zoom level",
			time: "Time",
			loadingSnapshot: "Reading runtime snapshot…",
			loadFailed: "The runtime snapshot is temporarily unavailable.",
			retry: "Retry",
			emptyGraph: "No matching plugins.",
			emptyTurns: "No Agent Turns yet. Start an Agent request to see its Session trace here.",
			emptyTrace: "No matching Agent Turns.",
			emptyTurnTrace: "No matching events in this Turn.",
			selectedPlugin: "Selected plugin",
			selectedEvent: "Selected event",
			module: "Module",
			entry: "Loader entry",
			status: "Status",
			provides: "Provides",
			injects: "Injects",
			missing: "Missing",
			effects: "Effects",
			noItems: "None",
			session: "Session",
			event: "Event",
			sequence: "Sequence",
			payload: "Payload characters",
			turn: "Turn",
			turns: "Turns",
			agentTurns: "Agent Turns",
			runningTurns: "Running",
			traceSummary: "Agent Turn overview",
			backToTurns: "Back to Turns",
			turnRunning: "RUNNING",
			turnCompleted: "COMPLETED",
			turnFailed: "FAILED",
			turnStopped: "STOPPED",
			turnIncomplete: "INCOMPLETE",
			duration: "Duration",
			events: "Events",
			steps: "Steps",
			toolCalls: "Tool calls",
			sessions: "Sessions",
			sessionEvents: "Session events",
			step: "Step",
			callId: "Call ID",
			tool: "Tool",
			outcome: "Outcome",
			privacy: "Metadata only. Prompts, model output, tool arguments, and result content are never read.",
			laneUser: "User input",
			laneAgent: "Agent Loop",
			laneLlm: "LLM",
			laneTool: "Tools",
			laneSession: "Session log"
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:packages/client/ui-runtime/src/client/RuntimeExplorer.module.css.mjs
		const css = ".N45fHq_sidebarAction{flex:none;width:100%;height:42px;margin-top:8px;display:flex}.N45fHq_sidebarButton{width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border:none;border-radius:12px;align-items:center;gap:8px;margin:0 -2px;padding:0 10px 0 8px;display:flex}.N45fHq_sidebarButton:hover,.N45fHq_sidebarButton[data-active]{background:var(--dsw-alias-interactive-bg-hover)}.N45fHq_sidebarButton span{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.N45fHq_liveDot{background:var(--dsw-alias-state-success-primary);width:7px;height:7px;box-shadow:0 0 8px var(--dsw-alias-state-success-secondary);border-radius:50%;flex:none;margin-left:auto}.N45fHq_sidebarRail{width:36px;height:36px;margin:0}.N45fHq_sidebarRail .N45fHq_sidebarButton{border-radius:50%;justify-content:center;width:36px;height:36px;margin:0;padding:0}.N45fHq_surface{z-index:21;background:var(--dsw-alias-bg-base);min-width:0;color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv2);flex-direction:column;display:flex;position:fixed;top:0;bottom:0;right:0;overflow:hidden}.N45fHq_header{border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex:none;align-items:center;gap:12px;min-height:76px;padding:0 24px;display:flex}.N45fHq_brandIcon,.N45fHq_inspectorIcon,.N45fHq_nodeIcon{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-state-business-tertiary);color:var(--dsw-alias-state-business-primary);flex:none;justify-content:center;align-items:center;display:inline-flex}.N45fHq_brandIcon{border-radius:11px;width:38px;height:38px}.N45fHq_heading{min-width:0}.N45fHq_heading h1,.N45fHq_heading p{margin:0}.N45fHq_heading h1{font-size:18px;font-weight:500;line-height:24px}.N45fHq_heading p{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px}.N45fHq_liveBadge{border:1px solid var(--dsw-alias-state-success-secondary);background:var(--dsw-alias-state-success-tertiary);height:24px;color:var(--dsw-alias-state-success-primary);text-transform:uppercase;letter-spacing:.08em;border-radius:999px;align-items:center;gap:6px;padding:0 9px;font-size:11px;line-height:22px;display:inline-flex}.N45fHq_liveBadge i{background:currentColor;border-radius:50%;width:7px;height:7px}.N45fHq_profileBadge{border:1px solid var(--dsw-alias-divider-primary);background:var(--dsw-alias-bg-layer-2);height:24px;color:var(--dsw-alias-label-tertiary);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;border-radius:7px;align-items:center;gap:7px;padding:0 9px;font-size:10px;line-height:22px;display:inline-flex}.N45fHq_profileBadge code{color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-mono);letter-spacing:0;text-transform:none;font-size:11px}.N45fHq_updated{color:var(--dsw-alias-label-quaternary);white-space:nowrap;margin-left:auto;font-size:12px}.N45fHq_iconButton,.N45fHq_inspectorClose{width:32px;height:32px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;padding:0;display:inline-flex}.N45fHq_iconButton:hover,.N45fHq_inspectorClose:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.N45fHq_toolbar{border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex:none;align-items:center;gap:12px;min-height:64px;padding:0 20px;display:flex}.N45fHq_tabs{align-self:stretch;gap:4px;display:flex}.N45fHq_tabs button{min-width:128px;color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:none;align-items:center;gap:7px;padding:0 18px;font-size:13px;display:inline-flex;position:relative}.N45fHq_tabs button:hover,.N45fHq_tabs button[data-active]{color:var(--dsw-alias-label-primary)}.N45fHq_tabs button[data-active]:after{content:\"\";background:var(--dsw-alias-brand-primary);border-radius:2px 2px 0 0;height:2px;position:absolute;bottom:-1px;left:0;right:0}.N45fHq_search{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);max-width:380px;height:38px;color:var(--dsw-alias-label-quaternary);border-radius:10px;flex:1;align-items:center;gap:8px;padding:0 12px;display:flex}.N45fHq_search:focus-within{border-color:var(--dsw-alias-state-business-primary)}.N45fHq_search input{width:100%;min-width:0;color:var(--dsw-alias-label-primary);font:inherit;background:0 0;border:none;outline:none;font-size:13px}.N45fHq_search input::placeholder{color:var(--dsw-alias-label-quaternary)}.N45fHq_phaseFilter{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);height:38px;color:var(--dsw-alias-label-secondary);font:inherit;border-radius:10px;flex:none;padding:0 32px 0 12px;font-size:13px}.N45fHq_body{flex:1;grid-template-columns:minmax(0,1fr);min-height:0;display:grid}.N45fHq_body.N45fHq_withInspector{grid-template-columns:minmax(0,1fr) 316px}.N45fHq_canvas{background-color:var(--dsw-alias-bg-base);background-image:radial-gradient(var(--dsw-alias-border-subtle) 1px, transparent 1px);background-size:24px 24px;min-width:0;min-height:0;overflow:hidden}.N45fHq_graphView{flex-direction:column;width:100%;height:100%;display:flex;position:relative}.N45fHq_graphSummary{z-index:3;border-bottom:1px solid var(--dsw-alias-border-l1);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 94%, transparent);backdrop-filter:blur(12px);flex:none;grid-template-columns:repeat(4,minmax(112px,1fr));gap:10px;margin:0;padding:14px 18px;display:grid}.N45fHq_graphSummary>div{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;min-width:0;padding:10px 12px}.N45fHq_graphSummary dt,.N45fHq_graphSummary dd{margin:0}.N45fHq_graphSummary dt{color:var(--dsw-alias-label-quaternary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:15px;overflow:hidden}.N45fHq_graphSummary dd{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;margin-top:2px;font-size:19px;font-weight:500;line-height:25px}.N45fHq_graphSummary [data-state=active] dd{color:var(--dsw-alias-state-success-primary)}.N45fHq_graphSummary [data-state=pending] dd{color:var(--dsw-alias-state-warn-primary)}.N45fHq_graphSummary [data-state=disposed] dd{color:var(--dsw-alias-label-tertiary)}.N45fHq_graphSummary [data-state=failed] dd{color:var(--dsw-alias-state-error-primary)}.N45fHq_focusBar{z-index:3;border-bottom:1px solid var(--dsw-alias-border-l1);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 94%, transparent);min-height:44px;color:var(--dsw-alias-label-tertiary);flex:none;align-items:center;gap:16px;padding:7px 18px;font-size:11px;display:flex}.N45fHq_focusIdentity,.N45fHq_focusCount,.N45fHq_relationLegend,.N45fHq_relationLegend span{align-items:center;display:inline-flex}.N45fHq_focusIdentity{gap:7px;min-width:0}.N45fHq_focusIdentity strong{max-width:180px;color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;overflow:hidden}.N45fHq_focusCount{white-space:nowrap;gap:4px}.N45fHq_focusCount strong{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;font-weight:500}.N45fHq_relationLegend{white-space:nowrap;gap:12px;margin-left:auto}.N45fHq_relationLegend span{gap:6px}.N45fHq_relationLegend i{background:var(--dsw-alias-border-l3);border-radius:2px;width:14px;height:2px}.N45fHq_relationLegend [data-relation=dependency] i{background:var(--dsw-alias-state-business-primary)}.N45fHq_relationLegend [data-relation=dependant] i{background:var(--dsw-alias-state-warn-primary)}.N45fHq_showAll{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);height:28px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:8px;flex:none;padding:0 10px;font-size:11px}.N45fHq_showAll:hover{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}.N45fHq_graphScroller,.N45fHq_traceScroller{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);width:100%;height:100%;overflow:auto}.N45fHq_graphScroller{cursor:grab;touch-action:none;flex:1;min-height:0}.N45fHq_graphScroller[data-panning]{cursor:grabbing}.N45fHq_graphScroller[data-panning] .N45fHq_graphStage{user-select:none}.N45fHq_graphStage{min-width:100%;min-height:100%}.N45fHq_graph{transform-origin:0 0;display:block}.N45fHq_zoomControls{z-index:4;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv2);border-radius:10px;align-items:center;display:flex;position:absolute;bottom:20px;right:20px;overflow:hidden}.N45fHq_zoomControls button,.N45fHq_zoomControls output{border:none;border-right:1px solid var(--dsw-alias-border-l2);height:34px;color:var(--dsw-alias-label-secondary);font:inherit;background:0 0;justify-content:center;align-items:center;font-size:11px;line-height:16px;display:inline-flex}.N45fHq_zoomControls button{cursor:pointer;min-width:46px;padding:0 10px}.N45fHq_zoomControls button:last-child{border-right:none}.N45fHq_zoomControls button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.N45fHq_zoomControls button:disabled{color:var(--dsw-alias-label-quaternary);opacity:.5;cursor:default}.N45fHq_zoomControls output{width:48px;color:var(--dsw-alias-label-quaternary);font-family:var(--dsw-font-mono);font-variant-numeric:tabular-nums}.N45fHq_edges path{fill:none;stroke:var(--dsw-alias-border-l3);stroke-width:1.2px}.N45fHq_edges path[data-relation=dependency]{stroke:var(--dsw-alias-state-business-primary);stroke-width:1.8px;opacity:.85}.N45fHq_edges path[data-relation=dependant]{stroke:var(--dsw-alias-state-warn-primary);stroke-width:1.8px;opacity:.78}.N45fHq_edges path[data-relation=both]{stroke:var(--dsw-alias-label-tertiary);stroke-width:1.6px;opacity:.7}.N45fHq_edges path[data-relation=related]{opacity:.32}.N45fHq_graphNode{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);width:100%;height:100%;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;box-shadow:var(--dsw-shadow-lv1);cursor:pointer;border-radius:12px;align-items:center;gap:12px;padding:12px 14px;display:flex}.N45fHq_graphNode:hover{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-3)}.N45fHq_graphNode[data-selected]{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary)}.N45fHq_graphNode[data-relation=dependency]:not([data-selected]){border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, var(--dsw-alias-border-l2))}.N45fHq_graphNode[data-relation=dependant]:not([data-selected]){border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 55%, var(--dsw-alias-border-l2))}.N45fHq_graphNode:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.N45fHq_nodeIcon{border-radius:9px;width:34px;height:34px}.N45fHq_nodeCopy{flex-direction:column;min-width:0;display:flex}.N45fHq_nodeCopy strong{text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:19px;overflow:hidden}.N45fHq_nodeCopy small{color:var(--dsw-alias-label-quaternary);text-transform:uppercase;letter-spacing:.06em;align-items:center;gap:6px;font-size:10px;line-height:16px;display:inline-flex}.N45fHq_nodeCopy small i{background:var(--dsw-alias-label-quaternary);border-radius:50%;width:6px;height:6px}.N45fHq_graphNode[data-phase=active] .N45fHq_nodeCopy small i{background:var(--dsw-alias-state-success-primary)}.N45fHq_graphNode[data-phase=pending] .N45fHq_nodeCopy small i{background:var(--dsw-alias-state-warn-primary)}.N45fHq_graphNode[data-phase=failed] .N45fHq_nodeCopy small i{background:var(--dsw-alias-state-error-primary)}.N45fHq_traceDirectory,.N45fHq_traceDetail{width:100%;height:100%}.N45fHq_traceDirectory{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);padding:18px 20px 32px;overflow-y:auto}.N45fHq_traceSummary{grid-template-columns:repeat(3,minmax(120px,1fr));gap:10px;max-width:960px;margin:0 auto 18px;display:grid}.N45fHq_traceSummary>div{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;min-width:0;padding:12px 14px}.N45fHq_traceSummary dt,.N45fHq_traceSummary dd{margin:0}.N45fHq_traceSummary dt{color:var(--dsw-alias-label-quaternary);font-size:10px;line-height:15px}.N45fHq_traceSummary dd{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;margin-top:3px;font-size:20px;font-weight:500;line-height:26px}.N45fHq_traceSessions{flex-direction:column;gap:14px;max-width:960px;margin:0 auto;display:flex}.N45fHq_traceSession{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv1);border-radius:12px;overflow:hidden}.N45fHq_traceSession>header{border-bottom:1px solid var(--dsw-alias-border-l1);justify-content:space-between;align-items:center;gap:16px;min-height:48px;padding:0 16px;display:flex}.N45fHq_traceSession>header div{align-items:center;gap:9px;min-width:0;display:flex}.N45fHq_traceSession>header span{color:var(--dsw-alias-label-quaternary);letter-spacing:.05em;text-transform:uppercase;font-size:10px}.N45fHq_traceSession>header code{color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-mono);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.N45fHq_traceSession>header small{color:var(--dsw-alias-label-quaternary);flex:none;font-size:10px;line-height:16px}.N45fHq_turnList{flex-direction:column;display:flex}.N45fHq_turnRow{border:none;border-bottom:1px solid var(--dsw-alias-border-subtle);min-height:72px;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;background:0 0;grid-template-columns:minmax(130px,.75fr) 100px minmax(320px,2fr) 20px;align-items:center;gap:16px;padding:10px 16px;display:grid}.N45fHq_turnRow:last-of-type{border-bottom:none}.N45fHq_turnRow:hover,.N45fHq_turnRow:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.N45fHq_turnRow:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}.N45fHq_turnRow>svg{color:var(--dsw-alias-label-quaternary)}.N45fHq_turnIdentity{flex-direction:column;min-width:0;display:flex}.N45fHq_turnIdentity strong,.N45fHq_traceDetailIdentity strong{font-size:13px;font-weight:500;line-height:19px}.N45fHq_turnIdentity time{color:var(--dsw-alias-label-quaternary);font-family:var(--dsw-font-mono);font-size:10px;line-height:16px}.N45fHq_turnStatus{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);min-height:22px;color:var(--dsw-alias-label-tertiary);letter-spacing:.05em;white-space:nowrap;border-radius:999px;justify-self:start;align-items:center;padding:0 8px;font-size:9px;line-height:20px;display:inline-flex}.N45fHq_turnStatus[data-status=running],.N45fHq_turnStatus[data-status=completed]{border-color:var(--dsw-alias-state-success-secondary);background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}.N45fHq_turnStatus[data-status=failed]{border-color:var(--dsw-alias-state-error-secondary);background:color-mix(in srgb, var(--dsw-alias-state-error-secondary) 12%, var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-state-error-primary)}.N45fHq_turnStatus[data-status=stopped]{border-color:var(--dsw-alias-state-warn-secondary);background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-primary)}.N45fHq_turnMetrics{grid-template-columns:repeat(4,minmax(60px,1fr));gap:12px;min-width:0;margin:0;display:grid}.N45fHq_turnMetrics div{min-width:0}.N45fHq_turnMetrics dt,.N45fHq_turnMetrics dd{text-overflow:ellipsis;white-space:nowrap;margin:0;overflow:hidden}.N45fHq_turnMetrics dt{color:var(--dsw-alias-label-quaternary);font-size:9px;line-height:14px}.N45fHq_turnMetrics dd{color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-mono);font-variant-numeric:tabular-nums;font-size:11px;line-height:17px}.N45fHq_sessionEvents{border-top:1px solid var(--dsw-alias-border-subtle);color:var(--dsw-alias-label-quaternary);margin:0;padding:9px 16px;font-size:10px;line-height:16px}.N45fHq_traceDetail{flex-direction:column;display:flex}.N45fHq_traceDetailHeader{z-index:3;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex:none;align-items:center;gap:16px;min-height:68px;padding:10px 16px;display:flex}.N45fHq_traceBack{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);height:32px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:8px;flex:none;align-items:center;gap:6px;padding:0 10px;font-size:11px;display:inline-flex}.N45fHq_traceBack:hover{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}.N45fHq_traceDetailIdentity{align-items:center;gap:8px;min-width:0;display:flex}.N45fHq_traceDetailIdentity code{max-width:150px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.N45fHq_traceDetailIdentity>span:not(.N45fHq_turnStatus){color:var(--dsw-alias-label-quaternary)}.N45fHq_traceDetailHeader>.N45fHq_turnMetrics{flex:1;max-width:360px;margin-left:auto}.N45fHq_traceDetail>.N45fHq_traceScroller{flex:1;min-height:0}.N45fHq_traceGrid{min-width:920px;padding-bottom:32px}.N45fHq_traceCorner,.N45fHq_traceLane{z-index:2;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);height:42px;color:var(--dsw-alias-label-quaternary);text-transform:uppercase;letter-spacing:.05em;align-items:center;font-size:11px;display:inline-flex;position:sticky;top:0}.N45fHq_traceCorner{width:90px;padding-left:16px}.N45fHq_traceLane{justify-content:center;width:calc(20% - 18px)}.N45fHq_traceRow{border-bottom:1px solid var(--dsw-alias-border-subtle);grid-template-columns:90px repeat(5,minmax(150px,1fr));align-items:center;min-height:68px;display:grid}.N45fHq_traceRow time{color:var(--dsw-alias-label-quaternary);font-family:var(--dsw-font-mono);padding-left:16px;font-size:10px}.N45fHq_traceEvent{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);min-width:0;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;border-radius:9px;flex-direction:column;margin:7px 8px;padding:8px 10px;display:flex}.N45fHq_traceEvent[data-lane=user]{grid-column:2}.N45fHq_traceEvent[data-lane=agent]{grid-column:3}.N45fHq_traceEvent[data-lane=llm]{grid-column:4}.N45fHq_traceEvent[data-lane=tool]{grid-column:5}.N45fHq_traceEvent[data-lane=session]{grid-column:6}.N45fHq_traceEvent:hover,.N45fHq_traceEvent[data-selected]{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary)}.N45fHq_traceEvent span,.N45fHq_traceEvent small{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.N45fHq_traceEvent span{font-family:var(--dsw-font-mono);font-size:11px;line-height:16px}.N45fHq_traceEvent small{color:var(--dsw-alias-label-quaternary);font-size:10px;line-height:15px}.N45fHq_inspector{border-left:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);min-width:0;padding:28px 22px;position:relative;overflow-y:auto}.N45fHq_inspectorClose{position:absolute;top:16px;right:14px}.N45fHq_inspectorTitle{align-items:center;gap:12px;padding-right:28px;display:flex}.N45fHq_inspectorIcon{border-radius:11px;width:40px;height:40px}.N45fHq_inspectorTitle div{flex-direction:column;min-width:0;display:flex}.N45fHq_inspectorTitle strong{text-overflow:ellipsis;white-space:nowrap;font-size:15px;font-weight:500;line-height:21px;overflow:hidden}.N45fHq_inspectorTitle small{color:var(--dsw-alias-label-quaternary);font-size:11px;line-height:17px}.N45fHq_metadata{flex-direction:column;gap:10px;margin:24px 0;display:flex}.N45fHq_metadata div{grid-template-columns:84px minmax(0,1fr);gap:8px;display:grid}.N45fHq_metadata dt,.N45fHq_metadata dd{margin:0;font-size:11px;line-height:17px}.N45fHq_metadata dt{color:var(--dsw-alias-label-quaternary)}.N45fHq_metadata dd{overflow-wrap:anywhere;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-mono)}.N45fHq_inspectorSection{border-top:1px solid var(--dsw-alias-border-subtle);padding:18px 0}.N45fHq_inspectorSection h3{color:var(--dsw-alias-label-tertiary);text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;font-size:11px;font-weight:500;line-height:16px}.N45fHq_inspectorSection h3 span{color:var(--dsw-alias-label-quaternary);margin-left:5px}.N45fHq_inspectorSection[data-warning] h3{color:var(--dsw-alias-state-warn-label)}.N45fHq_chips{flex-wrap:wrap;gap:6px;display:flex}.N45fHq_chips code{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);max-width:100%;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-mono);text-overflow:ellipsis;white-space:nowrap;border-radius:6px;padding:4px 7px;font-size:10px;line-height:15px;overflow:hidden}.N45fHq_emptyValue,.N45fHq_privacy{color:var(--dsw-alias-label-quaternary);font-size:11px;line-height:18px}.N45fHq_privacy{border:1px solid var(--dsw-alias-border-subtle);background:var(--dsw-alias-bg-layer-2);border-radius:9px;padding:12px}.N45fHq_emptyState{width:100%;height:100%;color:var(--dsw-alias-label-quaternary);flex-direction:column;justify-content:center;align-items:center;gap:12px;font-size:13px;display:flex}.N45fHq_emptyState p{margin:0}.N45fHq_emptyState button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-elevated-fill);height:32px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;padding:0 14px}@media (width<=900px){.N45fHq_updated{display:none}.N45fHq_body.N45fHq_withInspector{grid-template-columns:minmax(0,1fr) 280px}.N45fHq_toolbar{flex-wrap:wrap;padding-top:8px;padding-bottom:8px}.N45fHq_tabs{height:48px}.N45fHq_graphSummary{grid-template-columns:repeat(2,minmax(112px,1fr))}.N45fHq_turnRow{grid-template-columns:minmax(120px,.75fr) 90px minmax(280px,2fr) 20px}.N45fHq_traceDetailHeader{flex-wrap:wrap}.N45fHq_traceDetailHeader>.N45fHq_turnMetrics{flex-basis:100%;max-width:none;margin-left:0}}@media (prefers-reduced-motion:reduce){.N45fHq_surface,.N45fHq_graphNode,.N45fHq_traceEvent{transition:none}}";
		const tagId = "@deepseek-ai/dsh-client-ui-runtime/RuntimeExplorer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-runtime";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var RuntimeExplorer_module_css_default = {
			"body": "N45fHq_body",
			"brandIcon": "N45fHq_brandIcon",
			"canvas": "N45fHq_canvas",
			"chips": "N45fHq_chips",
			"edges": "N45fHq_edges",
			"emptyState": "N45fHq_emptyState",
			"emptyValue": "N45fHq_emptyValue",
			"focusBar": "N45fHq_focusBar",
			"focusCount": "N45fHq_focusCount",
			"focusIdentity": "N45fHq_focusIdentity",
			"graph": "N45fHq_graph",
			"graphNode": "N45fHq_graphNode",
			"graphScroller": "N45fHq_graphScroller",
			"graphStage": "N45fHq_graphStage",
			"graphSummary": "N45fHq_graphSummary",
			"graphView": "N45fHq_graphView",
			"header": "N45fHq_header",
			"heading": "N45fHq_heading",
			"iconButton": "N45fHq_iconButton",
			"inspector": "N45fHq_inspector",
			"inspectorClose": "N45fHq_inspectorClose",
			"inspectorIcon": "N45fHq_inspectorIcon",
			"inspectorSection": "N45fHq_inspectorSection",
			"inspectorTitle": "N45fHq_inspectorTitle",
			"liveBadge": "N45fHq_liveBadge",
			"liveDot": "N45fHq_liveDot",
			"metadata": "N45fHq_metadata",
			"nodeCopy": "N45fHq_nodeCopy",
			"nodeIcon": "N45fHq_nodeIcon",
			"phaseFilter": "N45fHq_phaseFilter",
			"privacy": "N45fHq_privacy",
			"profileBadge": "N45fHq_profileBadge",
			"relationLegend": "N45fHq_relationLegend",
			"search": "N45fHq_search",
			"sessionEvents": "N45fHq_sessionEvents",
			"showAll": "N45fHq_showAll",
			"sidebarAction": "N45fHq_sidebarAction",
			"sidebarButton": "N45fHq_sidebarButton",
			"sidebarRail": "N45fHq_sidebarRail",
			"surface": "N45fHq_surface",
			"tabs": "N45fHq_tabs",
			"toolbar": "N45fHq_toolbar",
			"traceBack": "N45fHq_traceBack",
			"traceCorner": "N45fHq_traceCorner",
			"traceDetail": "N45fHq_traceDetail",
			"traceDetailHeader": "N45fHq_traceDetailHeader",
			"traceDetailIdentity": "N45fHq_traceDetailIdentity",
			"traceDirectory": "N45fHq_traceDirectory",
			"traceEvent": "N45fHq_traceEvent",
			"traceGrid": "N45fHq_traceGrid",
			"traceLane": "N45fHq_traceLane",
			"traceRow": "N45fHq_traceRow",
			"traceScroller": "N45fHq_traceScroller",
			"traceSession": "N45fHq_traceSession",
			"traceSessions": "N45fHq_traceSessions",
			"traceSummary": "N45fHq_traceSummary",
			"turnIdentity": "N45fHq_turnIdentity",
			"turnList": "N45fHq_turnList",
			"turnMetrics": "N45fHq_turnMetrics",
			"turnRow": "N45fHq_turnRow",
			"turnStatus": "N45fHq_turnStatus",
			"updated": "N45fHq_updated",
			"withInspector": "N45fHq_withInspector",
			"zoomControls": "N45fHq_zoomControls"
		};
		//#endregion
		//#region lib/types/client/RuntimeAction.js
		/** Sidebar footer action that opens dsh-runtime without adding a floating button. */
		/** Render the sidebar row/rail entry and publish the measured sidebar edge. */
		function RuntimeAction({ wide, useStore, actions, onVisibilityChange, t }) {
			const open = useStore((state) => state.open);
			const root = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				const measure = () => {
					const rect = root.current.getBoundingClientRect();
					actions.setSidebarOffset(Math.round(rect.right + (wide ? 12 : 10)));
				};
				measure();
				window.addEventListener("resize", measure);
				return () => {
					window.removeEventListener("resize", measure);
				};
			}, [
				actions,
				open,
				wide
			]);
			const toggle = () => {
				const next = !open;
				actions.setOpen(next);
				onVisibilityChange(next);
			};
			return (0, react_jsx_runtime.jsx)("div", {
				ref: root,
				className: clsx(RuntimeExplorer_module_css_default.sidebarAction, !wide && RuntimeExplorer_module_css_default.sidebarRail),
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("open"),
					delayMs: 500,
					disabled: wide,
					children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: RuntimeExplorer_module_css_default.sidebarButton,
						"data-active": open || void 0,
						"aria-label": t("open"),
						"aria-expanded": open,
						onClick: toggle,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, { size: wide ? 16 : 18 }),
							wide && (0, react_jsx_runtime.jsx)("span", { children: t("open") }),
							wide && (0, react_jsx_runtime.jsx)("i", {
								className: RuntimeExplorer_module_css_default.liveDot,
								"aria-hidden": true
							})
						]
					})
				})
			});
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/@heroicons+react@2.2.0_react@18.3.1/node_modules/@heroicons/react/24/outline/esm/ArrowLeftIcon.js
		function ArrowLeftIcon({ title, titleId, ...props }, svgRef) {
			return /*#__PURE__*/ react.createElement("svg", Object.assign({
				xmlns: "http://www.w3.org/2000/svg",
				fill: "none",
				viewBox: "0 0 24 24",
				strokeWidth: 1.5,
				stroke: "currentColor",
				"aria-hidden": "true",
				"data-slot": "icon",
				ref: svgRef,
				"aria-labelledby": titleId
			}, props), title ? /*#__PURE__*/ react.createElement("title", { id: titleId }, title) : null, /*#__PURE__*/ react.createElement("path", {
				strokeLinecap: "round",
				strokeLinejoin: "round",
				d: "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
			}));
		}
		const ForwardRef$4 = /*#__PURE__*/ react.forwardRef(ArrowLeftIcon);
		//#endregion
		//#region ../../../node_modules/.pnpm/@heroicons+react@2.2.0_react@18.3.1/node_modules/@heroicons/react/24/outline/esm/ArrowsPointingInIcon.js
		function ArrowsPointingInIcon({ title, titleId, ...props }, svgRef) {
			return /*#__PURE__*/ react.createElement("svg", Object.assign({
				xmlns: "http://www.w3.org/2000/svg",
				fill: "none",
				viewBox: "0 0 24 24",
				strokeWidth: 1.5,
				stroke: "currentColor",
				"aria-hidden": "true",
				"data-slot": "icon",
				ref: svgRef,
				"aria-labelledby": titleId
			}, props), title ? /*#__PURE__*/ react.createElement("title", { id: titleId }, title) : null, /*#__PURE__*/ react.createElement("path", {
				strokeLinecap: "round",
				strokeLinejoin: "round",
				d: "M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
			}));
		}
		const ForwardRef$3 = /*#__PURE__*/ react.forwardRef(ArrowsPointingInIcon);
		//#endregion
		//#region ../../../node_modules/.pnpm/@heroicons+react@2.2.0_react@18.3.1/node_modules/@heroicons/react/24/outline/esm/ChevronRightIcon.js
		function ChevronRightIcon({ title, titleId, ...props }, svgRef) {
			return /*#__PURE__*/ react.createElement("svg", Object.assign({
				xmlns: "http://www.w3.org/2000/svg",
				fill: "none",
				viewBox: "0 0 24 24",
				strokeWidth: 1.5,
				stroke: "currentColor",
				"aria-hidden": "true",
				"data-slot": "icon",
				ref: svgRef,
				"aria-labelledby": titleId
			}, props), title ? /*#__PURE__*/ react.createElement("title", { id: titleId }, title) : null, /*#__PURE__*/ react.createElement("path", {
				strokeLinecap: "round",
				strokeLinejoin: "round",
				d: "m8.25 4.5 7.5 7.5-7.5 7.5"
			}));
		}
		const ForwardRef$2 = /*#__PURE__*/ react.forwardRef(ChevronRightIcon);
		//#endregion
		//#region ../../../node_modules/.pnpm/@heroicons+react@2.2.0_react@18.3.1/node_modules/@heroicons/react/24/outline/esm/MagnifyingGlassMinusIcon.js
		function MagnifyingGlassMinusIcon({ title, titleId, ...props }, svgRef) {
			return /*#__PURE__*/ react.createElement("svg", Object.assign({
				xmlns: "http://www.w3.org/2000/svg",
				fill: "none",
				viewBox: "0 0 24 24",
				strokeWidth: 1.5,
				stroke: "currentColor",
				"aria-hidden": "true",
				"data-slot": "icon",
				ref: svgRef,
				"aria-labelledby": titleId
			}, props), title ? /*#__PURE__*/ react.createElement("title", { id: titleId }, title) : null, /*#__PURE__*/ react.createElement("path", {
				strokeLinecap: "round",
				strokeLinejoin: "round",
				d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6"
			}));
		}
		const ForwardRef$1 = /*#__PURE__*/ react.forwardRef(MagnifyingGlassMinusIcon);
		//#endregion
		//#region ../../../node_modules/.pnpm/@heroicons+react@2.2.0_react@18.3.1/node_modules/@heroicons/react/24/outline/esm/MagnifyingGlassPlusIcon.js
		function MagnifyingGlassPlusIcon({ title, titleId, ...props }, svgRef) {
			return /*#__PURE__*/ react.createElement("svg", Object.assign({
				xmlns: "http://www.w3.org/2000/svg",
				fill: "none",
				viewBox: "0 0 24 24",
				strokeWidth: 1.5,
				stroke: "currentColor",
				"aria-hidden": "true",
				"data-slot": "icon",
				ref: svgRef,
				"aria-labelledby": titleId
			}, props), title ? /*#__PURE__*/ react.createElement("title", { id: titleId }, title) : null, /*#__PURE__*/ react.createElement("path", {
				strokeLinecap: "round",
				strokeLinejoin: "round",
				d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
			}));
		}
		const ForwardRef = /*#__PURE__*/ react.forwardRef(MagnifyingGlassPlusIcon);
		//#endregion
		//#region lib/types/client/graph.js
		/** Deterministic provider-left graph layout for the runtime SVG. */
		const NODE_WIDTH = 210;
		const NODE_HEIGHT = 72;
		const COLUMN_GAP = 92;
		const ROW_GAP = 26;
		const PADDING = 36;
		/**
		* Keep the complete upstream and downstream dependency chain around one selected node.
		* @param nodes - Graph nodes after search and lifecycle filtering.
		* @param edges - Dependency edges joining the filtered nodes.
		* @param selectedId - Selected node id, or undefined for the complete graph.
		* @returns The selected node's weakly connected dependency component in stable input order.
		*/
		function focusRuntimeGraph(nodes, edges, selectedId) {
			const nodeIds = new Set(nodes.map((node) => node.id));
			const validEdges = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
			if (selectedId === void 0 || !nodeIds.has(selectedId)) return {
				nodes,
				edges: validEdges
			};
			const neighbours = /* @__PURE__ */ new Map();
			for (const edge of validEdges) {
				const sourceNeighbours = neighbours.get(edge.source) ?? [];
				sourceNeighbours.push(edge.target);
				neighbours.set(edge.source, sourceNeighbours);
				const targetNeighbours = neighbours.get(edge.target) ?? [];
				targetNeighbours.push(edge.source);
				neighbours.set(edge.target, targetNeighbours);
			}
			const related = /* @__PURE__ */ new Set();
			const pending = [selectedId];
			while (pending.length > 0) {
				const id = pending.pop();
				if (related.has(id)) continue;
				related.add(id);
				for (const neighbour of neighbours.get(id) ?? []) pending.push(neighbour);
			}
			return {
				nodes: nodes.filter((node) => related.has(node.id)),
				edges: validEdges.filter((edge) => related.has(edge.source) && related.has(edge.target))
			};
		}
		function reachable(start, neighbours) {
			const found = /* @__PURE__ */ new Set();
			const pending = [...neighbours.get(start) ?? []];
			while (pending.length > 0) {
				const id = pending.pop();
				if (id === start || found.has(id)) continue;
				found.add(id);
				for (const neighbour of neighbours.get(id) ?? []) pending.push(neighbour);
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
		function runtimeGraphRelations(nodes, edges, selectedId) {
			const nodeIds = new Set(nodes.map((node) => node.id));
			if (selectedId === void 0 || !nodeIds.has(selectedId)) return {
				nodes: /* @__PURE__ */ new Map(),
				edges: /* @__PURE__ */ new Map()
			};
			const dependencies = /* @__PURE__ */ new Map();
			const dependants = /* @__PURE__ */ new Map();
			for (const edge of edges) {
				if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
				dependencies.set(edge.source, [...dependencies.get(edge.source) ?? [], edge.target]);
				dependants.set(edge.target, [...dependants.get(edge.target) ?? [], edge.source]);
			}
			const dependencyIds = reachable(selectedId, dependencies);
			const dependantIds = reachable(selectedId, dependants);
			const nodeRelations = /* @__PURE__ */ new Map();
			for (const node of nodes) if (node.id === selectedId) nodeRelations.set(node.id, "selected");
			else if (dependencyIds.has(node.id) && dependantIds.has(node.id)) nodeRelations.set(node.id, "both");
			else if (dependencyIds.has(node.id)) nodeRelations.set(node.id, "dependency");
			else if (dependantIds.has(node.id)) nodeRelations.set(node.id, "dependant");
			else nodeRelations.set(node.id, "related");
			const edgeRelations = /* @__PURE__ */ new Map();
			for (const edge of edges) {
				const source = nodeRelations.get(edge.source);
				const target = nodeRelations.get(edge.target);
				const relation = edge.source === selectedId ? "dependency" : edge.target === selectedId ? "dependant" : source === "dependency" && target === "dependency" ? "dependency" : source === "dependant" && target === "dependant" ? "dependant" : source === "both" || target === "both" ? "both" : "related";
				edgeRelations.set(`${edge.source}:${edge.target}`, relation);
			}
			return {
				nodes: nodeRelations,
				edges: edgeRelations
			};
		}
		/**
		* Place providers before their consumers; dependency cycles share a column.
		* @param nodes - Visible runtime nodes after Client filtering.
		* @param edges - Visible dependency edges joining those nodes.
		* @returns Stable SVG dimensions and positions for every input node.
		*/
		function layoutRuntimeGraph(nodes, edges) {
			const nodeIds = new Set(nodes.map((node) => node.id));
			const providers = /* @__PURE__ */ new Map();
			for (const edge of edges) {
				if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
				const targets = providers.get(edge.source) ?? [];
				targets.push(edge.target);
				providers.set(edge.source, targets);
			}
			const memo = /* @__PURE__ */ new Map();
			const visiting = /* @__PURE__ */ new Set();
			const depthOf = (id) => {
				const known = memo.get(id);
				if (known !== void 0) return known;
				if (visiting.has(id)) return 0;
				visiting.add(id);
				const targets = providers.get(id) ?? [];
				const depth = targets.length === 0 ? 0 : Math.max(...targets.map((target) => depthOf(target) + 1));
				visiting.delete(id);
				memo.set(id, depth);
				return depth;
			};
			const columns = /* @__PURE__ */ new Map();
			for (const node of nodes) {
				const depth = depthOf(node.id);
				const column = columns.get(depth) ?? [];
				column.push(node);
				columns.set(depth, column);
			}
			const depths = [...columns.keys()].sort((a, b) => a - b);
			const maxRows = Math.max(1, ...[...columns.values()].map((column) => column.length));
			const width = Math.max(760, PADDING * 2 + depths.length * NODE_WIDTH + Math.max(0, depths.length - 1) * COLUMN_GAP);
			const height = Math.max(520, PADDING * 2 + maxRows * NODE_HEIGHT + Math.max(0, maxRows - 1) * ROW_GAP);
			const positions = [];
			for (const [columnIndex, depth] of depths.entries()) {
				const column = columns.get(depth);
				const columnHeight = column.length * NODE_HEIGHT + Math.max(0, column.length - 1) * ROW_GAP;
				const top = Math.max(PADDING, (height - columnHeight) / 2);
				for (const [row, node] of column.sort((a, b) => a.label.localeCompare(b.label)).entries()) positions.push({
					node,
					x: PADDING + columnIndex * 302,
					y: top + row * 98
				});
			}
			return {
				width,
				height,
				positions,
				byId: new Map(positions.map((position) => [position.node.id, position]))
			};
		}
		/**
		* Collapse detailed Loader Fiber phases into the four product-facing states.
		* @param phase - Detailed phase projected by the Host, or null without a live Fiber.
		* @returns Stable lifecycle status used by graph cards, nodes, and filters.
		*/
		function runtimeLifecycleStatus(phase) {
			switch (phase) {
				case "pending":
				case "loading": return "pending";
				case "active": return "active";
				case "failed": return "failed";
				case "unloading":
				case null: return "disposed";
			}
		}
		/**
		* Count the complete Loader projection by product-facing lifecycle state.
		* @param nodes - Unfiltered runtime nodes from the latest Host snapshot.
		* @returns Stable totals for the graph overview cards.
		*/
		function summarizeRuntimeGraph(nodes) {
			let pending = 0;
			let active = 0;
			let disposed = 0;
			let failed = 0;
			for (const node of nodes) switch (runtimeLifecycleStatus(node.phase)) {
				case "pending":
					pending += 1;
					break;
				case "active":
					active += 1;
					break;
				case "disposed":
					disposed += 1;
					break;
				case "failed":
					failed += 1;
					break;
			}
			return {
				pending,
				active,
				disposed,
				failed
			};
		}
		//#endregion
		//#region lib/types/client/trace.js
		/** Session and Agent Turn projections over the bounded runtime event window. */
		/**
		* Build the stable selection key for one Session-owned Agent Turn.
		* @param sessionId - Opaque Session id from the trace event.
		* @param turn - Session-local Turn number.
		* @returns A key that remains unique across concurrent Sessions.
		*/
		function runtimeTraceTurnKey(sessionId, turn) {
			return `${sessionId}:${turn}`;
		}
		function compareEvents(a, b) {
			return a.time - b.time || a.seq - b.seq;
		}
		function turnStatus(events, outcome) {
			const hasStart = events.some((event) => event.type === "turn/start");
			const hasEnd = events.some((event) => event.type === "turn/end");
			if (!hasStart) return "incomplete";
			if (!hasEnd) return "running";
			if (outcome === "error") return "failed";
			if (outcome === "completed" || outcome === "max-tokens") return "completed";
			return "stopped";
		}
		/**
		* Group the bounded event window into recent Sessions and their Agent Turns.
		* @param events - Privacy-safe events from the latest runtime snapshot.
		* @returns Sessions and Turns sorted by most recent activity.
		*/
		function groupRuntimeTrace(events) {
			const sessions = /* @__PURE__ */ new Map();
			for (const event of events) {
				let session = sessions.get(event.sessionId);
				if (session === void 0) {
					session = {
						sessionId: event.sessionId,
						turns: /* @__PURE__ */ new Map(),
						sessionEvents: []
					};
					sessions.set(event.sessionId, session);
				}
				if (event.turn === void 0) {
					session.sessionEvents.push(event);
					continue;
				}
				let turn = session.turns.get(event.turn);
				if (turn === void 0) {
					turn = {
						sessionId: event.sessionId,
						turn: event.turn,
						events: [event]
					};
					session.turns.set(event.turn, turn);
					continue;
				}
				turn.events.push(event);
			}
			return [...sessions.values()].map((session) => {
				const sessionEvents = [...session.sessionEvents].sort(compareEvents);
				const turns = [...session.turns.values()].map((turn) => {
					const turnEvents = [...turn.events].sort(compareEvents);
					const start = turnEvents.find((event) => event.type === "turn/start") ?? turn.events[0];
					const end = turnEvents.findLast((event) => event.type === "turn/end");
					const updatedAt = turnEvents.at(-1)?.time ?? start.time;
					const outcome = end?.outcome;
					return {
						key: runtimeTraceTurnKey(turn.sessionId, turn.turn),
						sessionId: turn.sessionId,
						turn: turn.turn,
						events: turnEvents,
						startedAt: start.time,
						updatedAt,
						durationMs: Math.max(0, (end?.time ?? updatedAt) - start.time),
						eventCount: turnEvents.length,
						stepCount: new Set(turnEvents.flatMap((event) => event.step === void 0 ? [] : [event.step])).size,
						toolCallCount: turnEvents.filter((event) => event.type === "tool/call").length,
						status: turnStatus(turnEvents, outcome),
						...outcome === void 0 ? {} : { outcome }
					};
				}).sort((a, b) => b.updatedAt - a.updatedAt || b.turn - a.turn);
				const updatedAt = Math.max(...turns.map((turn) => turn.updatedAt), ...sessionEvents.map((event) => event.time));
				return {
					sessionId: session.sessionId,
					turns,
					sessionEvents,
					eventCount: turns.reduce((count, turn) => count + turn.eventCount, sessionEvents.length),
					updatedAt
				};
			}).sort((a, b) => b.updatedAt - a.updatedAt || a.sessionId.localeCompare(b.sessionId));
		}
		function includesTurn(turn, query) {
			return [
				`turn ${turn.turn}`,
				String(turn.turn),
				turn.status,
				turn.outcome,
				...turn.events.flatMap((event) => [
					event.type,
					event.name,
					event.callId
				])
			].filter((value) => value !== void 0).join("\n").toLowerCase().includes(query);
		}
		/**
		* Filter the Turn directory without flattening its Session grouping.
		* @param sessions - Grouped runtime trace Sessions.
		* @param query - Normalized user query.
		* @returns Matching Session groups in their existing activity order.
		*/
		function filterRuntimeTrace(sessions, query) {
			if (query === "") return [...sessions];
			return sessions.flatMap((session) => {
				if (session.sessionId.toLowerCase().includes(query)) return [session];
				const turns = session.turns.filter((turn) => includesTurn(turn, query));
				const sessionEvents = session.sessionEvents.filter((event) => [
					event.type,
					event.name,
					event.callId,
					event.outcome
				].filter((value) => value !== void 0).join("\n").toLowerCase().includes(query));
				if (turns.length === 0 && sessionEvents.length === 0) return [];
				return [{
					...session,
					turns,
					sessionEvents,
					eventCount: turns.reduce((count, turn) => count + turn.eventCount, sessionEvents.length)
				}];
			});
		}
		//#endregion
		//#region lib/types/client/RuntimeExplorer.js
		/** Runtime graph, request trace, filters, and metadata inspector. */
		const STATUS_LABELS = {
			pending: "pending",
			active: "active",
			disposed: "disposed",
			failed: "failed"
		};
		const LANE_LABELS = {
			user: "laneUser",
			agent: "laneAgent",
			llm: "laneLlm",
			tool: "laneTool",
			session: "laneSession"
		};
		const TURN_STATUS_LABELS = {
			running: "turnRunning",
			completed: "turnCompleted",
			failed: "turnFailed",
			stopped: "turnStopped",
			incomplete: "turnIncomplete"
		};
		const GRAPH_ZOOM_LEVELS = [
			.8,
			1,
			1.2,
			1.4
		];
		const DEFAULT_GRAPH_ZOOM_INDEX = 1;
		const GRAPH_PAN_THRESHOLD = 3;
		function statusKey(phase) {
			return runtimeLifecycleStatus(phase);
		}
		function includesNode(node, query) {
			if (query === "") return true;
			return [
				node.label,
				node.moduleName,
				node.entryId,
				...node.provides,
				...node.injects
			].join("\n").toLowerCase().includes(query);
		}
		function includesEvent(event, query) {
			if (query === "") return true;
			return [
				event.type,
				event.sessionId,
				event.name,
				event.callId,
				event.outcome
			].filter((value) => value !== void 0).join("\n").toLowerCase().includes(query);
		}
		function shortSessionId(sessionId) {
			if (sessionId.length <= 18) return sessionId;
			return `${sessionId.slice(0, 10)}…${sessionId.slice(-4)}`;
		}
		function formatDuration(durationMs) {
			if (durationMs < 1e3) return `${durationMs} ms`;
			if (durationMs < 1e4) return `${(durationMs / 1e3).toFixed(1)} s`;
			return `${Math.round(durationMs / 1e3)} s`;
		}
		function graphEdgesFor(nodes, edges) {
			const ids = new Set(nodes.map((node) => node.id));
			return edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
		}
		function MetadataList({ values, empty }) {
			if (values.length === 0) return (0, react_jsx_runtime.jsx)("span", {
				className: RuntimeExplorer_module_css_default.emptyValue,
				children: empty
			});
			return (0, react_jsx_runtime.jsx)("div", {
				className: RuntimeExplorer_module_css_default.chips,
				children: values.map((value) => (0, react_jsx_runtime.jsx)("code", { children: value }, value))
			});
		}
		function GraphView({ nodes, edges, summary, totalNodes, selectedId, selectedLabel, onSelect, onClearSelection, empty, graphLabel, phaseLabel, t }) {
			const [zoomIndex, setZoomIndex] = (0, react.useState)(DEFAULT_GRAPH_ZOOM_INDEX);
			const [panning, setPanning] = (0, react.useState)(false);
			const [fitRequest, setFitRequest] = (0, react.useState)(0);
			const focus = (0, react.useMemo)(() => focusRuntimeGraph(nodes, edges, selectedId), [
				edges,
				nodes,
				selectedId
			]);
			const layout = (0, react.useMemo)(() => layoutRuntimeGraph(focus.nodes, focus.edges), [focus.edges, focus.nodes]);
			const relations = (0, react.useMemo)(() => runtimeGraphRelations(focus.nodes, focus.edges, selectedId), [
				focus.edges,
				focus.nodes,
				selectedId
			]);
			const scroller = (0, react.useRef)(null);
			const pan = (0, react.useRef)();
			(0, react.useLayoutEffect)(() => {
				const viewport = scroller.current;
				if (viewport === null) return;
				const selected = selectedId === void 0 ? void 0 : layout.byId.get(selectedId);
				if (selected === void 0 || viewport.clientWidth === 0 || viewport.clientHeight === 0) {
					viewport.scrollLeft = 0;
					viewport.scrollTop = 0;
					return;
				}
				const scale = GRAPH_ZOOM_LEVELS[zoomIndex];
				viewport.scrollLeft = Math.max(0, (selected.x + 210 / 2) * scale - viewport.clientWidth / 2);
				viewport.scrollTop = Math.max(0, (selected.y + 72 / 2) * scale - viewport.clientHeight / 2);
			}, [
				fitRequest,
				layout,
				selectedId,
				zoomIndex
			]);
			const scale = GRAPH_ZOOM_LEVELS[zoomIndex];
			const startPan = (event) => {
				if (event.button !== 0 || !event.isPrimary) return;
				if (event.target.closest("button, a, input, select, textarea") !== null) return;
				const viewport = event.currentTarget;
				pan.current = {
					pointerId: event.pointerId,
					clientX: event.clientX,
					clientY: event.clientY,
					scrollLeft: viewport.scrollLeft,
					scrollTop: viewport.scrollTop,
					moved: false
				};
				viewport.setPointerCapture(event.pointerId);
				setPanning(true);
			};
			const movePan = (event) => {
				const gesture = pan.current;
				if (gesture === void 0 || gesture.pointerId !== event.pointerId) return;
				const deltaX = event.clientX - gesture.clientX;
				const deltaY = event.clientY - gesture.clientY;
				if (!gesture.moved && Math.hypot(deltaX, deltaY) < GRAPH_PAN_THRESHOLD) return;
				gesture.moved = true;
				event.preventDefault();
				event.currentTarget.scrollLeft = gesture.scrollLeft - deltaX;
				event.currentTarget.scrollTop = gesture.scrollTop - deltaY;
			};
			const endPan = (event) => {
				if (pan.current?.pointerId !== event.pointerId) return;
				pan.current = void 0;
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				setPanning(false);
			};
			const resetZoom = () => {
				setZoomIndex(DEFAULT_GRAPH_ZOOM_INDEX);
				const viewport = scroller.current;
				viewport.scrollLeft = 0;
				viewport.scrollTop = 0;
			};
			const fitView = () => {
				const viewport = scroller.current;
				if (viewport === null) return;
				const availableWidth = Math.max(1, viewport.clientWidth - 48);
				const availableHeight = Math.max(1, viewport.clientHeight - 48);
				const ideal = Math.min(availableWidth / layout.width, availableHeight / layout.height);
				let next = 0;
				for (const [index, level] of GRAPH_ZOOM_LEVELS.entries()) if (level <= ideal) next = index;
				setZoomIndex(next);
				setFitRequest((current) => current + 1);
			};
			const summaryItems = [
				[
					"pending",
					summary.pending,
					"pending"
				],
				[
					"active",
					summary.active,
					"active"
				],
				[
					"disposed",
					summary.disposed,
					"disposed"
				],
				[
					"failed",
					summary.failed,
					"failed"
				]
			];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: RuntimeExplorer_module_css_default.graphView,
				children: [
					(0, react_jsx_runtime.jsx)("dl", {
						className: RuntimeExplorer_module_css_default.graphSummary,
						"aria-label": t("pluginSummary"),
						children: summaryItems.map(([label, value, state]) => (0, react_jsx_runtime.jsxs)("div", {
							"data-state": state,
							children: [(0, react_jsx_runtime.jsx)("dt", { children: t(label) }), (0, react_jsx_runtime.jsx)("dd", { children: value })]
						}, label))
					}),
					selectedId !== void 0 && selectedLabel !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: RuntimeExplorer_module_css_default.focusBar,
						role: "status",
						"aria-live": "polite",
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: RuntimeExplorer_module_css_default.focusIdentity,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("focusedNode") }), (0, react_jsx_runtime.jsx)("strong", { children: selectedLabel })]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: RuntimeExplorer_module_css_default.focusCount,
								children: [
									t("relatedPlugins"),
									" ",
									(0, react_jsx_runtime.jsx)("strong", { children: focus.nodes.length }),
									" / ",
									totalNodes
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: RuntimeExplorer_module_css_default.relationLegend,
								"aria-label": t("dependencyDirection"),
								children: [(0, react_jsx_runtime.jsxs)("span", {
									"data-relation": "dependency",
									children: [(0, react_jsx_runtime.jsx)("i", { "aria-hidden": true }), t("dependencies")]
								}), (0, react_jsx_runtime.jsxs)("span", {
									"data-relation": "dependant",
									children: [(0, react_jsx_runtime.jsx)("i", { "aria-hidden": true }), t("dependants")]
								})]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: RuntimeExplorer_module_css_default.showAll,
								onClick: onClearSelection,
								children: t("showAll")
							})
						]
					}),
					nodes.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: RuntimeExplorer_module_css_default.emptyState,
						children: empty
					}) : (0, react_jsx_runtime.jsx)("div", {
						ref: scroller,
						className: RuntimeExplorer_module_css_default.graphScroller,
						"data-panning": panning || void 0,
						tabIndex: 0,
						"aria-label": t("panCanvas"),
						onPointerDown: startPan,
						onPointerMove: movePan,
						onPointerUp: endPan,
						onPointerCancel: endPan,
						onLostPointerCapture: endPan,
						children: (0, react_jsx_runtime.jsx)("div", {
							className: RuntimeExplorer_module_css_default.graphStage,
							style: {
								width: layout.width * scale,
								height: layout.height * scale
							},
							children: (0, react_jsx_runtime.jsxs)("svg", {
								className: RuntimeExplorer_module_css_default.graph,
								width: layout.width,
								height: layout.height,
								viewBox: `0 0 ${layout.width} ${layout.height}`,
								style: { transform: `scale(${scale})` },
								role: "img",
								"aria-label": graphLabel,
								children: [(0, react_jsx_runtime.jsx)("g", {
									className: RuntimeExplorer_module_css_default.edges,
									children: focus.edges.map((edge) => {
										const consumer = layout.byId.get(edge.source);
										const provider = layout.byId.get(edge.target);
										const x1 = provider.x + 210;
										const y1 = provider.y + 72 / 2;
										const x2 = consumer.x;
										const y2 = consumer.y + 72 / 2;
										const bend = Math.max(32, (x2 - x1) / 2);
										return (0, react_jsx_runtime.jsx)("path", {
											d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
											"data-relation": relations.edges.get(`${edge.source}:${edge.target}`),
											children: (0, react_jsx_runtime.jsx)("title", { children: edge.services.join(", ") })
										}, `${edge.source}:${edge.target}`);
									})
								}), layout.positions.map(({ node, x, y }) => (0, react_jsx_runtime.jsx)("foreignObject", {
									x,
									y,
									width: 210,
									height: 72,
									children: (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: RuntimeExplorer_module_css_default.graphNode,
										"data-phase": statusKey(node.phase),
										"data-selected": selectedId === node.id || void 0,
										"data-relation": relations.nodes.get(node.id),
										onClick: () => {
											onSelect(node.id);
										},
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: RuntimeExplorer_module_css_default.nodeIcon,
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCordisPluginOutline14, { size: 16 })
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: RuntimeExplorer_module_css_default.nodeCopy,
											children: [(0, react_jsx_runtime.jsx)("strong", { children: node.label }), (0, react_jsx_runtime.jsxs)("small", { children: [(0, react_jsx_runtime.jsx)("i", { "aria-hidden": true }), phaseLabel(node.phase)] })]
										})]
									})
								}, node.id))]
							})
						})
					}),
					nodes.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: RuntimeExplorer_module_css_default.zoomControls,
						role: "group",
						"aria-label": t("zoomControls"),
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("zoomOut"),
								side: "top",
								delayMs: 400,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": t("zoomOut"),
									disabled: zoomIndex === 0,
									onClick: () => {
										setZoomIndex((current) => Math.max(0, current - 1));
									},
									children: (0, react_jsx_runtime.jsx)(ForwardRef$1, {
										"aria-hidden": "true",
										width: 18,
										height: 18
									})
								})
							}),
							(0, react_jsx_runtime.jsxs)("output", {
								"aria-label": t("zoomLevel"),
								"aria-live": "polite",
								children: [Math.round(scale * 100), "%"]
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("zoomIn"),
								side: "top",
								delayMs: 400,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": t("zoomIn"),
									disabled: zoomIndex === GRAPH_ZOOM_LEVELS.length - 1,
									onClick: () => {
										setZoomIndex((current) => Math.min(GRAPH_ZOOM_LEVELS.length - 1, current + 1));
									},
									children: (0, react_jsx_runtime.jsx)(ForwardRef, {
										"aria-hidden": "true",
										width: 18,
										height: 18
									})
								})
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("fitView"),
								side: "top",
								delayMs: 400,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": t("fitView"),
									onClick: fitView,
									children: (0, react_jsx_runtime.jsx)(ForwardRef$3, {
										"aria-hidden": "true",
										width: 18,
										height: 18
									})
								})
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: resetZoom,
								children: t("resetZoom")
							})
						]
					})
				]
			});
		}
		function TraceTimeline({ turn, events, selectedId, onSelect, onBack, empty, laneLabel, timeLabel, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: RuntimeExplorer_module_css_default.traceDetail,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: RuntimeExplorer_module_css_default.traceDetailHeader,
					children: [
						(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: RuntimeExplorer_module_css_default.traceBack,
							onClick: onBack,
							children: [(0, react_jsx_runtime.jsx)(ForwardRef$4, {
								"aria-hidden": "true",
								width: 16,
								height: 16
							}), t("backToTurns")]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: RuntimeExplorer_module_css_default.traceDetailIdentity,
							children: [
								(0, react_jsx_runtime.jsx)("code", {
									title: turn.sessionId,
									children: shortSessionId(turn.sessionId)
								}),
								(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "/"
								}),
								(0, react_jsx_runtime.jsxs)("strong", { children: [
									t("turn"),
									" #",
									turn.turn
								] }),
								(0, react_jsx_runtime.jsx)("span", {
									className: RuntimeExplorer_module_css_default.turnStatus,
									"data-status": turn.status,
									children: t(TURN_STATUS_LABELS[turn.status])
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: RuntimeExplorer_module_css_default.turnMetrics,
							children: [
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("duration") }), (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(turn.durationMs) })] }),
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("events") }), (0, react_jsx_runtime.jsx)("dd", { children: turn.eventCount })] }),
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("steps") }), (0, react_jsx_runtime.jsx)("dd", { children: turn.stepCount })] }),
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("toolCalls") }), (0, react_jsx_runtime.jsx)("dd", { children: turn.toolCallCount })] })
							]
						})
					]
				}), events.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
					className: RuntimeExplorer_module_css_default.emptyState,
					children: empty
				}) : (0, react_jsx_runtime.jsx)("div", {
					className: RuntimeExplorer_module_css_default.traceScroller,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: RuntimeExplorer_module_css_default.traceGrid,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: RuntimeExplorer_module_css_default.traceCorner,
								children: timeLabel
							}),
							Object.keys(LANE_LABELS).map((lane) => (0, react_jsx_runtime.jsx)("div", {
								className: RuntimeExplorer_module_css_default.traceLane,
								children: laneLabel(lane)
							}, lane)),
							events.map((event) => (0, react_jsx_runtime.jsxs)("div", {
								className: RuntimeExplorer_module_css_default.traceRow,
								children: [(0, react_jsx_runtime.jsx)("time", {
									dateTime: new Date(event.time).toISOString(),
									children: new Date(event.time).toLocaleTimeString([], { hour12: false })
								}), (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: RuntimeExplorer_module_css_default.traceEvent,
									"data-lane": event.lane,
									"data-selected": selectedId === event.id || void 0,
									onClick: () => {
										onSelect(event.id);
									},
									children: [(0, react_jsx_runtime.jsx)("span", { children: event.type }), (0, react_jsx_runtime.jsx)("small", { children: event.name ?? `#${event.seq}` })]
								})]
							}, event.id))
						]
					})
				})]
			});
		}
		function TraceDirectory({ sessions, onSelect, empty, t }) {
			const turnCount = sessions.reduce((count, session) => count + session.turns.length, 0);
			if (turnCount === 0) return (0, react_jsx_runtime.jsx)("div", {
				className: RuntimeExplorer_module_css_default.emptyState,
				children: empty
			});
			const runningCount = sessions.reduce((count, session) => count + session.turns.filter((turn) => turn.status === "running").length, 0);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: RuntimeExplorer_module_css_default.traceDirectory,
				children: [(0, react_jsx_runtime.jsxs)("dl", {
					className: RuntimeExplorer_module_css_default.traceSummary,
					"aria-label": t("traceSummary"),
					children: [
						(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sessions") }), (0, react_jsx_runtime.jsx)("dd", { children: sessions.length })] }),
						(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("agentTurns") }), (0, react_jsx_runtime.jsx)("dd", { children: turnCount })] }),
						(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("runningTurns") }), (0, react_jsx_runtime.jsx)("dd", { children: runningCount })] })
					]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: RuntimeExplorer_module_css_default.traceSessions,
					children: sessions.map((session) => (0, react_jsx_runtime.jsxs)("section", {
						className: RuntimeExplorer_module_css_default.traceSession,
						children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("session") }), (0, react_jsx_runtime.jsx)("code", {
							title: session.sessionId,
							children: shortSessionId(session.sessionId)
						})] }), (0, react_jsx_runtime.jsxs)("small", { children: [
							session.turns.length,
							" ",
							t("turns"),
							" · ",
							session.eventCount,
							" ",
							t("events")
						] })] }), (0, react_jsx_runtime.jsxs)("div", {
							className: RuntimeExplorer_module_css_default.turnList,
							children: [session.turns.map((turn) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: RuntimeExplorer_module_css_default.turnRow,
								"aria-label": `${t("turn")} ${turn.turn}, ${t(TURN_STATUS_LABELS[turn.status])}`,
								onClick: () => {
									onSelect(turn.key);
								},
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: RuntimeExplorer_module_css_default.turnIdentity,
										children: [(0, react_jsx_runtime.jsxs)("strong", { children: [
											t("turn"),
											" #",
											turn.turn
										] }), (0, react_jsx_runtime.jsx)("time", {
											dateTime: new Date(turn.startedAt).toISOString(),
											children: new Date(turn.startedAt).toLocaleTimeString([], { hour12: false })
										})]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: RuntimeExplorer_module_css_default.turnStatus,
										"data-status": turn.status,
										children: t(TURN_STATUS_LABELS[turn.status])
									}),
									(0, react_jsx_runtime.jsxs)("dl", {
										className: RuntimeExplorer_module_css_default.turnMetrics,
										children: [
											(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("duration") }), (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(turn.durationMs) })] }),
											(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("events") }), (0, react_jsx_runtime.jsx)("dd", { children: turn.eventCount })] }),
											(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("steps") }), (0, react_jsx_runtime.jsx)("dd", { children: turn.stepCount })] }),
											(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("toolCalls") }), (0, react_jsx_runtime.jsx)("dd", { children: turn.toolCallCount })] })
										]
									}),
									(0, react_jsx_runtime.jsx)(ForwardRef$2, {
										"aria-hidden": "true",
										width: 17,
										height: 17
									})
								]
							}, turn.key)), session.sessionEvents.length > 0 && (0, react_jsx_runtime.jsxs)("p", {
								className: RuntimeExplorer_module_css_default.sessionEvents,
								children: [
									t("sessionEvents"),
									": ",
									session.sessionEvents.length
								]
							})]
						})]
					}, session.sessionId))
				})]
			});
		}
		function PluginInspector({ node, t }) {
			const rows = [
				["module", node.moduleName],
				["entry", node.entryId],
				["status", t(STATUS_LABELS[statusKey(node.phase)])]
			];
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: RuntimeExplorer_module_css_default.inspectorTitle,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: RuntimeExplorer_module_css_default.inspectorIcon,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCordisPluginOutline14, { size: 18 })
					}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: node.label }), (0, react_jsx_runtime.jsx)("small", { children: t("selectedPlugin") })] })]
				}),
				(0, react_jsx_runtime.jsx)("dl", {
					className: RuntimeExplorer_module_css_default.metadata,
					children: rows.map(([label, value]) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t(label) }), (0, react_jsx_runtime.jsx)("dd", { children: value })] }, label))
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: RuntimeExplorer_module_css_default.inspectorSection,
					children: [(0, react_jsx_runtime.jsx)("h3", { children: t("provides") }), (0, react_jsx_runtime.jsx)(MetadataList, {
						values: node.provides,
						empty: t("noItems")
					})]
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: RuntimeExplorer_module_css_default.inspectorSection,
					children: [(0, react_jsx_runtime.jsx)("h3", { children: t("injects") }), (0, react_jsx_runtime.jsx)(MetadataList, {
						values: node.injects,
						empty: t("noItems")
					})]
				}),
				node.missing.length > 0 && (0, react_jsx_runtime.jsxs)("section", {
					className: RuntimeExplorer_module_css_default.inspectorSection,
					"data-warning": true,
					children: [(0, react_jsx_runtime.jsx)("h3", { children: t("missing") }), (0, react_jsx_runtime.jsx)(MetadataList, {
						values: node.missing,
						empty: t("noItems")
					})]
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: RuntimeExplorer_module_css_default.inspectorSection,
					children: [(0, react_jsx_runtime.jsxs)("h3", { children: [
						t("effects"),
						" ",
						(0, react_jsx_runtime.jsx)("span", { children: node.effectCount })
					] }), (0, react_jsx_runtime.jsx)(MetadataList, {
						values: node.effects,
						empty: t("noItems")
					})]
				})
			] });
		}
		function EventInspector({ event, t }) {
			const rows = [
				["session", event.sessionId],
				["event", event.type],
				["sequence", event.seq],
				["payload", event.payloadChars],
				["turn", event.turn],
				["step", event.step],
				["callId", event.callId],
				["tool", event.name],
				["outcome", event.outcome]
			];
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: RuntimeExplorer_module_css_default.inspectorTitle,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: RuntimeExplorer_module_css_default.inspectorIcon,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 18 })
					}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: event.type }), (0, react_jsx_runtime.jsx)("small", { children: t("selectedEvent") })] })]
				}),
				(0, react_jsx_runtime.jsx)("dl", {
					className: RuntimeExplorer_module_css_default.metadata,
					children: rows.filter(([, value]) => value !== void 0).map(([label, value]) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t(label) }), (0, react_jsx_runtime.jsx)("dd", { children: String(value) })] }, label))
				}),
				(0, react_jsx_runtime.jsx)("p", {
					className: RuntimeExplorer_module_css_default.privacy,
					children: t("privacy")
				})
			] });
		}
		/** Render the frame overlay and keep Remote polling bound to its visible lifetime. */
		function RuntimeExplorer({ useStore, useRuntime, actions, onVisibilityChange, onRefresh, t }) {
			const state = useStore((current) => current);
			const remote = useRuntime((current) => current);
			(0, react.useEffect)(() => {
				if (!state.open) return;
				onVisibilityChange(true);
				return () => {
					onVisibilityChange(false);
				};
			}, [onVisibilityChange, state.open]);
			const query = state.query.trim().toLowerCase();
			const data = remote.data;
			const traceSessions = (0, react.useMemo)(() => groupRuntimeTrace(data?.trace ?? []), [data?.trace]);
			const visibleTraceSessions = (0, react.useMemo)(() => filterRuntimeTrace(traceSessions, query), [query, traceSessions]);
			if (!state.open) return null;
			const graphNodes = data?.graph.nodes.filter((node) => includesNode(node, query) && (state.phase === "all" || statusKey(node.phase) === state.phase)) ?? [];
			const graphEdges = data === void 0 ? [] : graphEdgesFor(graphNodes, data.graph.edges);
			const selectedTurn = traceSessions.flatMap((session) => session.turns).find((turn) => turn.key === state.traceTurnKey);
			const traceEvents = selectedTurn?.events.filter((event) => includesEvent(event, query)) ?? [];
			const selectedNode = state.selection?.kind === "node" ? data?.graph.nodes.find((node) => node.id === state.selection?.id) : void 0;
			const selectedEvent = state.selection?.kind === "event" ? data?.trace.find((event) => event.id === state.selection?.id) : void 0;
			const close = () => {
				actions.setOpen(false);
				onVisibilityChange(false);
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: RuntimeExplorer_module_css_default.surface,
				style: { left: state.sidebarOffset },
				"aria-label": t("title"),
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: RuntimeExplorer_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: RuntimeExplorer_module_css_default.brandIcon,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, { size: 20 })
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: RuntimeExplorer_module_css_default.heading,
								children: [(0, react_jsx_runtime.jsx)("h1", { children: t("title") }), (0, react_jsx_runtime.jsx)("p", { children: t("subtitle") })]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: RuntimeExplorer_module_css_default.liveBadge,
								children: [(0, react_jsx_runtime.jsx)("i", { "aria-hidden": true }), t("live")]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: RuntimeExplorer_module_css_default.profileBadge,
								"aria-label": `${t("currentProfile")}: ${data?.profile ?? t("unavailable")}`,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("profile") }), (0, react_jsx_runtime.jsx)("code", { children: data?.profile ?? "—" })]
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: RuntimeExplorer_module_css_default.updated,
								children: t("updated")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("refresh"),
								side: "bottom",
								delayMs: 400,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: RuntimeExplorer_module_css_default.iconButton,
									"aria-label": t("refresh"),
									onClick: onRefresh,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 16 })
								})
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("close"),
								side: "bottom",
								delayMs: 400,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: RuntimeExplorer_module_css_default.iconButton,
									"aria-label": t("close"),
									onClick: close,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 16 })
								})
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: RuntimeExplorer_module_css_default.toolbar,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: RuntimeExplorer_module_css_default.tabs,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-active": state.tab === "graph" || void 0,
									onClick: () => {
										actions.setTab("graph");
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, { size: 15 }), t("graphTab")]
								}), (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-active": state.tab === "trace" || void 0,
									onClick: () => {
										actions.setTab("trace");
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 15 }), t("traceTab")]
								})]
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: RuntimeExplorer_module_css_default.search,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, { size: 16 }), (0, react_jsx_runtime.jsx)("input", {
									value: state.query,
									placeholder: t(state.tab === "graph" ? "searchGraph" : selectedTurn === void 0 ? "searchTrace" : "searchTurnTrace"),
									onChange: (event) => {
										actions.setQuery(event.target.value);
									}
								})]
							}),
							state.tab === "graph" && (0, react_jsx_runtime.jsxs)("select", {
								className: RuntimeExplorer_module_css_default.phaseFilter,
								"aria-label": t("allStates"),
								value: state.phase,
								onChange: (event) => {
									actions.setPhase(event.target.value);
								},
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "all",
									children: t("allStates")
								}), Object.keys(STATUS_LABELS).map((status) => (0, react_jsx_runtime.jsx)("option", {
									value: status,
									children: t(STATUS_LABELS[status])
								}, status))]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: clsx(RuntimeExplorer_module_css_default.body, (selectedNode !== void 0 || selectedEvent !== void 0) && RuntimeExplorer_module_css_default.withInspector),
						children: [(0, react_jsx_runtime.jsxs)("main", {
							className: RuntimeExplorer_module_css_default.canvas,
							children: [
								remote.loading && data === void 0 && (0, react_jsx_runtime.jsx)("div", {
									className: RuntimeExplorer_module_css_default.emptyState,
									children: t("loadingSnapshot")
								}),
								remote.error !== void 0 && data === void 0 && (0, react_jsx_runtime.jsxs)("div", {
									className: RuntimeExplorer_module_css_default.emptyState,
									children: [(0, react_jsx_runtime.jsx)("p", { children: t("loadFailed") }), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: onRefresh,
										children: t("retry")
									})]
								}),
								data !== void 0 && state.tab === "graph" && (0, react_jsx_runtime.jsx)(GraphView, {
									nodes: graphNodes,
									edges: graphEdges,
									summary: summarizeRuntimeGraph(data.graph.nodes),
									totalNodes: data.graph.nodes.length,
									selectedId: selectedNode?.id,
									selectedLabel: selectedNode?.label,
									empty: t("emptyGraph"),
									graphLabel: t("graphLabel"),
									phaseLabel: (phase) => t(STATUS_LABELS[statusKey(phase)]),
									t,
									onSelect: (id) => {
										actions.select({
											kind: "node",
											id
										});
									},
									onClearSelection: () => {
										actions.select(void 0);
									}
								}),
								data !== void 0 && state.tab === "trace" && (selectedTurn === void 0 ? (0, react_jsx_runtime.jsx)(TraceDirectory, {
									sessions: visibleTraceSessions,
									empty: t(query === "" ? "emptyTurns" : "emptyTrace"),
									t,
									onSelect: (key) => {
										actions.selectTraceTurn(key);
									}
								}) : (0, react_jsx_runtime.jsx)(TraceTimeline, {
									turn: selectedTurn,
									events: traceEvents,
									selectedId: selectedEvent?.id,
									empty: t("emptyTurnTrace"),
									laneLabel: (lane) => t(LANE_LABELS[lane]),
									timeLabel: t("time"),
									t,
									onBack: () => {
										actions.selectTraceTurn(void 0);
									},
									onSelect: (id) => {
										actions.select({
											kind: "event",
											id
										});
									}
								}))
							]
						}), (selectedNode !== void 0 || selectedEvent !== void 0) && (0, react_jsx_runtime.jsxs)("aside", {
							className: RuntimeExplorer_module_css_default.inspector,
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: RuntimeExplorer_module_css_default.inspectorClose,
									"aria-label": t("closeInspector"),
									onClick: () => {
										actions.select(void 0);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 16 })
								}),
								selectedNode !== void 0 && (0, react_jsx_runtime.jsx)(PluginInspector, {
									node: selectedNode,
									t
								}),
								selectedEvent !== void 0 && (0, react_jsx_runtime.jsx)(EventInspector, {
									event: selectedEvent,
									t
								})
							]
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/source.js
		/** Observable Remote snapshot with single-flight refresh and open-only polling. */
		/**
		* Build the browser source over the generated Remote call.
		* @param read - Invoke the mounted runtimeExplorer snapshot Remote.
		* @param onError - Report a failed read without exposing transport detail in product copy.
		* @returns An observable source with single-flight refresh and visible-only polling.
		*/
		function createRuntimeSource(read, onError) {
			const listeners = /* @__PURE__ */ new Set();
			let snapshot = {
				data: void 0,
				loading: false,
				error: void 0
			};
			let inFlight;
			let timer;
			let active = false;
			let disposed = false;
			const publish = (next) => {
				snapshot = next;
				for (const listener of [...listeners]) listener();
			};
			const clearTimer = () => {
				if (timer !== void 0) clearTimeout(timer);
				timer = void 0;
			};
			const schedule = (delay) => {
				clearTimer();
				if (!active || disposed) return;
				timer = setTimeout(() => {
					source.refresh();
				}, delay);
			};
			const source = {
				getSnapshot: () => snapshot,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				refresh: () => {
					if (disposed || inFlight !== void 0) return;
					publish({
						...snapshot,
						loading: snapshot.data === void 0,
						error: void 0
					});
					inFlight = read().then((data) => {
						if (disposed) return;
						publish({
							data,
							loading: false,
							error: void 0
						});
						schedule(data.refreshIntervalMs);
					}, (error) => {
						if (disposed) return;
						onError(error);
						publish({
							...snapshot,
							loading: false,
							error: error instanceof Error ? error.message : "runtime snapshot failed"
						});
					}).then(() => {
						inFlight = void 0;
					});
				},
				setActive: (next) => {
					active = next;
					if (active) source.refresh();
					else clearTimer();
				},
				dispose: () => {
					disposed = true;
					active = false;
					clearTimer();
					listeners.clear();
				}
			};
			return source;
		}
		//#endregion
		//#region lib/types/client/store.js
		/** Shared viewing state for the sidebar action and frame overlay. */
		/**
		* Create the root-scoped store shared by both dsh-runtime slot entries.
		* @returns A store handle whose action and overlay adapters share one state instance.
		*/
		function createRuntimeStore() {
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					open: false,
					tab: "graph",
					query: "",
					phase: "all",
					selection: void 0,
					traceTurnKey: void 0,
					sidebarOffset: 0
				}),
				actions: {
					setOpen: (draft, open) => {
						draft.open = open;
					},
					setTab: (draft, tab) => {
						draft.tab = tab;
						draft.selection = void 0;
						draft.traceTurnKey = void 0;
						draft.query = "";
					},
					setQuery: (draft, query) => {
						draft.query = query;
						draft.selection = void 0;
					},
					setPhase: (draft, phase) => {
						draft.phase = phase;
						draft.selection = void 0;
					},
					select: (draft, selection) => {
						draft.selection = selection;
					},
					selectTraceTurn: (draft, key) => {
						draft.traceTurnKey = key;
						draft.selection = void 0;
						draft.query = "";
					},
					setSidebarOffset: (draft, px) => {
						draft.sidebarOffset = px;
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** dsh-runtime sidebar entry and frame overlay assembly. */
		const NS = "runtime";
		/** Services required by the Remote source and both slot contributions. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.runtimeExplorer"
		];
		/** Mount dsh-runtime as one sidebar action and one frame overlay. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-runtime: dictionaries");
			const store = createRuntimeStore();
			const source = createRuntimeSource(async () => {
				const result = await ctx.remote.runtimeExplorer.snapshot();
				if (!result.ok) throw new Error(`runtimeExplorer.snapshot failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			}, (error) => {
				console.error("[dsh-runtime] reading the runtime snapshot failed:", error);
			});
			const onVisibilityChange = (open) => {
				source.setActive(open);
			};
			const onRefresh = () => {
				source.refresh();
			};
			ctx.effect(() => () => {
				source.dispose();
			}, "ui-runtime: source lifecycle");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "dsh-runtime",
				order: 80,
				locale: NS,
				store,
				inject: () => ({ onVisibilityChange })
			}, RuntimeAction));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "dsh-runtime",
				order: 80,
				locale: NS,
				store,
				inject: () => ({
					hooks: { runtime: source },
					onVisibilityChange,
					onRefresh
				})
			}, RuntimeExplorer));
		}
		//#endregion
		exports.apply = apply;
		exports.createRuntimeStore = createRuntimeStore;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map

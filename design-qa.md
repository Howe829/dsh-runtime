# DSH Insider Runtime Overview design QA

## Comparison setup

- Source visual truth: `/var/folders/2k/sbpv92td6qldrfzhbfs161_r0000gn/T/codex-clipboard-d3d3d064-32ac-4318-a510-1297c560b81b.png`, together with the accepted `Status Summary + Type x Status stacked bar` Loader mockup and the agreed Fibers and Services variants.
- Implementation screenshot: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-overview-final-1020.png`.
- Combined comparison: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-overview-source-implementation.png`.
- Viewport and density: implementation 1020 x 969 CSS pixels at 1x. The 1004 x 674 partial source crop was aspect-preservingly contained on a 1020 x 969 white canvas before the 2040 x 969 side-by-side comparison; the implementation was not scaled.
- State: light theme, live `web` profile, Runtime Overview selected. Loader reports 170 plugins, Fibers 188 fibers, and Services 67 unique registered services / 67 implementations.

## Full-view comparison evidence

- The accepted Runtime Overview header, runtime-status block, four core metrics, card radius, border, shadow, typography, pale-blue motif, and spacing rhythm are preserved.
- Three equal-width diagnostic cards replace the duplicate Plugins, Fibers, and Active metric tiles.
- Each card presents Pending, Active, Disposed, and Failed in the agreed order, then one Type x Status stacked horizontal bar chart.
- At 1020 x 969 all three cards, legends, totals, and persistent navigation remain visible without horizontal overflow, clipping, or overlap.

## Focused-region evidence

A separate focused crop was not required because the three cards occupy the lower half of the native 1020 x 969 capture and their labels, controls, segments, totals, and legends are readable at 1:1. Browser inspection additionally verified the custom Loader hover detail and its recovery after pointer leave.

## Required fidelity surfaces

- Fonts and typography: existing DSH font tokens, heading weights, metric scale, compact labels, numeric alignment, wrapping, and hierarchy are preserved.
- Spacing and layout rhythm: equal grid tracks, 14 px gaps, shared padding, aligned status summaries, and consistent chart rows preserve the existing density.
- Colors and tokens: the four lifecycle states use the existing success, warning, tertiary-label, and error tokens. Disposed resolves to a distinct neutral gray.
- Image quality and asset fidelity: no product imagery is required. Status icons use the installed Heroicons family and charts use Recharts; no custom SVG, emoji, or placeholder asset was added.
- Copy and content: Chinese and English labels are complete. Loader, Fiber, and Service totals have explicit units, and Services distinguishes unique registrations from implementations.

## Findings

- No actionable P0, P1, or P2 visual differences remain.
- No P3 polish issue remains that justifies additional density or decoration in this iteration.

## Interaction and accessibility review

- Hovering a stacked segment opens its category/status tooltip; pointer leave removes it.
- Clicking Loader `Disposed 32` opens Runtime Graph with Disposed selected and 32 matching nodes.
- Clicking Loader Core/Active applies both Core and Active and shows nine matching live nodes.
- Status cells are semantic buttons, regions have accessible names, Recharts accessibility is enabled, and animation is disabled.
- A clean-tab browser run produced no console errors.

## Comparison history

- Pass 1: Disposed segments resolved to solid black and weakened lifecycle semantics. The series and summary number were changed to the established tertiary-label token.
- Pass 2: Disposed resolved to `rgb(129, 133, 140)`; the full-view comparison found no remaining P0/P1/P2 issue.

## Runtime Graph type-filter result count

- Source visual truth: the current-task Browser annotation of the 1020 x 969 Runtime Graph with `Active` status and `Extension` type selected.
- Implementation evidence: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-type-filter-count-final.png`.
- The new focus bar reuses the selected-node focus treatment and reports `当前显示 58 / 170` for the accepted live snapshot, so it is visually consistent without adding a competing control pattern.
- The numerator is the actual canvas result after type, lifecycle-status, and search filters; searching `jobs` changed it to `2 / 170`. The denominator remains the complete runtime graph node count.
- `清除类型筛选` removes only the type constraint. The active lifecycle filter remains applied, the bar disappears, and 138 active nodes are restored.
- At the target viewport the bar, four summary cards, graph legends, nodes, and zoom controls remain visible without overlap or clipping. A clean-tab run produced no console errors.
- No actionable P0, P1, P2, or P3 visual difference remains for this change.

final result: passed

---

# Runtime Overview Services compact alignment QA

## Comparison setup

- Source visual truth: the current-task Browser annotation and the previous implementation capture `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-semantics-final.png`.
- Implementation screenshot: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-aligned-final.jpg`.
- Combined comparison: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-before-after.png`.
- Viewport and density: both comparison captures are 1280 x 720 pixels from the same Codex in-app Browser viewport; neither side was scaled before the comparison.
- State: light theme, live `web` profile, Runtime Overview selected.

## Visual evidence

- The `注册情况` heading and its three metric cells are removed. Services now starts with `提供者 Fiber 状态`, followed by the existing provider-type distribution.
- Loader, Fibers, and Services use one stretched grid row. Browser geometry measured all three cards at top 485, bottom 925, and height 440 CSS pixels, so their top and bottom edges align exactly.
- Typography, status colors, chart labels, card padding, borders, radii, shadows, and overview spacing continue to use the accepted DSH tokens. No adjacent layout or navigation changed.
- No imagery or custom icon work was introduced; existing Heroicons and Recharts assets remain unchanged.
- Copy remains concept-specific: the card total is `服务名`, while lifecycle labels are explicitly scoped to the provider Fiber.

## Interaction and accessibility review

- Services remains a labelled article, `提供者 Fiber 状态` remains a heading and accessible status list, and the registration definition list is absent.
- Clicking Services `活跃 67` opens Runtime Graph with the Active filter selected.
- The final browser log check returned no console entries.

## Findings and comparison history

- Pass 1: the previous card had an unnecessary registration summary and exceeded the other cards' height.
- Pass 2: the registration block was removed and the distribution grid was changed from start alignment to stretch. The post-fix capture and measured geometry show no remaining P0, P1, P2, or P3 issue.

final result: passed

---

# Runtime Overview Services semantic model QA

## Comparison setup

- Source visual truth: the current-task Browser annotation of the previous Services card, plus `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-overview-final-1020.png` for the accepted Runtime Overview visual system.
- Implementation screenshot: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-semantics-final.png`.
- Viewport and density: 1280 x 720 CSS pixels at device-pixel-ratio 2. The source acceptance capture is 1020 x 969, so comparison used the native screenshots rather than scaling either surface.
- State: light theme, live `web` profile, Runtime Overview selected. Services reports 67 service names, 67 scoped implementations, zero extra scoped implementations, and 67 active provider Fibers.

## Semantic and visual evidence

- The card now separates the Cordis concepts into `注册情况` and `提供者 Fiber 状态`; it no longer implies that a registered service owns an independent four-state lifecycle.
- Registration facts show unique service names, scoped implementations, and the exact derived difference between the two. Provider health shows only Pending, Active, and Failed; Disposed providers are excluded from the live registration snapshot and therefore are not rendered as a Service status.
- Typography, spacing, borders, radii, shadows, chart rows, status colors, and the three-column overview grid reuse the accepted DSH tokens and hierarchy. The compact three-cell registration summary remains readable and does not overlap at the tested viewport.
- The view uses the existing Heroicons and Recharts dependencies. No custom illustration, placeholder asset, emoji icon, or bespoke SVG was added.
- Chinese labels are concept-first and concise; matching English locale entries are present.

## Interaction and accessibility review

- The registration group is exposed as a semantic definition list, and provider health remains a labelled list of buttons.
- Clicking `活跃 67` opens Runtime Graph with the Active lifecycle filter selected, preserving the established overview-to-diagnostic workflow.
- A fresh-tab browser run rendered the final Services model without runtime or console errors.

## Findings and comparison history

- Pass 1 exposed a runtime schema-version mismatch after adding a new snapshot field. The UI was changed to derive `额外作用域实现` exactly from existing service-name and implementation counts, and the dependent remote schema bundle was rebuilt after the runtime package.
- Pass 2 rendered the final model cleanly. No actionable P0, P1, P2, or P3 visual or semantic issue remains.

final result: passed

## Final accepted Services layout

- This supersedes the registration layout described immediately above: `注册情况` and its metric cells are no longer rendered.
- The accepted Services card contains its service-name total, provider Fiber status, and provider-type distribution only.
- Loader, Fibers, and Services each measure 440 CSS pixels high with identical top and bottom coordinates in the final browser capture.
- Final evidence: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-aligned-final.jpg`.

final result: passed

# Runtime Overview Services legend alignment QA

- Source visual truth: the current-task Browser annotation identified the Services status legend as vertically higher than the Loader and Fibers legends; `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-overview-final-1020.png` preserves the accepted three-card visual system.
- Implementation screenshot: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-legend-aligned-visible-final.jpg`.
- Combined source and implementation comparison: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-legend-comparison.jpg`.
- State: light theme, live `web` profile, Runtime Overview selected. Browser inspection reported no console errors.

## Alignment evidence

- Loader, Fibers, and Services share the same card bottom at 912 CSS pixels.
- All three status legends share the same top at 869 CSS pixels, bottom at 893 CSS pixels, and 19 CSS pixel gap to the card bottom.
- The cards now use a vertical flex layout, each chart section consumes the remaining height, and the legend is anchored to the bottom of that section.
- Copy, metrics, charts, status colors, icons, and click behavior are unchanged.

## Findings

- P2 fixed: the Services legend no longer floats above the Loader and Fibers legends.
- No remaining actionable P0, P1, P2, or P3 visual issue was found in the focused comparison.

final result: passed

# Runtime Overview Context composition and copy QA

- Source visual truth: the current-task Browser annotations and the pre-change Runtime Overview capture at `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-services-legend-aligned-final.jpg`.
- Implementation screenshot: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-context-composition-final.jpg`.
- Combined full-view comparison: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-context-copy-comparison.jpg`.
- Viewport and density: both captures are 1280 x 720 pixels in the same light-theme `web` profile and Runtime Overview state.

## Semantic and visual evidence

- Cordis does not expose a closed Context type enum. The current diagnostic definition is exact and source-backed: one Root Context plus one Context owned by every live plugin Fiber.
- The Context card retains the 189 total and now shows the concrete composition `Root 1` and `Fiber 188`; no inferred or fabricated subtype taxonomy is presented.
- The technical noun card is renamed from `Loader` to `Plugins`, while its Loader-projected plugin status and type data remain unchanged.
- Navigation copy is shortened to `总览` / `Overview` and clarified to `关系图谱` / `Relationship Graph` without changing routes or interaction behavior.
- The Context composition fits the existing metric-card footprint. Typography, tokens, grid spacing, chart layout, status colors, icons, and the three distribution cards remain visually stable.

## Interaction and findings

- The Overview to Relationship Graph tab transition rendered the runtime dependency graph, and returning to Overview preserved the updated dashboard.
- Browser console logs were empty after both navigation states.
- No actionable P0, P1, or P2 mismatch remains. The compact Root/Fiber labels are intentionally secondary to the total and remain readable at the captured viewport.

final result: passed

# Runtime Overview Context readability QA

- Source visual truth: the current-task Browser annotation and the prior implementation capture at `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-context-composition-final.jpg`.
- Revised implementation: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-context-readable-final.jpg`.
- Focused before-and-after comparison: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-context-readability-comparison.jpg`.
- Both captures are 1280 x 720 pixels in the same light-theme `web` profile and Runtime Overview state.

## Findings and resolution

- P2 fixed: the previous side-by-side arrangement compressed Root and Fiber into two 8-pixel rows that were difficult to scan.
- The revised card uses a clear two-level hierarchy: title and total share the top row, while Root and Fiber occupy two equal-width blocks below.
- Composition labels increased to 10 pixels and values to 11 pixels, with stronger spacing, borders, and background contrast. The 189 total remains the primary visual anchor.
- The card retains the original footprint, so the four-metric grid and the Plugins, Fibers, and Services layout do not move.
- Fonts, spacing rhythm, DSH color tokens, copy, assets, icons, and interaction behavior were checked; no unrelated surface changed.
- Browser console logs remained empty. No actionable P0, P1, or P2 issue remains in the focused comparison.

final result: passed

# Runtime Overview metric order QA

- Source visual truth: the current-task Browser annotation and the pre-change capture at `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-context-readable-final.jpg`.
- Implementation screenshot: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-metrics-effects-turns-order-final.jpg`.
- Full-view comparison: `/Users/howard/.codex/visualizations/2026/08/19/01a01913-b06a-7520-b941-3459dbc00516/runtime-metrics-order-comparison.jpg`.
- Viewport and normalization: both source and implementation are 1280 x 720 pixel browser captures in the same light-theme `web` profile and Runtime Overview state; the comparison places the native captures side by side without density rescaling.
- Focused comparison was unnecessary because the only requested change is clearly readable in the full-width four-card metric row.

## Findings and resolution

- P2 fixed: the metric order is now `Contexts`, `Effects`, `轮次`, `事件`, so Effects and Turns have exchanged positions exactly as annotated.
- Card size, typography, spacing, colors, decorative treatment, copy, numeric data, and the distribution-card layout remain unchanged. The only expected dynamic difference is runtime uptime.
- The existing icon and asset treatment is unchanged; no replacement or generated asset was introduced.
- Browser semantics expose the same order as the visible row, and browser console logs are empty.
- No actionable P0, P1, P2, or P3 issue remains in the comparison.

final result: passed

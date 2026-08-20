# dsh-runtime

`dsh-runtime` is a read-only Runtime Explorer for DeepSeek Harness. It ships as
two DSH plugins: a Host gateway that projects Cordis runtime state and
privacy-safe session-event metadata, plus a Web client that renders the graph
and request trace. The overview also exposes per-plugin Effect activity as
Current, Delta, Churn, trend, and bounded recent lifecycle transitions.

## Packages

- `packages/runtime`: `@deepseek-ai/dsh-runtime`, the Host snapshot gateway.
- `packages/ui-runtime`: `@deepseek-ai/dsh-client-ui-runtime`, the Web UI.

## Current development baseline

Version 0.1.0 was extracted from DeepSeek Harness commit `141eb6fef8` and was
validated against the local Harness `0.1.0-rc.8` package family. npm currently
exposes only the older `0.0.1-rc.1` DSH family, so source builds and tests must
run in a sibling checkout of the matching Harness baseline for now. The
prebuilt `lib/` artifacts are committed so the first repository snapshot is
inspectable and packable without pretending that the old npm family is
compatible.

See [integration/README.md](integration/README.md) for the exact integration
boundary.

## Verification

```sh
npm run verify
npm run pack:dry-run
```

The feature suite is kept with each package under `tests/` and is executed in
the matching Harness checkout.

## Privacy boundary

The trace stores metadata only: session id, event type, sequence, time, lane,
turn, step, call id, tool name, outcome, and serialized payload size. Prompt
text, model output, tool arguments, tool results, and failure messages are not
exposed by the runtime snapshot.

## License

MIT

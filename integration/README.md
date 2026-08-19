# DeepSeek Harness integration

The 0.1.0 plugin was validated with a sibling `deepseek-harness` checkout at
commit `141eb6fef8`.

1. Place or link `packages/runtime` at `packages/extensions/runtime`.
2. Place or link `packages/ui-runtime` at `packages/client/ui-runtime`.
3. Add both package names to the Web app assembly dependencies.
4. Add the entries from `cordis.patch.fragment.yml` to the Host and Client
   plugin groups respectively.
5. Mount `@deepseek-ai/dsh-runtime/remote` in the Client Remote assembly and
   re-export the snapshot types from `@deepseek-ai/dsh-runtime/types`.
6. Provide the selected launch profile through the optional `launchProfile`
   Cordis service if the header should display the exact active profile.
7. Add both package projects and their source aliases to the Host/Client
   TypeScript aggregate configs.

The plugin remains usable when `launchProfile` is absent; the profile badge is
simply omitted. The Remote mount is required for snapshots and tracing.

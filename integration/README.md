# DeepSeek Harness integration

`dsh-runtime` is an independent Profile Bundle. The package owns all four
integration surfaces: the Host gateway, Web client, generated Remote
contribution, and `cordis.patch.yml` layer.

## Install

After a compatible release is available on npm:

```sh
dsh plugin --profile web add @howardchan/dsh-runtime
```

Restart the Web profile after installation. Removing the package withdraws its
Host gateway and Web surface on the next restart.

For a local checkout, assemble and pack the package first, then pass the
resulting tarball to the same `dsh plugin` command. The source repository does
not need to be copied into Harness.

## Compatibility boundary

Version `0.1.0` was validated against the local DSH `0.1.0-rc.8` package
family. npm currently exposes only the older `0.0.1-rc.1` DSH family, so the
public installation command above is a release target, not a claim that the
older family is compatible.

The Web client mounts its own generated `runtimeExplorer` Remote contribution
when no compatible aggregate has already mounted it. This keeps existing
Harness assemblies working while removing the need to edit
`@deepseek-ai/dsh-api-remotes` for independent installation.

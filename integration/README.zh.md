# DeepSeek Harness 接入

`dsh-runtime` 是独立的 Profile Bundle。一个包完整持有四个接入面：Host 网关、
Web 客户端、生成的 Remote contribution 和 `cordis.patch.yml` 配置层。

## 安装

兼容版本发布到 npm 后执行：

```sh
dsh plugin --profile web add @howardchan/dsh-runtime
```

安装后重启 Web profile。移除该包后，它的 Host 网关和 Web 界面会在下一次
启动时一并撤出。

本地检出场景先组装并打包，再把生成的 tarball 传给同一条 `dsh plugin`
命令；不需要把源码复制进 Harness。

## 兼容边界

`0.1.0` 已在本地 DSH `0.1.0-rc.8` 包族上验证。npm 当前公开的仍是较旧的
`0.0.1-rc.1` 包族，因此上面的公开安装命令是发布目标，不代表旧包族兼容。

如果现有聚合层尚未挂载兼容服务，Web 客户端会自行挂载生成的
`runtimeExplorer` Remote contribution。这样既兼容现有 Harness 组装，也不再
要求为独立安装修改 `@deepseek-ai/dsh-api-remotes`。

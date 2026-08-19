# dsh-runtime

`dsh-runtime` 是 DeepSeek Harness 的只读 Runtime Explorer，由两个 DSH
插件包组成：Host 侧负责投影 Cordis 运行时状态和隐私安全的 Session 事件元数据，
Web 侧负责渲染插件依赖图与请求追踪。

## 包结构

- `packages/runtime`：`@deepseek-ai/dsh-runtime`，Host 快照网关。
- `packages/ui-runtime`：`@deepseek-ai/dsh-client-ui-runtime`，Web 界面。

## 当前开发基线

首版 `0.1.0` 从 DeepSeek Harness 提交 `141eb6fef8` 抽取，并在本地 Harness
`0.1.0-rc.8` 包族上验证。npm 当前公开的 DSH 包仍是较旧的
`0.0.1-rc.1`，因此现阶段源码构建和测试需要在同级、同基线的 Harness
仓库中执行。仓库提交了已经验证的 `lib/` 构建产物，使首版可以审阅和打包，
同时不会把旧 npm 依赖伪装成兼容版本。

准确的接入边界见 [integration/README.zh.md](integration/README.zh.md)。

## 验证

```sh
npm run verify
npm run pack:dry-run
```

两个包的 `tests/` 保留了功能测试，并在匹配的 Harness 工作区内执行。

## 隐私边界

请求追踪只保存元数据：Session id、事件类型、序号、时间、泳道、Turn、Step、
Call id、工具名、结果状态和序列化后的载荷长度。Runtime 快照不会暴露提示词、
模型输出、工具参数、工具结果或失败消息。

## 许可证

MIT

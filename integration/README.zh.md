# DeepSeek Harness 接入

首版 `0.1.0` 已在同级 `deepseek-harness` 仓库的 `141eb6fef8` 提交上验证。

1. 将 `packages/runtime` 放置或链接到 `packages/extensions/runtime`。
2. 将 `packages/ui-runtime` 放置或链接到 `packages/client/ui-runtime`。
3. 把两个包名加入 Web app assembly 的依赖。
4. 将 `cordis.patch.fragment.yml` 中的两个条目分别加入 Host 和 Client 插件组。
5. 在 Client Remote assembly 中挂载 `@deepseek-ai/dsh-runtime/remote`，并从
   `@deepseek-ai/dsh-runtime/types` 重新导出快照类型。
6. 若顶部需要显示准确的当前 Profile，通过可选的 `launchProfile` Cordis
   service 提供启动 Profile。
7. 将两个包的工程引用和源码别名加入 Host/Client TypeScript 聚合配置。

缺少 `launchProfile` 时插件仍可运行，只是不显示 Profile 标签；Remote 挂载则是
快照和请求追踪正常工作的必要条件。

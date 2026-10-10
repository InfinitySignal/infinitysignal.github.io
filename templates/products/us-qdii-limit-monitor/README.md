# 美股QDII限额实时监控模板

`monitor.html` 仅作为仓库内的 HTML 模板。`templates/` 不属于 Astro 的公开资源目录或页面目录，因此不会发布到官网，也不会出现在产品的 HTML 文件列表中。

自动生成流程可读取此模板，填入以下区域：

- `#updated-at`：更新日期时间。
- `#latest-changes`：最新变更列表。
- `#monitor-rows`：完整监控表的表格行。渠道之间使用 `<br />` 换行。

填入真实数据后移除 `#sample-note`。需要发布时，将生成的 HTML 写入 `public/products/us-qdii-limit-monitor/items/`，并重新构建、部署网站。

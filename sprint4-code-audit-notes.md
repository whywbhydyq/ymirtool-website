# ymirtool.com Sprint 4 代码审计记录

日期：2026-06-01  
输入包：`ymirtool-website-sprint3-case-content.zip`  
执行方式：本地解包后直接审计静态 HTML、sitemap、robots、结构化数据和广告脚本。未运行 `npm run build`，未运行测试。

## 1. 审计判断

当前包是静态导出包，不是源码构建态项目。根目录未发现可用于重新生成站点的 `package.json` 或构建配置链，因此本轮继续在静态 HTML 层做可追踪补丁。

本轮重点不再继续扩写核心工具或新增文章，而是执行执行计划中的 Sprint 4：

1. 强化 About、Privacy、Terms、Disclaimer、Contact 等信任页。
2. 清理上一轮脚本留下的可见生成痕迹。
3. 加入 Breadcrumb、FAQ、WebApplication 等结构化数据。
4. 检查 AdSense 所有权 meta、广告脚本、ads.txt、robots、sitemap、canonical 和 noindex/广告关系。
5. 生成最终 AdSense 复审前静态审计报告。

## 2. 初始发现

从 Sprint 3 包审计到以下问题：

- 信任页没有广告脚本，这是正确状态。
- `noindex` 页面没有加载 AdSense，这是正确状态。
- sitemap 中没有指向 noindex 页面，这是正确状态。
- 大量可索引页缺少 `BreadcrumbList` 结构化数据。
- 部分已有 FAQ 的页面缺少 `FAQPage` JSON-LD。
- `sitemap.xml` 首页 URL 使用 `https://ymirtool.com`，已统一为 `https://ymirtool.com/`。
- 多个页面残留 `data-review-hardening`、`data-last-mile-depth` 或 `Additional review notes` 这类执行痕迹，需要清理。
- Contact 和 Disclaimer 在首次改写后低于内部 800 有效内容阈值，已追加具体反馈流程和复核边界说明。

## 3. 已执行修改

### 3.1 信任页重写

重写并扩展以下页面：

- `about.html`
- `privacy.html`
- `terms.html`
- `disclaimer.html`
- `contact.html`

重写方向：

- 改为中文为主，保留必要英文产品名。
- 明确工具范围、维护原则、用户责任、输入边界、广告和 Cookie 说明。
- Privacy 页面补充工具输入内容、Cookie、Google AdSense、用户选择、第三方链接和儿童隐私。
- Terms 页面补充服务性质、用户责任、禁止行为、广告服务、结果复核和变更规则。
- Disclaimer 页面补充工具输出不是最终结论、常见误用边界和发布前复核步骤。
- Contact 页面补充适合反馈的问题类型、脱敏要求、反馈模板和处理优先级。

### 3.2 结构化数据

新增或确认以下结构化数据：

- `BreadcrumbList`：48 个可索引非首页页面。
- `FAQPage`：22 个确实有可见 FAQ/常见问题内容的页面。
- `WebApplication`：10 个核心工具页。
- `WebSite`：首页。
- `Organization`：首页。

未在没有可见 FAQ 的页面强行添加 FAQ 结构化数据，避免结构化数据和页面内容不一致。

### 3.3 Sitemap / robots / canonical

- `sitemap.xml` 保留首页和 10 个核心工具页。
- `sitemap-guides.xml` 保留 33 个指南和案例页。
- `sitemap-policy.xml` 保留 5 个信任/政策页。
- `robots.txt` 继续声明 3 个 sitemap。
- 修复首页 sitemap URL 尾斜杠。
- 去除 sitemap 重复 URL。
- canonical 与页面 URL 对齐。

### 3.4 广告和索引面

- 继续保持广告脚本只存在于可索引内容页。
- 继续不在 About、Privacy、Terms、Disclaimer、Contact、404 页面加载广告脚本。
- 继续不在 163 个 noindex 长尾页面加载广告脚本。
- 所有 HTML 页面保留 `google-adsense-account` 所有权 meta。
- 根目录保留 `ads.txt`。

### 3.5 生成痕迹清理

清理内容：

- 删除可见 `data-last-mile-depth` 兜底段落。
- 删除 `data-review-hardening` 内部属性。
- 将 noindex 辅助指南中的英文 `Additional review notes` 段落改写为中文“使用前复核说明”。
- 清除 BeautifulSoup 重新序列化造成的 `</meta>` 关闭标签。

## 4. 最终审计摘要

详见包内 `sprint4-final-static-audit.json`。

关键结果：

- HTML 页面：212
- 可索引页面：49
- noindex 页面：163
- 加载 AdSense 页面：44
- noindex 页面加载 AdSense：0
- policy/trust/404 页面加载 AdSense：0
- 可索引页面低于 800 有效内容：0
- 广告页面低于 800 有效内容：0
- 内链缺失：0
- sitemap URL：49
- sitemap 重复 URL：0
- sitemap 指向 noindex URL：0
- 可索引 URL 未进入 sitemap：0
- JSON-LD 解析错误：0
- canonical 问题：0
- 残留 `</meta>`：0
- 残留生成标记：0

## 5. 未执行事项

- 未运行 `npm run build`。
- 未运行测试。
- 未开放 163 个长尾 noindex 页面。
- 未新增手动广告位。
- 未把结构化数据添加到没有可见对应内容的页面。

import { SITE } from "../config/site.mjs";
import {
	appendHtml,
	attr,
	escapeHtml,
	findAll,
	parse,
	serialize,
	textContent,
} from "./html.mjs";

export const MONITOR_PATH = "/products/us-qdii-limit-monitor/";
export const MONITOR_FILE =
	"/products/us-qdii-limit-monitor/items/monitor.html";
export const SAMPLE_PATH =
	"/products/a-share-morning-report/items/daily-brief.html";
export const REPORT_PATTERN =
	/^\/products\/us-risk-daily\/items\/(\d{4}-\d{2}-\d{2})_sp500_risk(_backtest)?\.html$/;

// Apply SEO to build output; the published financial content stays in its original language.
export function enhancePublishedHtml(html, pathname) {
	const doc = parse(html);
	const head = findAll(doc, (node) => node.tagName === "head")[0];
	const body = findAll(doc, (node) => node.tagName === "body")[0];
	const main = findAll(doc, (node) => node.tagName === "main")[0] || body;
	const titleNode = findAll(head, (node) => node.tagName === "title")[0];
	const originalTitle = titleNode
		? textContent(titleNode).replace(/\s*\| InfinitySignal$/, "")
		: SITE.title;
	const title = `${originalTitle} | ${SITE.title}`;
	const report = REPORT_PATTERN.exec(pathname);
	const monitor = pathname === MONITOR_PATH || pathname === MONITOR_FILE;
	const canonical = new URL(monitor ? MONITOR_PATH : pathname, SITE.url).href;
	const noindex = pathname === SAMPLE_PATH;
	const description = monitor
		? "跟踪美股 QDII 基金各渠道申购状态、限额及公告变更，查看最新变更、公告生效日期和数据来源。"
		: report
			? `${report[1]} 标普500${report[2] ? "风控策略回测报告，展示策略收益、回撤、风险调整后表现与买入持有对比。" : "风控日报，展示风险等级、综合风险分数、目标权益仓位及数据状态。"}`
			: noindex
				? `${originalTitle}。InfinitySignal 的示例页面，仅用于验证发布流程。`
				: `${originalTitle}。查看 InfinitySignal 发布的详细内容与数据。`;
	const metaNames = new Set([
		"description",
		"robots",
		"twitter:card",
		"twitter:title",
		"twitter:description",
		"twitter:image",
	]);
	const properties = new Set([
		"og:type",
		"og:url",
		"og:title",
		"og:description",
		"og:image",
		"og:site_name",
		"og:locale",
	]);
	head.childNodes = head.childNodes
		.filter((node) => node.nodeName !== "#text" || node.value.trim())
		.filter(
			(node) =>
				node.tagName !== "title" &&
				!(
					node.tagName === "meta" &&
					(metaNames.has(attr(node, "name")) ||
						properties.has(attr(node, "property")))
				) &&
				!(
					node.tagName === "link" &&
					["canonical", "alternate"].includes(attr(node, "rel"))
				) &&
				attr(node, "data-seo-generated") !== "true"
		);
	const image = new URL(SITE.ogImage, SITE.url).href;
	const meta = (name, value, property = false) =>
		`<meta ${property ? "property" : "name"}="${name}" content="${escapeHtml(value)}">`;
	appendHtml(
		head,
		`<title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${canonical}">
    ${meta("description", description)}
    ${meta("robots", noindex ? "noindex, follow" : "index, follow")}
    ${meta("og:type", report ? "article" : "website", true)}
    ${meta("og:url", canonical, true)}${meta("og:title", title, true)}
    ${meta("og:description", description, true)}${meta("og:image", image, true)}
    ${meta("og:site_name", SITE.title, true)}${meta("og:locale", "zh_CN", true)}
    ${meta("twitter:card", "summary_large_image")}${meta("twitter:title", title)}
    ${meta("twitter:description", description)}${meta("twitter:image", image)}`
	);
	main.childNodes = main.childNodes.filter(
		(node) => attr(node, "data-seo-generated") !== "true"
	);
	appendHtml(
		main,
		`<nav data-seo-generated="true" aria-label="相关页面" style="margin-bottom:20px;font-size:14px;line-height:1.8">
    <a href="/">InfinitySignal 首页</a> · <a href="/products/">产品</a>
    ${report ? ' · <a href="/products/us-risk-daily/">美股风控日报</a> · <a href="/docs/美股标普500三维五因子风控策略/">策略说明</a>' : ""}
    </nav>`,
		true
	);
	if (!noindex) {
		const schema = {
			"@context": "https://schema.org",
			"@type": report ? "Article" : "WebPage",
			"@id": `${canonical}#content`,
			url: canonical,
			headline: originalTitle,
			description,
			inLanguage: "zh-CN",
			publisher: {
				"@type": "Organization",
				"@id": `${SITE.url}/#organization`,
				name: SITE.title,
				url: SITE.url,
			},
		};
		appendHtml(
			head,
			`<script type="application/ld+json" data-seo-generated="true">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`
		);
	}
	return serialize(doc);
}

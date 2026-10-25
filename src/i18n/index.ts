export type Locale = "zh-CN" | "en";

export const messages = {
	"zh-CN": {
		maintainedBy: "维护方：",
		publishedAt: "发布于",
		updatedAt: "更新于",
		showcase: "产品与工具",
		allProducts: "查看全部产品",
		home: "首页",
		products: "产品",
		docs: "研究与文档",
		contact: "联系我们",
		links: "快速链接",
		connect: "关注与联系",
		email: "电子邮箱",
		rights: "保留所有权利。",
		mainNav: "主导航",
		homeLabel: "InfinitySignal - 首页",
		toggleMenu: "展开或收起菜单",
		githubLabel: "访问 GitHub（在新标签页中打开）",
		skip: "跳转到正文",
		logo: "标志",
		language: "选择语言",
		filing: "在工信部备案管理系统查询沪ICP备2026038103号-1（在新标签页中打开）",
		homeTitle: "InfinitySignal｜人工智能、数据洞察与金融科技",
		tagline: "从复杂信息中，发现有价值的信号",
		headline: "用 AI 探索数据，让信息创造价值",
		introduction:
			"InfinitySignal 专注于人工智能、数据挖掘与金融科技，构建连接信息、洞察与行动的工具和产品。",
		description:
			"InfinitySignal 专注于人工智能、数据挖掘与金融科技，通过 AI 与数据分析探索复杂信息中的有价值信号，打造实用的工具、产品与研究项目。",
		explore: "探索产品",
		ai: "人工智能",
		insights: "数据洞察",
		fintech: "金融科技",
		aiDescription: "探索 AI 在信息处理、分析与自动化中的应用。",
		insightsDescription: "汇集分散信息，提取线索，发现变化与趋势。",
		fintechDescription:
			"将 AI 与数据能力应用于金融信息追踪、市场研究和风险分析。",
		productsDescription: "探索 InfinitySignal 的产品、工具与研究成果。",
		noProducts: "暂无已发布的产品。",
		noProductsDescription: "新产品发布后将在这里展示。",
		backProducts: "返回产品列表",
		reports: "已发布报告",
		noReports: "暂无已发布的报告。",
		noReportsDescription: "最新报告发布后将在这里展示。",
		docsDescription: "浏览 InfinitySignal 的研究项目、策略说明与产品文档。",
		projects: "项目",
		viewDocs: "查看项目文档",
		backDocs: "返回研究与文档",
		browseDocs: "浏览本项目的相关文档。",
		contactTitle: "联系我们",
		contactIntroduction:
			"欢迎交流想法、反馈问题或探讨合作，请通过以下方式联系我们。",
		contactDescription:
			"联系 InfinitySignal，交流人工智能、数据洞察与金融科技相关想法及合作机会。",
		dailyReport: "标普500风控日报",
		backtestReport: "标普500风控策略回测",
		originalLanguage: "动态报告和监控页面保留原语言。",
	},
	en: {
		maintainedBy: "Maintained by",
		publishedAt: "Published",
		updatedAt: "Updated",
		showcase: "Products & Tools",
		allProducts: "View All Products",
		home: "Home",
		products: "Products",
		docs: "Research & Documentation",
		contact: "Contact",
		links: "Quick Links",
		connect: "Connect",
		email: "Email",
		rights: "All rights reserved.",
		mainNav: "Main Navigation",
		homeLabel: "InfinitySignal - Home",
		toggleMenu: "Toggle Menu",
		githubLabel: "Visit GitHub (opens in a new tab)",
		skip: "Skip to Main Content",
		logo: "logo",
		language: "Select Language",
		filing: "View ICP registration 沪ICP备2026038103号-1 (opens in a new tab)",
		homeTitle: "InfinitySignal | AI, Data Insights & Fintech",
		tagline: "Transforming Chaos into Clear Signal",
		headline: "Explore Data with AI. Turn Information into Value.",
		introduction:
			"InfinitySignal focuses on artificial intelligence, data mining, and fintech, building tools and products that connect information, insights, and action.",
		description:
			"InfinitySignal explores AI, data mining, and fintech to uncover valuable signals in complex information and build practical tools, products, and research projects.",
		explore: "Explore Products",
		ai: "Artificial Intelligence",
		insights: "Data Insights",
		fintech: "Fintech",
		aiDescription:
			"Exploring how AI can support information processing, analysis, and automation.",
		insightsDescription:
			"Bringing scattered information together to uncover signals, changes, and trends.",
		fintechDescription:
			"Applying AI and data analysis to financial information tracking, market research, and risk analysis.",
		productsDescription:
			"Explore InfinitySignal’s products, tools, and research outputs.",
		noProducts: "No products published yet.",
		noProductsDescription: "New products will appear here when available.",
		backProducts: "Back to Products",
		reports: "Published Reports",
		noReports: "No reports published yet.",
		noReportsDescription: "New reports will appear here when available.",
		docsDescription:
			"Explore InfinitySignal’s research projects, strategy notes, and product documentation.",
		projects: "Projects",
		viewDocs: "View Project Documentation",
		backDocs: "Back to Research & Documentation",
		browseDocs: "Browse documentation for this project.",
		contactTitle: "Contact Us",
		contactIntroduction:
			"Get in touch to share ideas, report issues, or discuss collaboration.",
		contactDescription:
			"Contact InfinitySignal to discuss ideas and collaboration in AI, data insights, and fintech.",
		dailyReport: "S&P 500 Daily Risk Report",
		backtestReport: "S&P 500 Risk Management Strategy Backtest",
		originalLanguage:
			"Dynamic reports and monitoring pages are available in their original language.",
	},
} as const;

export function getLocale(url: URL): Locale {
	return url.pathname === "/en" || url.pathname.startsWith("/en/")
		? "en"
		: "zh-CN";
}

export function localizedPath(path: string, locale: Locale): string {
	const unprefixed = path.replace(/^\/en(?=\/|$)/, "") || "/";
	const normalized = unprefixed.endsWith("/") ? unprefixed : `${unprefixed}/`;
	return locale === "en" ? `/en${normalized}` : normalized;
}

export function getTranslations(url: URL) {
	const locale = getLocale(url);
	const t = messages[locale];
	const path = (value: string) => localizedPath(value, locale);
	return { locale, t, path };
}

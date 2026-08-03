(() => {
	// external data
	const PROJECT_NAME = "placeholder";
	const NAME = "placeholder";
	const now = new Date();
	const domain = window.location.hostname;
	const url = window.location.href;
	const documentTitle = document.title;
	const documentUrl = document.URL;

	// pure functions
	const cond = (cases, fallback) => (x) => {
		const found = cases.find(([test]) => test(x));
		return (found ? found[1] : fallback)();
	};
	const isScrapboxDomain = (d) => d.toLowerCase().endsWith("scrapbox.io");
	const isTwitterDomain = (d) => d.toLowerCase().endsWith("x.com");
	const twitterUrl = (defaultText, dt, du) => {
		try {
			return [
				">",
				`[@${du.match(/x.com\/([^\/]*)/)[1]} ${du}]:`,
				dt.match(/さん: 「(.*)」 \/ X/)[1],
			].join(" ");
		} catch (e) {
			return defaultText;
		}
	};
	const scrapboxUrl = (pn, dt, du) => {
		const regexp = /(.*) - .*/;
		const match = dt.match(regexp);
		const pageTitle = match[1];
		const projectName = du.split("/")[3];
		return projectName === pn
			? `[${pageTitle}]`
			: `[/${projectName}/${pageTitle}]`;
	};
	const isImslpDomain = (d) => d.toLowerCase().endsWith("imslp.org");
	const imslpUrl = (dt, du) =>
		`[${dt.replace(/(.* - IMSLP)\/ペトルッチ楽譜ライブラリー: パブリックドメインの無料楽譜/, "$1")} ${du}]`;
	const isYodobashiDomain = (d) => d.toLowerCase().endsWith("yodobashi.com");
	const yodobashiUrl = (dt, du) =>
		`[${dt.replace(/ヨドバシ\.com - (.*) 通販【全品無料配達】/, "$1 - yodobashi")} ${du}]`;
	const isFindyDomain = (d) => d.toLowerCase().endsWith("findy-code.io");
	const findyUrl = (dt, du) =>
		`[${dt.replace(/(.*) \| IT\/Webエンジニアの転職・求人サイトFindy – GitHubからスキル偏差値を算出/, "$1 - Findy")} ${du}]`;
	const thisWeekTaskPage = (name, now) => {
		const thisMonday = new Date(now).setDate(now.getDate() - now.getDay() + 1);
		const formattedThisMonday = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Tokyo",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(thisMonday);
		const pageTitle = `${name}'s Task ${formattedThisMonday}週`;
		return pageTitle;
	};

	const title = documentTitle
		.replaceAll("[", "")
		.replaceAll("]", "")
		.replaceAll("`", " ");
	const body = encodeURIComponent(
		cond(
			[
				[
					isScrapboxDomain,
					() => scrapboxUrl(PROJECT_NAME, documentTitle, documentUrl),
				],
				[
					isTwitterDomain,
					() => twitterUrl(`[${title} ${url}]`, documentTitle, documentUrl),
				],
				[isImslpDomain, () => imslpUrl(title, documentUrl)],
				[isYodobashiDomain, () => yodobashiUrl(title, documentUrl)],
				[isFindyDomain, () => findyUrl(title, documentUrl)],
			],
			() => `[${title} ${url}]`,
		)(domain),
	);

	const pageTitle = thisWeekTaskPage(NAME, now);
	const cosenseUrl = `https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(pageTitle.trim())}?body=${body}`;
	window.open(cosenseUrl);
})();

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
		.replace("[", "")
		.replace("]", "")
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
			],
			() => `[${title} ${url}]`,
		)(domain),
	);

	const pageTitle = thisWeekTaskPage(NAME, now);
	const cosenseUrl = `https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(pageTitle.trim())}?body=${body}`;
	window.open(cosenseUrl);
})();

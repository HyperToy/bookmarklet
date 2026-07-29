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
	const isScrapboxDomain = (d) => d.toLowerCase().endsWith("scrapbox.io");
	const isTwitterDomain = (d) => d.toLowerCase().endsWith("x.com");
	const twitterUrl = (defaultText) => {
		try {
			return [
				">",
				`[@${document.URL.match(/x.com\/([^\/]*)/)[1]} ${document.URL}]:`,
				document.title.match(/さん: 「(.*)」 \/ X/)[1],
			].join(" ");
		} catch (e) {
			return defaultText;
		}
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
		isScrapboxDomain(domain)
			? ((pn, dt, du) => {
					const regexp = /(.*) - .*/;
					const match = dt.match(regexp);
					const pageTitle = match[1];
					const projectName = du.split("/")[3];
					return projectName === pn
						? `[${pageTitle}]`
						: `[/${projectName}/${pageTitle}]`;
				})(PROJECT_NAME, documentTitle, documentUrl)
			: isTwitterDomain(domain)
				? twitterUrl(`[${title} ${url}]`)
				: `[${title} ${url}]`,
	);

	const pageTitle = thisWeekTaskPage(NAME, now);
	const cosenseUrl = `https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(pageTitle.trim())}?body=${body}`;
	window.open(cosenseUrl);
})();

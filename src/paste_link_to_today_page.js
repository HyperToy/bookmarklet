(() => {
	// external data
	const PROJECT_NAME = "PROJECT_NAME";
	const domain = window.location.hostname;
	const url = window.location.href;
	const documentTitle = document.title;
	const documentUrl = document.URL;

	// pure functions
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

	const title = documentTitle
		.replace("[", "")
		.replace("]", "")
		.replaceAll("`", " ");
	const body = encodeURIComponent(
		isScrapboxDomain(domain)
			? scrapboxUrl(PROJECT_NAME, documentTitle, documentUrl)
			: isTwitterDomain(domain)
				? twitterUrl(`[${title} ${url}]`, documentTitle, documentUrl)
				: `[${title} ${url}]`,
	);
	const pageTitle = new Date().toLocaleDateString("sv-SE", {
		timeZone: "Indian/Maldives",
	});
	window.open(
		`https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(pageTitle.trim())}?body=${body}`,
	);
})();

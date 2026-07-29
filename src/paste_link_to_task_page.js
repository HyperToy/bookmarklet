(() => {
	const PROJECT_NAME = "placeholder";
	const NAME = "placeholder";
	const domain = window.location.hostname;
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
	const url = window.location.href;
	const title = document.title
		.replace("[", "")
		.replace("]", "")
		.replaceAll("`", " ");
	const body = encodeURIComponent(
		isScrapboxDomain(domain)
			? (() => {
					const regexp = /(.*) - .*/;
					const match = document.title.match(regexp);
					const pageTitle = match[1];
					const projectName = document.URL.split("/")[3];
					return projectName === PROJECT_NAME
						? `[${pageTitle}]`
						: `[/${projectName}/${pageTitle}]`;
				})()
			: isTwitterDomain(domain)
				? twitterUrl(`[${title} ${url}]`)
				: `[${title} ${url}]`,
	);

	const thisWeekTaskPage = (projectName, name, now) => {
		const thisMonday = new Date(now).setDate(now.getDate() - now.getDay() + 1);
		// const pageTitle = new Date().toLocaleDateString("sv-SE", {
		// 	timeZone: "Indian/Maldives",
		// });
		const formattedThisMonday = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Tokyo",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(thisMonday);
		const pageTitle = `${name}'s Task ${formattedThisMonday}週`;
		return pageTitle;
	};
	const pageTitle = thisWeekTaskPage(PROJECT_NAME, NAME, new Date());
	const cosenseUrl = `https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(pageTitle.trim())}?body=${body}`;
	window.open(cosenseUrl);
})();

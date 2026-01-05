(() => {
	const PROJECT_NAME = "PROJECT_NAME";
	const domain = window.location.hostname;
	const isScrapboxDomain = domain.toLowerCase().endsWith("scrapbox.io");
	const isTwitterDomain = () => domain.toLowerCase().endsWith("x.com");
	const twitterUrl = (defaultText) => {
		try {
			return [
				">",
				document.title.match(/「(.*)」/)[1],
				`(${document.title.match(/Xユーザーの(.*)さん: 「/)[1]}`,
				`[@${document.URL.match(/x.com\/([^\/]*)/)[1]} ${document.URL}])`,
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
		isScrapboxDomain
			? (() => {
					const regexp = /(.*) - .*/;
					const match = document.title.match(regexp);
					const pageTitle = match[1];
					const projectName = document.URL.split("/")[3];
					return projectName === PROJECT_NAME
						? `[${pageTitle}]`
						: `[/${projectName}/${pageTitle}]`;
				})()
			: isTwitterDomain()
				? twitterUrl(`[${title} ${url}]`)
				: `[${title} ${url}]`,
	);
	const pageTitle = new Date().toISOString().split("T")[0];
	window.open(
		`https://scrapbox.io/${PROJECT_NAME}/${encodeURIComponent(pageTitle.trim())}?body=${body}`,
	);
})();

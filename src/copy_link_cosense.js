(() => {
	const domain = window.location.hostname;
	const url = window.location.href;
	const documentTitle = document.title;
	const documentUrl = document.URL;
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

	const title = documentTitle
		.replace("[", "")
		.replace("]", "")
		.replaceAll("`", " ");
	const textToCopy = cond(
		[
			[isScrapboxDomain, () => `${url}`],
			[
				isTwitterDomain,
				() => twitterUrl(`[${title} ${url}]`, documentTitle, documentUrl),
			],
		],
		() => `[${title} ${url}]`,
	)(domain);
	navigator.clipboard.writeText(textToCopy).then(
		(data) => {
			const message = document.createElement("div");
			message.style.position = "fixed";
			message.style.bottom = "10px";
			message.style.right = "10px";
			message.style.padding = "10px";
			message.style.backgroundColor = "black";
			message.style.color = "white";
			message.style.zIndex = 10000;
			message.textContent = "Title and URL copied to clipboard";
			document.body.appendChild(message);
			setTimeout(() => {
				document.body.removeChild(message);
			}, 500);
		},
		(err) => {
			const errorMessage = document.createElement("div");
			errorMessage.style.position = "fixed";
			errorMessage.style.bottom = "10px";
			errorMessage.style.right = "10px";
			errorMessage.style.padding = "10px";
			errorMessage.style.backgroundColor = "red";
			errorMessage.style.color = "white";
			errorMessage.style.zIndex = 10000;
			errorMessage.textContent = `Could not copy text: ${err}`;
			document.body.appendChild(errorMessage);
			setTimeout(() => {
				document.body.removeChild(errorMessage);
			}, 500);
		},
	);
})();
